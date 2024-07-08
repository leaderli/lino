---
tags:
  - linux/commands/ping
date updated: 2024-07-08 12:57
---

判断是否连接网络，它向目标主机发送一个ICMP ECHO_REQUEST包，并等着看哪台主机是否返回应答，一些防火墙可能会屏蔽ICMP的流量请求

- `-s` 以字节为单位指定包的大小，通过使用比网络的[[net#MTU]]更大的包，可以强行产生分片 
- `-n` 请求几次


```shell
ping  -n 2 www.baidu.com >/dev/null;
if ((  $? == 0 )) ;
then #判断ping命令执行结果 为0表示ping通
	echo ok
else
	echo no
fi
```

```shell
ping -s 1500  www.baidu.com
```


