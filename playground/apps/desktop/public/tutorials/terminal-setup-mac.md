# Mac Terminal工具安装指南

> 适用人群: 初级用户 - 零基础或刚接触AI开发

## 前置要求

### 安装 Homebrew (Mac包管理器)

Homebrew是Mac上最流行的包管理器，用于安装各种开发工具。

**安装命令**:
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

**验证安装**:
```bash
brew --version
```

---

## 推荐的三个Terminal工具

### 1. Warp (推荐指数: ⭐⭐⭐⭐⭐)

**简介**: AI驱动的现代化终端，最适合新手和AI开发者

**官网**: https://www.warp.dev/

**安装**:
```bash
brew install --cask warp
```

**启动验证**:
- 打开Spotlight (Cmd+Space)
- 输入 "Warp"
- 首次启动需要注册（免费）

**特点**:
- AI命令自动补全 - 对AI开发特别友好
- 现代化界面
- 命令块编辑
- 团队协作功能

**常用快捷键**:
- `Cmd+D`: 垂直分屏
- `Cmd+Shift+D`: 水平分屏
- `Ctrl+Space`: AI命令补全

---

### 2. iTerm2 (推荐指数: ⭐⭐⭐⭐)

**简介**: Mac上功能强大的经典终端替代品

**官网**: https://iterm2.com/

**安装**:
```bash
brew install --cask iterm2
```

**启动验证**:
- 打开Spotlight (Cmd+Space)
- 输入 "iTerm"
- 点击打开

**常用功能**:
- `Cmd+D`: 垂直分屏
- `Cmd+Shift+D`: 水平分屏
- `Cmd+Shift+H`: 显示粘贴历史
- `Cmd+;`: 自动补全

---

### 3. Alacritty (推荐指数: ⭐⭐⭐⭐)

**简介**: 高性能GPU加速终端，适合追求速度的用户

**GitHub**: https://github.com/alacritty/alacritty

**安装**:
```bash
brew install --cask alacritty
```

**启动验证**:
- 打开Spotlight (Cmd+Space)
- 输入 "Alacritty"

**特点**:
- 极速启动
- 低资源占用
- 需要配置文件 (使用YAML配置)

---

## Shell增强工具

### Zsh + Oh My Zsh

**简介**: 强大的Shell配置框架，提供插件和主题支持

**Oh My Zsh官网**: https://ohmyz.sh/  
**Oh My Zsh GitHub**: https://github.com/ohmyzsh/ohmyzsh

#### 1. 安装 Zsh
```bash
brew install zsh
```

#### 2. 安装 Oh My Zsh
```bash
sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"
```

**验证**:
```bash
zsh --version
echo $ZSH_VERSION
```

**常用命令**:
- `omz update`: 更新Oh My Zsh
- `omz plugin list`: 查看插件列表
- 编辑 `~/.zshrc` 配置主题: `ZSH_THEME="agnoster"`

**推荐插件** (编辑 ~/.zshrc):
```bash
plugins=(git zsh-autosuggestions zsh-syntax-highlighting docker npm)
```

---

## 实用工具

### 1. tmux (终端复用器)

**简介**: 可以在单个终端中管理多个会话

**GitHub**: https://github.com/tmux/tmux

**安装**:
```bash
brew install tmux
```

**验证**:
```bash
tmux -V
```

**常用命令**:
```bash
tmux                    # 启动tmux
tmux new -s session1    # 创建命名会话
tmux ls                 # 列出所有会话
tmux attach -t session1 # 连接到会话
Ctrl+b d                # 分离当前会话
Ctrl+b c                # 创建新窗口
Ctrl+b %                # 垂直分屏
Ctrl+b "                # 水平分屏
```

---

### 2. autojump (目录快速跳转)

**简介**: 智能目录跳转工具，记住常用目录

**GitHub**: https://github.com/wting/autojump

**安装**:
```bash
brew install autojump
```

**配置** (添加到 ~/.zshrc):
```bash
[ -f /usr/local/etc/profile.d/autojump.sh ] && . /usr/local/etc/profile.d/autojump.sh
```

**重新加载配置**:
```bash
source ~/.zshrc
```

**常用命令**:
```bash
j directory_name    # 跳转到包含该名称的目录
jc subdirectory     # 跳转到当前目录的子目录
jo directory_name   # 在文件管理器中打开目录
j -s                # 显示数据库中的统计信息
```

---

### 3. 其他实用工具

#### tree (目录树显示)
**GitHub**: https://gitlab.com/OldManProgrammer/unix-tree

```bash
brew install tree
tree -L 2           # 显示2层目录结构
```

#### htop (增强的任务管理器)
**GitHub**: https://github.com/htop-dev/htop

```bash
brew install htop
htop                # 启动系统监控
```

#### fzf (模糊搜索)
**GitHub**: https://github.com/junegunn/fzf

```bash
brew install fzf
$(brew --prefix)/opt/fzf/install    # 安装Shell集成
Ctrl+R              # 搜索命令历史
Ctrl+T              # 搜索文件
```

#### bat (增强的cat)
**GitHub**: https://github.com/sharkdp/bat

```bash
brew install bat
bat filename        # 带语法高亮的文件查看
```

#### ripgrep (快速搜索)
**GitHub**: https://github.com/BurntSushi/ripgrep

```bash
brew install ripgrep
rg "search_term"    # 快速递归搜索
```

---

## 一键安装脚本

参考 [install-terminal-tools-mac.sh](../../scripts/install/install-terminal-tools-mac.sh)

## 快速验证

运行以下命令验证所有工具是否安装成功:
```bash
echo "=== 验证工具安装 ==="
echo "Homebrew: $(brew --version)"
echo "Warp: $(mdfind 'kMDItemKind == Application' | grep -i warp | head -1)"
echo "Zsh: $(zsh --version)"
echo "Oh My Zsh: $(ls -d ~/.oh-my-zsh 2>/dev/null && echo 'Installed' || echo 'Not installed')"
echo "tmux: $(tmux -V)"
echo "autojump: $(which autojump)"
echo "tree: $(tree --version | head -1)"
echo "htop: $(htop --version | head -1)"
```

## 下一步

- 配置你的 [IDE环境](../ide-setup.md)
- 安装 [Python环境](../python-setup.md)
- 设置 [Git配置](../git-setup.md)

## 常见问题

**Q: Homebrew安装很慢怎么办?**
A: 可以使用国内镜像源:
```bash
export HOMEBREW_BREW_GIT_REMOTE="https://mirrors.ustc.edu.cn/brew.git"
export HOMEBREW_CORE_GIT_REMOTE="https://mirrors.ustc.edu.cn/homebrew-core.git"
```

**Q: Oh My Zsh安装后终端变慢?**
A: 减少插件数量或使用更轻量的主题，编辑 `~/.zshrc`

**Q: autojump不工作?**
A: 确保添加了配置到 `~/.zshrc` 并执行了 `source ~/.zshrc`
