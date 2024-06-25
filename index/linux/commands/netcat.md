---
aliases: nc
tags:
  - linux/commands/netcat
  - nc
date updated: 2024-01-01 18:38
---

- v 显示命令执行细节

```shell
# 监听端口，读取数据
nc localhost 7777 
# 发布一个端口，可以发送数据 centos
$ nc -lk 7777
# 发布一个端口，可以发送数据 debian
$ nc -l -p 7777
```


```shell
# 查看zookeeper节点状态
echo stat | nc 127.0.0.1 2181
```