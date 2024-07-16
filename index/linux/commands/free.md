---
tags:
  - linux/commands/free
date updated: 2024-07-16 12:30
---

显示系统内存状态

- -s n：每 n 秒刷新一次查看内存使用状态
- -h ：根据内存的大小自动选择显示的单位是 `K`、`M` 、`G`

```shell
$ free -h -s 1 
```

linux内核会使用一些可用内存来充当磁盘的缓存来提供效率，其显示为available，当应用需要使用内存时，则会使用这一部分内容。因此如下所示，总内存为1.8G，使用了1.4G，剩余154M，还有190M被内核用来加速了。如果avaiable趋近于0，则表示内存耗尽了。

```shell
~$ free -h
              total        used        free      shared  buff/cache   available
Mem:           1.8G        1.4G        154M         49M        255M        190M
Swap:          2.0G        489M        1.5G

```
