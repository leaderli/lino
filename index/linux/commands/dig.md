---
tags:
  - linux/commands/dig
  - dns
date updated: 2024-07-08 08:49
---

查看 [[net#DNS]] 解析过程

```shell
$ dig baidu.com

; <<>> DiG 9.11.4-P2-RedHat-9.11.4-9.P2.el7 <<>> baidu.com
;; global options: +cmd
;; Got answer:
;; ->>HEADER<<- opcode: QUERY, status: NOERROR, id: 25310
;; flags: qr rd ra; QUERY: 1, ANSWER: 2, AUTHORITY: 0, ADDITIONAL: 1

;; OPT PSEUDOSECTION:
; EDNS: version: 0, flags:; udp: 4096
;; QUESTION SECTION:
;baidu.com.			IN	A

;; ANSWER SECTION:
baidu.com.		409	IN	A	39.156.66.10
baidu.com.		409	IN	A	110.242.68.66

;; Query time: 13 msec
;; SERVER: 10.211.55.1#53(10.211.55.1)
;; WHEN: Fri Apr 08 03:09:52 CST 2022
;; MSG SIZE  rcvd: 70
```

```shell
# 显示简易消息
$ dig +short baidu.com
39.156.66.10
110.242.68.66
```

查看域名解析的详细过程，会从根域名 . 开始

```shell



$ dig +trace baidu.com

; <<>> DiG 9.11.4-P2-RedHat-9.11.4-9.P2.el7 <<>> +trace baidu.com
;; global options: +cmd
.			4502	IN	NS	d.root-servers.net.
.			4502	IN	NS	a.root-servers.net.
.			4502	IN	NS	l.root-servers.net.
.			4502	IN	NS	c.root-servers.net.
.			4502	IN	NS	m.root-servers.net.
.			4502	IN	NS	h.root-servers.net.
.			4502	IN	NS	k.root-servers.net.
.			4502	IN	NS	e.root-servers.net.
.			4502	IN	NS	b.root-servers.net.
.			4502	IN	NS	g.root-servers.net.
.			4502	IN	NS	f.root-servers.net.
.			4502	IN	NS	i.root-servers.net.
.			4502	IN	NS	j.root-servers.net.
couldn't get address for 'l.root-servers.net': not found
couldn't get address for 'j.root-servers.net': not found
;; Received 239 bytes from 10.211.55.1#53(10.211.55.1) in 2276 ms

com.			172800	IN	NS	a.gtld-servers.net.
com.			172800	IN	NS	b.gtld-servers.net.
com.			172800	IN	NS	c.gtld-servers.net.
com.			172800	IN	NS	d.gtld-servers.net.
com.			172800	IN	NS	e.gtld-servers.net.
com.			172800	IN	NS	f.gtld-servers.net.
com.			172800	IN	NS	g.gtld-servers.net.
com.			172800	IN	NS	h.gtld-servers.net.
com.			172800	IN	NS	i.gtld-servers.net.
com.			172800	IN	NS	j.gtld-servers.net.
com.			172800	IN	NS	k.gtld-servers.net.
com.			172800	IN	NS	l.gtld-servers.net.
com.			172800	IN	NS	m.gtld-servers.net.
com.			86400	IN	DS	19718 13 2 8ACBB0CD28F41250A80A491389424D341522D946B0DA0C0291F2D3D7 71D7805A
com.			86400	IN	RRSIG	DS 8 1 86400 20240720170000 20240707160000 20038 . MrJn5BoZW32kLDc0hqeFGXH3b2z0w21Cs8+nYJGIJga7Gyh6dGNxo2F0 Lp6U4LefMaEcOOcsm0q6rIBe2YZZghzTBcyCC5CdHMM74hLhZYE0gsJ2 aA/SDmdUzB4G2hnDoKRzYpwvAij7DwmMh2bvAKNnHsgOAioD2Uh5XQVH fKXeJNml825wMJmAlHIHjFOZjRLAdCO+P54PA/tRzdc3y2+DRUd4/f4p 0KGhpvXno3ySrGXfOfcURDOLsTvSz9NNTpFh1hEb3Tg9kuRlXIPLXdJ1 BFMh9fGABtq1ehMJ/RGu0BU+2Z+ohKSq1Uc6cCs9OQoV5qtABcw5H9Kl m2dsDA==
couldn't get address for 'l.gtld-servers.net': not found
couldn't get address for 'm.gtld-servers.net': not found
;; Received 1169 bytes from 198.41.0.4#53(a.root-servers.net) in 91 ms

baidu.com.		172800	IN	NS	ns2.baidu.com.
baidu.com.		172800	IN	NS	ns3.baidu.com.
baidu.com.		172800	IN	NS	ns4.baidu.com.
baidu.com.		172800	IN	NS	ns1.baidu.com.
baidu.com.		172800	IN	NS	ns7.baidu.com.
CK0POJMG874LJREF7EFN8430QVIT8BSM.com. 86400 IN NSEC3 1 1 0 - CK0Q2D6NI4I7EQH8NA30NS61O48UL8G5 NS SOA RRSIG DNSKEY NSEC3PARAM
CK0POJMG874LJREF7EFN8430QVIT8BSM.com. 86400 IN RRSIG NSEC3 13 2 86400 20240715002454 20240707231454 956 com. tzsJ3z4Kk4KryI1O0h5CIzr28u4EV4XP/ZAgWu2AXJfKxvbZfAycog1V CJB55AyLB+17t54QOsdjTlYN1KSmvA==
HPVV1UNKTCF9TD77I2AUR73709T975GH.com. 86400 IN NSEC3 1 1 0 - HPVVP23QUO0FP9R0A04URSICJPESKO9J NS DS RRSIG
HPVV1UNKTCF9TD77I2AUR73709T975GH.com. 86400 IN RRSIG NSEC3 13 2 86400 20240714004651 20240706233651 956 com. uq7o9NnXa/EGNT0/wMkruzHWomACcSRF+udFcLmrek7V1ycoPVI0IQws rnwj4VrdV35G7E2dpbIOdxCxswHWbw==
;; Received 653 bytes from 192.52.178.30#53(k.gtld-servers.net) in 264 ms

baidu.com.		600	IN	A	110.242.68.66
baidu.com.		600	IN	A	39.156.66.10
baidu.com.		86400	IN	NS	ns7.baidu.com.
baidu.com.		86400	IN	NS	dns.baidu.com.
baidu.com.		86400	IN	NS	ns4.baidu.com.
baidu.com.		86400	IN	NS	ns2.baidu.com.
baidu.com.		86400	IN	NS	ns3.baidu.com.
;; Received 328 bytes from 36.155.132.78#53(ns3.baidu.com) in 52 ms
```

上面的解析记录，四个字断分别代表

- `baid.com.`  域名
- `86400` TTL值，表示缓存时间
- `A` 表示域名对应的IP地址
- `NS` 表示域名对应的DNS服务器域名

DNS记录类型

- `A`：地址记录（Address），返回域名指向的IP地址。
- `NS`：域名服务器记录（Name Server），返回保存下一级域名信息的服务器地址。该记录只能设置为域名，不能设置为IP地址。
- `MX`：邮件记录（Mail eXchange），返回接收电子邮件的服务器地址。
- `CNAME`：规范名称记录（Canonical Name），返回另一个域名，即当前查询的域名是另一个域名的跳转
- `PTR`：逆向查询记录（Pointer Record），只用于从IP地址查询域名

查看NS记录

```shell
$ dig ns com

; <<>> DiG 9.11.4-P2-RedHat-9.11.4-9.P2.el7 <<>> ns com
;; global options: +cmd
;; Got answer:
;; ->>HEADER<<- opcode: QUERY, status: NOERROR, id: 57949
;; flags: qr rd ra; QUERY: 1, ANSWER: 13, AUTHORITY: 0, ADDITIONAL: 1

;; OPT PSEUDOSECTION:
; EDNS: version: 0, flags:; udp: 4096
;; QUESTION SECTION:
;com.				IN	NS

;; ANSWER SECTION:
com.			4502	IN	NS	i.gtld-servers.net.
com.			4502	IN	NS	e.gtld-servers.net.
com.			4502	IN	NS	c.gtld-servers.net.
com.			4502	IN	NS	h.gtld-servers.net.
com.			4502	IN	NS	j.gtld-servers.net.
com.			4502	IN	NS	k.gtld-servers.net.
com.			4502	IN	NS	l.gtld-servers.net.
com.			4502	IN	NS	m.gtld-servers.net.
com.			4502	IN	NS	f.gtld-servers.net.
com.			4502	IN	NS	b.gtld-servers.net.
com.			4502	IN	NS	d.gtld-servers.net.
com.			4502	IN	NS	g.gtld-servers.net.
com.			4502	IN	NS	a.gtld-servers.net.

;; Query time: 54 msec
;; SERVER: 10.211.55.1#53(10.211.55.1)
;; WHEN: Fri Apr 08 03:20:00 CST 2022
;; MSG SIZE  rcvd: 256
```

## 其他

debian上安装

```shell
apt install dnsutils
```


也可以使用 host 命令来查看域名


```shell
$ host baidu.com
baidu.com has address 39.156.66.10
baidu.com has address 110.242.68.66
baidu.com mail is handled by 20 usmx01.baidu.com.
baidu.com mail is handled by 20 jpmx.baidu.com.
baidu.com mail is handled by 15 mx.n.shifen.com.
baidu.com mail is handled by 20 mx1.baidu.com.
baidu.com mail is handled by 20 mx50.baidu.com.
baidu.com mail is handled by 10 mx.maillb.baidu.com.
```
