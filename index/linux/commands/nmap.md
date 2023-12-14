---
tags:
  - linux/commands/nmap
date updated: 2022-04-14 11:02
---


端口扫描
```shell
nmap -v 127.0.0.1
# 多个ip
nmap -v 127.0.0.1 127.0.0.2
```

- `-p` 指定端口，可以指定多个端口
	```shell
	nmap -p 80,8080 127.0.0.1
	```
 - `-Pn` 不检测host，直接扫描 
	```shell
	nmap -p 80,8080 -Pn 127.0.0.1 127.0.0.2
	```
 