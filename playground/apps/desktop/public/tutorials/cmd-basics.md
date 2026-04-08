# 命令行 5 分钟入门

> 适用人群: 零基础初学者

## 什么是命令行？

命令行是一个**用文字控制电脑**的工具。就像和电脑对话，输入指令，电脑执行。

```
你输入: ls
电脑回复: Documents  Downloads  Pictures
```

---

## 基本概念

### 1. 提示符
```
pat@mac:~$
│   │   │
│   │   └── 当前位置 (~ = 用户主目录)
│   └────── 电脑名
└────────── 用户名
```

### 2. 路径
```
/                  根目录
/Users/pat         绝对路径（从根开始）
~/Documents        相对路径（~ = 用户主目录）
../                上一级目录
./                 当前目录
```

### 3. 命令格式
```
命令 [选项] [参数]

ls          列出当前目录
ls -la      列出详细信息（-la是选项）
ls /tmp     列出/tmp目录（/tmp是参数）
```

---

## 7 个必学命令

### 1. ls - 查看目录内容

```bash
ls                    # 列出当前目录
ls -la                # 详细列表（包含隐藏文件）
ls -la /Users         # 查看指定目录
```

**常用选项：**
| 选项 | 说明 |
|------|------|
| `-l` | 详细信息 |
| `-a` | 显示隐藏文件 |
| `-h` | 人类可读大小 |

---

### 2. cd - 切换目录

```bash
cd Documents          # 进入 Documents 目录
cd ..                 # 返回上一级
cd ~                  # 回到主目录
cd /                  # 进入根目录
cd -                  # 返回上一个目录
```

---

### 3. rm - 删除文件

```bash
rm file.txt           # 删除文件
rm -r folder          # 删除目录（递归）
rm -rf folder         # 强制删除目录（不提示）
```

**危险！** `rm -rf /` 会删除整个系统

---

### 4. cp - 复制

```bash
cp file.txt backup.txt           # 复制文件
cp -r folder folder_backup       # 复制目录
cp file.txt ~/Documents/         # 复制到其他目录
```

---

### 5. mv - 移动/重命名

```bash
mv old.txt new.txt               # 重命名
mv file.txt ~/Documents/         # 移动文件
mv folder ~/Desktop/             # 移动目录
```

---

### 6. cat - 查看文件内容

```bash
cat file.txt                     # 显示文件内容
cat file1.txt file2.txt          # 合并显示多个文件
cat -n file.txt                  # 带行号显示
```

---

### 7. echo - 输出文本

```bash
echo "Hello World"               # 输出文字
echo $HOME                       # 输出变量值
echo "text" > file.txt           # 写入文件（覆盖）
echo "text" >> file.txt          # 写入文件（追加）
```

---

## 环境变量

### 什么是环境变量？

环境变量是系统级的配置，告诉程序去哪里找东西。

```
PATH = /usr/bin:/bin:/usr/local/bin
       ↓
当输入 "python" 时，系统在这些目录里查找
```

### 查看环境变量

```bash
echo $PATH                        # 查看 PATH
echo $HOME                        # 查看主目录
env                               # 查看所有环境变量
```

### 添加环境变量

#### Mac/Linux (Zsh)

```bash
# 临时添加（当前终端有效）
export PATH="$HOME/myapp:$PATH"

# 永久添加（写入 ~/.zshrc）
echo 'export PATH="$HOME/myapp:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

#### Windows (PowerShell)

```powershell
# 临时添加
$env:PATH += ";C:\myapp"

# 永久添加
[Environment]::SetEnvironmentVariable("PATH", $env:PATH + ";C:\myapp", "User")
```

---

## 管道与重定向

### 核心概念：Linux 一切皆文件

在 Linux/Unix 系统中，所有东西都是文件：
- 普通文件 → 文件
- 目录 → 文件
- 键盘 → 文件（标准输入）
- 屏幕 → 文件（标准输出）
- 硬件设备 → 文件

### 重定向

```bash
# > 输出到文件（覆盖）
echo "Hello" > file.txt

# >> 输出到文件（追加）
echo "World" >> file.txt

# < 从文件输入
sort < names.txt

# 2> 错误输出
command 2> error.log

