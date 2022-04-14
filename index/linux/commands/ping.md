---
tags:
  - linux/commands/ping
date updated: 2022-04-14 11:34
---

判断是否连接网络

```shell
ping  -n 2 www.baidu.com >/dev/null;
if ((  $? == 0 )) ;
then #判断ping命令执行结果 为0表示ping通
	echo ok
else
	echo no
fi
```
