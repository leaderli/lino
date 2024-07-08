---
aliases:
  - IP
  - 网络地址
  - 网段
  - DHCP
  - CIDR
tags:
  - protocol/IP
cssclasses:
  - academia
date updated: 2024-07-08 08:40
---

## 概述

Ineternet地址都是由网络部分和主机部分构成的。网络部分标识这个地址所属的逻辑网络，主机部分标识在网络上的一个节点。IPv4的地址有4字节长，网络部分和主机部分的界限要专门规定

网络设备可以拥有多个IP地址，但一个IP地址只能对应一台网络设备，即IP地址具有唯一性

若一个地址的第一个字节是127，则表示环回网络，环回网络没有实际的硬件接口且只有一台主机的虚拟网络。环回地址`127.0.0.1`始终指向当前主机，它的符号名是`localhost`

IPv4地址分类，根据最左边的第一个比特位的不同而进行分类

![[Pasted image 20240628125918.png]]

### 私有地址

们对 IPv4 单播地址空间的某些地址块进行了预留，并将其指定为私有地址。私有地址空间专为不与公网（Internet）相连的网络而预留。RFC1918将下列地址块定义为 IPv4 私有地址：

- 10.0.0.0～10.255.255.255
- 172.16.0.0～172.31.255.255
- 192.168.0.0～192.168.255.255

### 子网

IP子网划分是指把有类IP地址的某些主机位“并入”网络 ID，从而在 IP 地址类别中引入了另一层级。这一经过扩展的网络ID称为子网号或IP子网

![[Pasted image 20240701122719.png]]
执行IP子网划分时，会对有待分配的有类网络的掩码进行调整，以反映出新创建子网的网络号和主机号。图 1-4 所示为划分 B 类地址时，新创建的子网及与之相对应的掩码。掩码中一连串的1和0分别表示网络位和主机位。通常，书写 IP 地址时，也可以用前缀长度表示法，即指明子网掩码中1的个数。比如，可把172.16.1.0 255.255.255.0写为172.16.1.0/24（24表示IP子网掩码的第24个位置,这个也叫做CIDR记法）。

![[Pasted image 20240701122812.png]]

常用掩码

![[Pasted image 20240701123203.png|600]]

### 路由

