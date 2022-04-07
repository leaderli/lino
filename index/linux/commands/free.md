---
tags:
  - linux/commands/free
date updated: 2022-04-07 10:32
---

显示系统内存状态

- -s n：每 n 秒刷新一次查看内存使用状态
- -h ：根据内存的大小自动选择显示的单位是 `K`、`M` 、`G`

```shell
$ free -h -s 1 
```
