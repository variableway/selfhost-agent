use tauri::command;

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
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![greet, get_platform])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
