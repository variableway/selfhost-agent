use std::io::{Read, Write};
use std::sync::Mutex;
use tauri::{command, Emitter, Manager};
use portable_pty::{native_pty_system, PtySize, CommandBuilder, MasterPty};

struct AppState {
    master: Option<Box<dyn MasterPty + Send>>,
    writer: Option<Box<dyn Write + Send>>,
}

struct AppPtyState(Mutex<AppState>);

#[command]
fn pty_write(state: tauri::State<'_, AppPtyState>, data: String) -> Result<(), String> {
    let mut pty = state.0.lock().map_err(|e| e.to_string())?;
    if let Some(writer) = pty.writer.as_mut() {
        writer.write_all(data.as_bytes()).map_err(|e| e.to_string())?;
        writer.flush().map_err(|e| e.to_string())?;
    }
    Ok(())
}

#[command]
fn pty_resize(state: tauri::State<'_, AppPtyState>, rows: u16, cols: u16) -> Result<(), String> {
    let pty = state.0.lock().map_err(|e| e.to_string())?;
    if let Some(master) = pty.master.as_ref() {
        master.resize(PtySize {
            rows,
            cols,
            pixel_width: 0,
            pixel_height: 0,
        }).map_err(|e| e.to_string())?;
    }
    Ok(())
}

#[command]
fn greet(name: &str) -> String {
    format!("Hello, {}! Welcome to Innate Playground.", name)
}

#[command]
fn get_platform() -> String {
    let os = std::env::consts::OS.to_string();
    let arch = std::env::consts::ARCH.to_string();
    format!("{}-{}", os, arch)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_store::Builder::default().build())
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }

            // Spawn the persistent PTY session synchronously during setup
            let pty_system = native_pty_system();

            let pair = pty_system.openpty(PtySize {
                rows: 24,
                cols: 80,
                pixel_width: 0,
                pixel_height: 0,
            }).expect("Failed to open PTY");

            let cmd = if cfg!(windows) {
                CommandBuilder::new("cmd")
            } else {
                CommandBuilder::new("sh")
            };

            let _child = pair.slave.spawn_command(cmd)
                .expect("Failed to spawn shell");

            let mut reader = pair.master.try_clone_reader()
                .expect("Failed to clone PTY reader");
            let writer = pair.master.take_writer()
                .expect("Failed to take PTY writer");
            let master = pair.master;

            // Manage state — must be done during setup, not from a thread
            app.manage(AppPtyState(Mutex::new(AppState {
                master: Some(master),
                writer: Some(writer),
            })));

            // Spawn reader thread to stream PTY output to frontend
            let app_handle = app.handle().clone();
            std::thread::spawn(move || {
                let mut buf = [0u8; 4096];
                loop {
                    match reader.read(&mut buf) {
                        Ok(0) => break, // EOF
                        Ok(n) => {
                            let data = String::from_utf8_lossy(&buf[..n]);
                            let _ = app_handle.emit("pty-output", data.to_string());
                        }
                        Err(e) => {
                            if e.kind() == std::io::ErrorKind::BrokenPipe
                                || e.kind() == std::io::ErrorKind::UnexpectedEof
                            {
                                break;
                            }
                            let _ = app_handle.emit("pty-output", format!("\r\n[read error: {}]\r\n", e));
                            std::thread::sleep(std::time::Duration::from_millis(100));
                        }
                    }
                }
                let _ = app_handle.emit("pty-exit", "session ended");
            });

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![greet, get_platform, pty_write, pty_resize])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