# &> 全部输出（标准+错误）
command &> all.log
```

### 管道 | 

管道把一个命令的输出，变成另一个命令的输入。

```bash
# 基本语法
命令1 | 命令2

# 例子1: 列出文件并分页显示
ls -la | less

# 例子2: 查找包含 "error" 的日志
cat app.log | grep "error"

# 例子3: 统计文件数量
ls | wc -l

# 例子4: 复杂管道
cat access.log | grep "404" | sort | uniq -c | sort -rn | head -10
#                  │          │        │            │          │
#                  │          │        │            │          └── 取前10行
#                  │          │        │            └── 按数字排序
#                  │          │        └── 统计重复次数
#                  │          └── 排序
#                  └── 找404错误
```

### 常用管道组合

| 组合 | 用途 |
|------|------|
| `cmd | grep "text"` | 过滤内容 |
| `cmd | sort` | 排序 |
| `cmd | uniq` | 去重 |
| `cmd | wc -l` | 统计行数 |
| `cmd | head -n` | 取前 n 行 |
| `cmd | tail -n` | 取后 n 行 |

---

## 实用示例

### 场景 1: 找到并删除所有 .log 文件

```bash
# 先看看有哪些
find . -name "*.log"

# 确认后删除
find . -name "*.log" -delete
```

### 场景 2: 批量重命名文件

```bash
# 把所有 .txt 改成 .bak
for f in *.txt; do mv "$f" "${f%.txt}.bak"; done
```

### 场景 3: 查找大文件

```bash
# 找出大于 100MB 的文件
find . -size +100M -type f
```

### 场景 4: 查看进程

```bash
# 查找 Python 进程
ps aux | grep python

# 杀掉进程
kill -9 <PID>
```

---

## 故障排除

### 问题 1: 命令找不到

```bash
$ python
command not found: python
```

**解决：**
1. 检查是否安装：`which python`
2. 检查 PATH：`echo $PATH`
3. 添加到 PATH 或重新安装

---

### 问题 2: 权限不足

```bash
$ ./script.sh
Permission denied
```

**解决：**
```bash
chmod +x script.sh    # 添加执行权限
./script.sh
```

---

### 问题 3: 目录/文件不存在

```bash
$ cd project
No such file or directory
```

**解决：**
1. 检查路径：`ls` 看看有什么
2. 使用 Tab 自动补全
3. 检查拼写

---

### 问题 4: 终端卡住

**解决：**
```bash
Ctrl + C     # 终止当前命令
Ctrl + D     # 退出当前 Shell
Ctrl + Z     # 暂停命令（fg 恢复）
```

---

### 问题 5: 完全无法使用命令行

**备选方案：**

1. **使用文件管理器**
   - Mac: Finder
   - Windows: 资源管理器

2. **使用 GUI 工具**
   - VS Code 内置终端
   - 文件操作用 VS Code 文件浏览器

3. **重装 Terminal**
   - Mac: 重新安装 iTerm2 或 Warp
   - Windows: 重装 Windows Terminal

4. **使用恢复模式**
   - Mac: Cmd+R 启动恢复模式
   - Windows: 安全模式

---

## 速查表

| 命令 | 作用 | 示例 |
|------|------|------|
| `ls` | 列出文件 | `ls -la` |
| `cd` | 切换目录 | `cd ~/Documents` |
| `pwd` | 显示当前目录 | `pwd` |
| `mkdir` | 创建目录 | `mkdir project` |
| `rm` | 删除 | `rm -rf folder` |
| `cp` | 复制 | `cp file.txt backup/` |
| `mv` | 移动/重命名 | `mv old.txt new.txt` |
| `cat` | 查看文件 | `cat file.txt` |
| `grep` | 搜索文本 | `grep "error" log.txt` |
| `find` | 查找文件 | `find . -name "*.py"` |
| `chmod` | 修改权限 | `chmod +x script.sh` |
| `ps` | 查看进程 | `ps aux` |
| `kill` | 杀进程 | `kill -9 1234` |

---

## 下一步

- 学习 [Terminal 工具安装](terminal-setup-mac.md)
- 配置 [Git 基础](../2-git/git-intro.md)
- 探索更多命令: `man <命令>` 查看帮助
