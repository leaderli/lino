---
tags:
  - linux/commands/yes
date updated: 2024-07-13 00:41
---

用来重复输出指定的字符串。如果没有指定字符串，它将不断输出默认的字符串`y`。这个命令最常见的用途是自动化脚本中对需要连续确认的命令进行应答，例如，在安装一些软件包时自动回答“yes”来确认所有的提示。

语法格式：

`yes [STRING]`

```shell
# 生成大文件
yes 'Random txt' > bigfile.txt
# 编译时自动同意所有选项
yes | ./configure
```

占据CPU资源

```shell
$ yes > /dev/null &
$ top

Tasks: 105 total,   2 running, 103 sleeping,   0 stopped,   0 zombie
%Cpu(s): 31.2 us, 68.8 sy,  0.0 ni,  0.0 id,  0.0 wa,  0.0 hi,  0.0 si,  0.0 st
MiB Mem :    960.4 total,     71.6 free,    107.3 used,    781.5 buff/cache
MiB Swap:    975.0 total,    974.2 free,      0.8 used.    702.6 avail Mem 

   PID USER      PR  NI    VIRT    RES    SHR S  %CPU  %MEM     TIME+ COMMAND                                   
   854 li        20   0    5256    744    684 R  99.9   0.1   0:54.61 yes                                       
     1 root      20   0  103816   9048   6900 S   0.0   0.9   0:01.48 systemd
```

测试网络工具，生成大量的网络流量

```shell
$ yes "HTTP/1.1 200 OK" | nc -l 8080
```
