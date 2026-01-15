# HAYFRP CLIENT
这是一个半第三方的 HAYFRP 客户端, 由 Far1sh 开发就是开发 v3 面板的那个人 \
node: 24.12.0 \
bun: 1.3.5 \
可能存在的使用坑, 由于偷懒懒得写rust了这次, 最小化或者隐藏到托盘运行, 可能会遇到丢失日志 \
其实也不是什么大问题

# Linux MacOS 用户
手动去应用的安装目录, 放一个 frpc 文件, 如果你愿意你也可以提交一个自动下载 frpc 的功能 \
FRP: https://console.hayfrp.com/console#download

# 咋编译?
非常简单, 项目目录, 先装一下依赖 bun install, bun run tauri build, 遇到错误了找 AI \
如果不知道怎么启用 bun 可以自己 bing 一下