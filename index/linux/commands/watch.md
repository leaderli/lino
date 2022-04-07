---
tags:
  - linux/commands/watch
date updated: 2022-04-07 15:10
---

watch 指令可以间歇性的执行程序，将输出结果以全屏的方式显示，默认是 2s 执行一次。watch 将一直运行，直到被中断。

- `-d | --differences` 高亮显示差异部分
- `--cumulative` 高亮显示“sticky”
- `-n`  指定时间间隔
- `-t | --no-title` 不显示日期时间以及间隔秒数

```shell
# 每秒打印当前时间
watch -n 1 -d date
```
