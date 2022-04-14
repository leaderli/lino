---
tags:
  - linux/commands/nohup
date updated: 2022-04-14 10:59
---

后台进程

nohup 可以用来将脚本在后台运行，默认会将脚本的输出信息打印到 `nohup.out` 中

若需要不输出日志信息可以使用

```shell
nohup ./program >/dev/null 2>&1 &
```
