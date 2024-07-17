---
tags:
  - linux/commands/tc
date updated: 2024-07-16 12:57
---

流程控制命令，可以用来模拟网络延迟和丢包，需要root执行

查看流量管理

```shell
$ tc qdisc  show
qdisc noqueue 0: dev lo root refcnt 2
qdisc pfifo_fast 0: dev eth0 root refcnt 2 bands 3 priomap  1 2 2 2 1 2 0 0 1 1 1 1 1 1 1 1
```


模拟波动延迟

```shell
# 固定延迟500ms
$ tc qdisc  add dev eth0 root netem delay 500ms
# 延迟 100 +- 100
$ tc qdisc  add dev eth0 root netem delay 100ms 100ms
# 删除
$ tc qdisc  del dev eth0 root netem 
```


```shell
~$ ping baidu.com
PING baidu.com (110.242.68.66) 56(84) bytes of data.
64 bytes from 110.242.68.66 (110.242.68.66): icmp_seq=1 ttl=128 time=72.3 ms
64 bytes from 110.242.68.66 (110.242.68.66): icmp_seq=2 ttl=128 time=68.1 ms
64 bytes from 110.242.68.66 (110.242.68.66): icmp_seq=3 ttl=128 time=60.5 ms
64 bytes from 110.242.68.66 (110.242.68.66): icmp_seq=4 ttl=128 time=577 ms
64 bytes from 110.242.68.66 (110.242.68.66): icmp_seq=5 ttl=128 time=575 ms
64 bytes from 110.242.68.66 (110.242.68.66): icmp_seq=6 ttl=128 time=591 ms
64 bytes from 110.242.68.66 (110.242.68.66): icmp_seq=7 ttl=128 time=575 ms
64 bytes from 110.242.68.66 (110.242.68.66): icmp_seq=8 ttl=128 time=581 ms
```



模拟网络丢包 

```shell
# 50%丢包率
tc qdisc  add dev eth0 root netem loss 50%
# 50%+-50%丢包率
tc qdisc  add dev eth0 root netem loss 50% 50%
```

```shell
~$ ping baidu.com
PING 110.242.68.66 (110.242.68.66) 56(84) bytes of data.
64 bytes from 110.242.68.66: icmp_seq=1 ttl=128 time=68.4 ms
64 bytes from 110.242.68.66: icmp_seq=5 ttl=128 time=85.2 ms
64 bytes from 110.242.68.66: icmp_seq=8 ttl=128 time=119 ms
64 bytes from 110.242.68.66: icmp_seq=9 ttl=128 time=111 ms
64 bytes from 110.242.68.66: icmp_seq=10 ttl=128 time=110 ms
64 bytes from 110.242.68.66: icmp_seq=11 ttl=128 time=105 ms
64 bytes from 110.242.68.66: icmp_seq=12 ttl=128 time=104 ms
^C
--- 110.242.68.66 ping statistics ---
12 packets transmitted, 7 received, 41% packet loss, time 11014ms
rtt min/avg/max/mdev = 68.402/100.558/119.513/16.337 ms
```


模拟包重复

```shell
# 1% 重复率
$ tc qdisc add dev eth0 root netem duplicate 1%
# 1% +-10% 重复率
$ tc qdisc add dev eth0 root netem duplicate 1% 10%
```