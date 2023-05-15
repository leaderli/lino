---
tags:
  - linux/commands/tmux
date updated: 2023-05-15 20:47
---

一个开启多窗口的命令

配置文件`~/.tmux.conf`

```shell
set -g status off
set -g pane-border-bg default
set -g pane-border-fg white

set -g pane-active-border-bg default
set -g pane-active-border-fg white

```

1. 输入命令tmux使用工具
2. 上下分屏：`ctrl + b  再按 "`
3. 左右分屏：`ctrl + b  再按 %`
4. 切换屏幕：`ctrl + b  再按方向键`
5. 关闭一个终端：`ctrl + b  再按x`
6. 上下分屏与左右分屏切换： `ctrl + b  再按空格键`
7. 左右屏幕互换`ctrl+b+o`