路由选择是引导一个包从源地址到达目的地址的过程。路由信息采用了规则的形式，如为了达到网络A，要经过计算机C发送包，同时还存在一条默认路由，它表明怎样处理要送往没有明确路由的网络的包。内核会选择与之匹配的路由中更具体的一条（即带有最长网络掩码的路由）。如果内核没有找到合适的路由，又没有默认路由的话，那么它向发送端饭后一个网络不可打的[[#ICMP]]错误消息

```shell
# 查询路由表
~$ netstat  -rn
Kernel IP routing table
Destination     Gateway         Genmask         Flags   MSS Window  irtt Iface
0.0.0.0         10.211.55.1     0.0.0.0         UG        0 0          0 eth0
10.211.55.0     0.0.0.0         255.255.255.0   U         0 0          0 eth0
```

也可以使用 `route` 命令来查看，`route`还可以用来添加路由

```shell
$ route 
Kernel IP routing table
Destination     Gateway         Genmask         Flags Metric Ref    Use Iface
default         gateway         0.0.0.0         UG    0      0        0 eth0
default         gateway         0.0.0.0         UG    100    0        0 eth0
10.211.55.0     0.0.0.0         255.255.255.0   U     100    0        0 eth0

```

### DNS

根据域名查找IP地址，可以使用[[dig]]查看解析过程

`/etc/resolve.conf` 文件列出了应用搜索哪些DNS域来解析不完全的名字，文件首先列出最近的稳定的名字服务器，因为按顺序来联络名字服务器的，在前一个名字服务器联络超时之后，才会访问下一个名字服务器

一些DNS地址

```shell
nameserver 119.29.29.29
nameserver 223.5.5.5
```


### ICMP

当一台路由器把一个包转发到某个网络的一台计算机，而这个包最初就是这个同一个网络收到的，即发送方、路由器和下一条的路由器都在同一网络上，所以应该用一跳就能转发这个数据包，不应该用两跳。于是路由器可以得出结论：发送方的路由不准确或者不完成。这种情况下，路由器可以向发送方发一个ICMP重定向包，把发送包的问题通知给它。

从理论上讲，发送方姐收到重定向通知之后，就会调整它的路由表，修正这个问题。但在实际中，重定向不带身份验证信息，因此不值得信任，专用路由器通常会忽略重定向包，而大多数linux、unix系统默认会接受它们，并采取相应的措施。

### DHCP

通过动态主机配置协议，把一台设备或计算机加入到网络中的时候，在网路中为它自己获取一个IP地址，设置一条正确的路由，连上一台本地的[[#DNS]]服务器。

该协议可以让一台DHCP客户机从中央服务器借用各种网络和管理参数，中央服务器得到了授权，可以给这些机器分配这些参数。

可借用的参数包括：

- IP地址和网络掩码
- 网关（默认路由）
- syslog（主机日志）主机
- WINS服务器，X字体服务器，代理服务器，NTP服务器
- TFTP服务器（用于加载一个启动图像）
- 其他，参考 RFC2132

客户机必须定期向DHCP服务器报告，为借用的参数续期，续期的时间可以配置，通常是数小时或数天

可以通过命令观察dhcp获取配置的详细过程

```shell
# eht0 为网卡信息，可以通过ifconfig查看，或nmcli
$ dhclient -v eth0
Internet Systems Consortium DHCP Client 4.2.5
Copyright 2004-2013 Internet Systems Consortium.
All rights reserved.
For info, please visit https://www.isc.org/software/dhcp/

Listening on LPF/eth0/00:1c:42:6c:b7:b3
Sending on   LPF/eth0/00:1c:42:6c:b7:b3
Sending on   Socket/fallback
DHCPDISCOVER on eth0 to 255.255.255.255 port 67 interval 3 (xid=0x532a636d)
DHCPREQUEST on eth0 to 255.255.255.255 port 67 (xid=0x532a636d)
DHCPOFFER from 10.211.55.1
DHCPACK from 10.211.55.1 (xid=0x532a636d)
bound to 10.211.55.6 -- renewal in 899 seconds.
```

也可以直接查看日志 `/var/log/syslog` 或 `/var/log/messages`， 显示了dhcp拉取配置的过程。我们可以看到更新了[[#DNS]]服务器的配置，以及续期成功的提示

```shell
$ cat  /var/log/messages
Apr  7 13:49:42 centos7 NetworkManager[754]: <info>  [1649310582.1465] dhcp4 (eth0): client pid 5649 killed by signal 9
Apr  7 13:49:42 centos7 NetworkManager[754]: <info>  [1649310582.1466] dhcp4 (eth0): state changed bound -> terminated
Apr  7 13:49:42 centos7 NetworkManager[754]: <info>  [1649310582.1473] dhcp4 (eth0): canceled DHCP transaction
Apr  7 13:49:42 centos7 NetworkManager[754]: <info>  [1649310582.1474] dhcp4 (eth0): state changed terminated -> done
Apr  7 13:49:46 centos7 dhclient[8372]: Internet Systems Consortium DHCP Client 4.2.5
Apr  7 13:49:46 centos7 dhclient[8372]: Copyright 2004-2013 Internet Systems Consortium.
Apr  7 13:49:46 centos7 dhclient[8372]: All rights reserved.
Apr  7 13:49:46 centos7 dhclient[8372]: For info, please visit https://www.isc.org/software/dhcp/
Apr  7 13:49:46 centos7 dhclient[8372]:
Apr  7 13:49:46 centos7 dhclient[8372]: Listening on LPF/eth0/00:1c:42:6c:b7:b3
Apr  7 13:49:46 centos7 dhclient[8372]: Sending on   LPF/eth0/00:1c:42:6c:b7:b3
Apr  7 13:49:46 centos7 dhclient[8372]: Sending on   Socket/fallback
Apr  7 13:49:46 centos7 dhclient[8372]: DHCPREQUEST on eth0 to 255.255.255.255 port 67 (xid=0x34d28226)
Apr  7 13:49:46 centos7 dhclient[8372]: DHCPACK from 10.211.55.1 (xid=0x34d28226)
Apr  7 13:49:48 centos7 NET[8440]: /usr/sbin/dhclient-script : updated /etc/resolv.conf
Apr  7 13:49:48 centos7 dhclient[8372]: bound to 10.211.55.6 -- renewal in 879 seconds.
Apr  7 13:50:01 centos7 systemd: Created slice User Slice of root.
Apr  7 13:50:01 centos7 systemd: Started Session 499 of user root.
Apr  7 13:50:01 centos7 systemd: Removed slice User Slice of root.
```

更新后的[[#DNS]]服务器的配置

```shell
$ cat /etc/resolv.conf
; generated by /usr/sbin/dhclient-script
search localdomain
nameserver 10.211.55.1
```

### 配置eth0

```shell
cat /etc/sysconfig/network-scripts/ifcfg-eth0  
TYPE=Ethernet #网卡类型  
DEVICE=eth0 #网卡接口名称  
ONBOOT=yes #系统启动时是否自动加载  
BOOTPROTO=static #启用地址协议 --static:静态协议 --bootp协议 --dhcp协议  
IPADDR=192.168.1.11 #网卡IP地址  
NETMASK=255.255.255.0 #网卡网络地址  
GATEWAY=192.168.1.1 #网卡网关地址  
DNS1=10.203.104.41 #网卡DNS地址  
HWADDR=00:0C:29:13:5D:74 #网卡设备MAC地址  
BROADCAST=192.168.1.255 #网卡广播地址
```

网卡类型有约定俗称的名称，`eth`开头一般就是以太网接口（Ethernet），`wlan` 开头一般就是无线网络接口（wifi），可以通过[[#nmcli]]查看

### 基本的网络配置

把一台主机加入到本地网络的基本步骤：

1. 分配唯一的IP地址和主机名
2. 确保在系统引导时正确配置网络接口
3. 设置一条默认路由，或许还有其他更复杂的路由配置
4. 指向一台[[#DNS]]服务器

如果网络采用了[[#DHCP]]，那么大部分配置工作都会在DHCP服务器上完成

### nmcli

显示网络设备

```shell
$ nmcli connection show
NAME  UUID                                  TYPE      DEVICE
eth0  ed724115-8db4-4a95-bb1d-f8305bc0acb1  ethernet  eth0
```

## IP报文

IP4 报文的报文头由 14 个属性构成，其中 13 个是必须的，第 14 个属性是可选的。

![ip_header.png](ip_header.png)
我们抓取一段 ip 报文来分析上图

这里是使用`tcpdump -i any 'ip[40:4] = 0x47455420' -A -nn -f`抓取的一段报文

```txt
0x0000:  4500 0078 78c3 4000 4006 c9cb 0ad3 3706  E..xx.@.@.....7.
0x0010:  ac14 0a04 9354 0fa0 ea3e 8d2c 98a7 3036  .....T...>.,..06
0x0020:  5018 00e5 f85b 0000 4745 5420 2f20 4854  P....[..GET./.HT
0x0030:  5450 2f31 2e31 0d0a 5573 6572 2d41 6765  TP/1.1..User-Age
0x0040:  6e74 3a20 6375 726c 2f37 2e32 392e 300d  nt:.curl/7.29.0.
0x0050:  0a48 6f73 743a 2031 3732 2e32 302e 3130  .Host:.172.20.10
0x0060:  2e34 3a34 3030 300d 0a41 6363 6570 743a  .4:4000..Accept:
0x0070:  202a 2f2a 0d0a 0d0a 0000 0000 0000 0000  .*/*............
0x0080:  0000 0000 0000 0000                      ........
```

我们根据 ip 报文头的格式截取整理一下，报文以 hex 显示，一位表示 4 个 byte

```txt
4500 0078
78c3 4000
4006 c9cb
0ad3 3706
ac14 0a04
```

1. `Version` 版本号 `4`，表示 ip4 协议

2. `IHL` ip 报文头长度，计算规则为`n * 32bits`，最小为 5，当大于 5 时，说明报文头有扩展字段，此处为`5`，表明没有扩展字段

3. `DSCP` 差分服务代码点，用以路由器进行转发时来区分优先级

4. `ECN` 拥赛指示标记，用以通知报文传输速度的调整

5. `Total Length` 报文总长度，包括报文头和报文体，最小为 20 字节，即报文头的最小长度`78`表明长度为 120 个字节

6. `Identification` 用于确认是否归属同一组报文的标记`78c3`

7. `Flags` 分组标记，占据 3 个 bits，每个 bits 的含义为：

   - bit 0: 备用位
   - bit 1: 不要分组 Don't Fragment (DF)
   - bit 2: More Fragments (MF)

   4000 转换为二进制为 0`1`00000000000000，第二个 bits 为 1，表示不需要分组

8. `Fragement Offset`指定分组的报文体相对于总报文的偏移字节量，占据 13 个 bits，最大可以表示(213 – 1) × 8 = 65,528 bytes。4000 转换为二进制为 0100000000000000，后 13 个 bits 表示的便宜量为 0

9. `Time To Live (TTL)`报文的最大保存时间，现在一般用来表示转发次数，即访问路由器的次数，每次访问一次路由器就减 1，变 0 后路由器便丢弃该报文，并发送 ICMP Time Exceeded 给发送方。`40`表示最多转发 64 次

10. `Protocol` 报文体的协议类型，详细见[rfc790](https://tools.ietf.org/html/rfc790),此处`06`表示

11. `Header Checksum` 报文校验值，通过算法计算报文得出一个值，路由器通过比对校验值，确定报文完整性

12. `Source address` 源地址，ip4 的地址一般采用点十表示法，例如`127.0.0.1`在 ip 报文传输过程中，每段 ip 地址使用 8bits 表示，所以 ip 地址每段的取值范围为`0~255`。`0ad3 3706`每两位转换为十进制则是`10.211.55.6`。转换过程大致如下所示
    ![ip_address.png](ip_address.png)

13. `Destination address` 目标地址

14. `Options` 扩展字段
