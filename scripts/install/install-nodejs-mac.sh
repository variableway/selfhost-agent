#!/bin/bash

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_banner() {
    echo -e "${BLUE}"
    echo "╔═══════════════════════════════════════════════════════════════╗"
    echo "║              Node.js 开发环境安装脚本 (Mac)                    ║"
    echo "║                                                               ║"
    echo "║  安装内容: fnm + Node.js LTS + 常用全局工具                    ║"
    echo "╚═══════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

print_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
print_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
print_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
print_error() { echo -e "${RED}[ERROR]${NC} $1"; }

check_homebrew() {
    if ! command -v brew &> /dev/null; then
        print_info "安装 Homebrew..."
        /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
        
        if [[ $(uname -m) == 'arm64' ]]; then
            echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
            eval "$(/opt/homebrew/bin/brew shellenv)"
        fi
        print_success "Homebrew 安装完成"
    else
        print_success "Homebrew 已安装"
    fi
}

install_fnm() {
    print_info "安装 fnm (Fast Node Manager)..."
    
    if command -v fnm &> /dev/null; then
        print_success "fnm 已安装: $(fnm --version)"
        return
    fi
    
    brew install fnm
    print_success "fnm 安装完成"
}

configure_shell() {
    print_info "配置 Shell 环境..."
    
    local shell_rc=""
    if [[ "$SHELL" == */zsh ]]; then
        shell_rc="$HOME/.zshrc"
    elif [[ "$SHELL" == */bash ]]; then
        shell_rc="$HOME/.bashrc"
    else
        shell_rc="$HOME/.profile"
    fi
    
    if ! grep -q 'fnm env' "$shell_rc" 2>/dev/null; then
        echo '' >> "$shell_rc"
        echo '# fnm configuration' >> "$shell_rc"
        if [[ "$SHELL" == */zsh ]]; then
            echo 'eval "$(fnm env --use-on-cd)"' >> "$shell_rc"
        else
            echo 'eval "$(fnm env)"' >> "$shell_rc"
        fi
        print_success "已添加 fnm 配置到 $shell_rc"
    else
        print_success "fnm 配置已存在"
    fi
    
    eval "$(fnm env --use-on-cd)"
}

install_nodejs() {
    print_info "安装 Node.js LTS 版本..."
    
    fnm install --lts
    local lts_version=$(fnm ls | grep -oE 'v[0-9]+\.[0-9]+\.[0-9]+' | head -1)
    fnm use "$lts_version"
    fnm default "$lts_version"
    
    local node_version=$(node -v)
    local npm_version=$(npm -v)
    
    print_success "Node.js 安装完成: $node_version"
    print_success "npm 版本: $npm_version"
}

configure_npm_mirror() {
    print_info "配置 npm 镜像（国内用户推荐）..."
    
    read -p "是否配置淘宝镜像? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        npm config set registry https://registry.npmmirror.com
        print_success "已配置淘宝镜像"
    else
        print_info "跳过镜像配置"
    fi
}

install_global_tools() {
    print_info "安装常用全局工具..."
    
    local tools=("pnpm" "yarn" "nodemon" "serve")
    
    for tool in "${tools[@]}"; do
        read -p "是否安装 $tool? (y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            npm install -g "$tool"
            print_success "$tool 安装完成"
        fi
    done
    npm install -g npm-check-updates
}

verify_installation() {
    print_info "验证安装..."
    echo ""
    
    echo -e "${YELLOW}Node.js 版本:${NC}"
    node -v 2>/dev/null || echo "未安装"
    
    echo -e "${YELLOW}npm 版本:${NC}"
    npm -v 2>/dev/null || echo "未安装"
    
    echo -e "${YELLOW}fnm 版本:${NC}"
    fnm --version 2>/dev/null || echo "未安装"
    
    echo -e "${YELLOW}已安装的 Node.js 版本:${NC}"
    fnm list 2>/dev/null || echo "无"
}

print_next_steps() {
    echo ""
    echo -e "${GREEN}════════════════════════════════════════════════════════════${NC}"
    echo -e "${GREEN}                  安装完成！                                  ${NC}"
    echo -e "${GREEN}════════════════════════════════════════════════════════════${NC}"
    echo ""
    echo -e "${YELLOW}下一步操作:${NC}"
    echo ""
    echo "  1. 重启终端或运行: source ~/.zshrc"
    echo "  2. 验证安装: node -v && npm -v"
    echo "  3. 安装 Claude Code CLI: npm install -g @anthropic-ai/claude-code"
    echo ""
    echo -e "${YELLOW}fnm 常用命令:${NC}"
    echo "  fnm install 18      # 安装 Node.js 18"
    echo "  fnm use 18          # 切换到 Node.js 18"
    echo "  fnm default 18      # 设为默认版本"
    echo "  fnm list            # 查看已安装版本"
    echo ""
}

main() {
    print_banner
    check_homebrew
    echo ""
    install_fnm
    echo ""
    configure_shell
    echo ""
    install_nodejs
    echo ""
    configure_npm_mirror
    echo ""
    install_global_tools
    echo ""
    verify_installation
    print_next_steps

}

main "$@"
