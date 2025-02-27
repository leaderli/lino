---
tags:
  - linux/commands/tcpdump
date updated: 2022-04-14 10:46
---

tcpdump 是一个命令行实用工具，允许你抓取和分析经过系统的流量数据包。它通常被用作于网络故障分析工具以及安全工具。

使用 tcpdump 抓包，需要管理员权限，因此下面的示例中绝大多数命令都是以 sudo 开头。

tcpdump 会持续抓包直到收到中断信号。你可以按 Ctrl+C 来停止抓包

1. `tcpdump -D` 命令列出可以抓包的网络接口

   ```shell
   $ sudo tcpdump -D
   1.eth0
   2.virbr0
   3.eth1
   4.any (Pseudo-device that captures on all interfaces)
   5.lo [Loopback]
   ```

2. `-i` 抓取指定网络接口的数据，其中特殊接口 any 可用于抓取所有活动的网络接口的数据包。

3. `-c` 选项可以用于限制 tcpdump 抓包的数量：

4. `-nn` 显示端口号

5. `-w` 命令将抓取的数据包保存到文件，默认值只保存包头

6. `-X` 以十六进制打印出数据报文内容

7. `-A` 以 ASCII 值打印出数据报文内容，中文会显示为 `...`

8. `-r` tcpdump 若在`-W`保存文件不使用`-X`或`-A`时会将数据包保存在二进制文件中，所以不能简单的用文本编辑器去打开它。使用 -r 选项参数来阅读该文件中的报文内容，你还可以使用我们讨论过的任何过滤规则来过滤文件中的内容，就像使用实时数据一样

## 报文字段解释

tcpdump 能够抓取并解码多种协议类型的数据报文，如 TCP、UDP、ICMP 等等。虽然这里我们不可能介绍所有的数据报文类型，但可以分析下 TCP 类型的数据报文，来帮助你入门。更多有关 tcpdump 的详细介绍可以参考其 帮助手册。tcpdump 抓取的 TCP 报文看起来如下：

> 08:41:13.729687 IP 192.168.64.28.22 > 192.168.64.1.41916: Flags [P.], seq 196:568, ack 1, win 309, options [nop,nop,TS val 117964079 ecr 816509256], length 372

具体的字段根据不同的报文类型会有不同，但上面这个例子是一般的格式形式。

- `08:41:13.729687` 是该数据报文被抓取的系统本地时间戳。

- `IP` 是网络层协议类型，这里是 IPv4，如果是 IPv6 协议，该字段值是 IP6。

- `192.168.64.28.22` 是源 ip 地址和端口号，

- `192.168.64.1.41916` 紧跟其后的是目的 ip 地址和其端口号

- `Flags [P.]`可以看到是 TCP 报文标记段 Flags [P.]。该字段通常取值如下：

  |  值  | 标志类型 | 描述                |
  | :-: | :--: | :---------------- |
  |  S  |  SYN | Connection Start  |
  |  F  |  FIN | Connection Finish |
  |  P  | PUSH | Data push         |
  |  R  |  RST | Connection reset  |
  |  .  |  ACK | Acknowledgment    |

  该字段也可以是这些值的组合，例如 [S.] 代表 SYN-ACK 数据包。

- `seq 196:568` 是该数据包中数据的序列号。对于抓取的第一个数据包，该字段值是一个绝对数字，后续包使用相对数值，以便更容易查询跟踪。例如此处 seq 196:568 代表该数据包包含该数据流的第 196 到 568 字节。

- `ack 1`。该数据包是数据发送方，ack 值为 1。在数据接收方，该字段代表数据流上的下一个预期字节数据，例如，该数据流中下一个数据包的 ack 值应该是 568。

- `win 309` 是接收窗口大小 ，它表示接收缓冲区中可用的字节数，后跟 TCP 选项如 MSS（最大段大小）或者窗口比例值。更详尽的 TCP 协议内容请参考 Transmission Control Protocol(TCP) Parameters。

- `length 372` 代表数据包有效载荷字节长度。这个长度和 seq 序列号中字节数值长度是不一样的。

## 过滤报文

现在让我们学习如何过滤数据报文以便更容易的分析定位问题。

1. 用 host 参数只抓取和特定主机相关的数据包：

   ```shell
   sudo tcpdump -i any -c5 -nn host 54.204.39.132
   ```

2. 用 src 就是按源 IP/主机名来筛选数据包。

   ```shell
   sudo tcpdump -i any -c5 -nn src 54.204.39.132
   ```

3. 用 dst 就是按目的 IP/主机名来筛选数据包。

   ```shell
   sudo tcpdump -i any -c5 -nn dst 54.204.39.132
   ```

4. 用 port 参数根据端口号来筛选数据包

   ```shell
   sudo tcpdump -i any -c5 -nn port 80
   sudo tcpdump -i any -c5 -nn src port 80
   sudo tcpdump -i any -c5 -nn dst port 80

   ```

5. 按协议过滤

   ```shell
   # enp0s3 为网络设置  tcpdump -D
   tcpdump -i enp0s3 arp
   tcpdump -i enp0s3 ip
   tcpdump -i enp0s3 tcp
   tcpdump -i enp0s3 udp
   tcpdump -i enp0s3 icmp
   
   tcpdump -i enp0s3 host 54.204.39.132 and udp
   ```


6. 使用 not

```shell
   sudo tcpdump -i any -c5 -nn dst not 54.204.39.132
```
当然，可以使用多条件组合来筛选数据包，使用 and 以及 or 逻辑操作符来创建过滤规则。例如，筛选来自源 IP 地址 192.168.122.98 的 HTTP 数据包：

```shell
sudo tcpdump -i any -c5 -nn src 192.168.122.98 and port 80
```

你也可以使用括号来创建更为复杂的过滤规则，但在 shell 中请用引号包含你的过滤规则以防止被识别为 shell 表达式：

```shell
sudo tcpdump -i any -c5 -nn "port 80 and (src 192.168.122.98 or src 54.204.39.132)"

```

## 高级筛选

以 ip 报文为例

下面为 ip 报文的报文头信息说明

```txt
 0 1 2 3 4 5 6 7 0 1 2 3 4 5 6 7 0 1 2 3 4 5 6 7 0 1 2 3 4 5 6 7
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|Version|  IHL  |Type of Service|          Total Length         |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|         Identification        |Flags|      Fragment Offset    |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|  Time to Live |    Protocol   |         Header Checksum       |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                       Source Address                          |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                    Destination Address                        |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                    Options                    |    Padding    | <-- optional
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                            DATA ...                           |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+

```

通过指定位置的字节进行筛选

```shell
# proto 即协议类型 ip tcp 等
# 一个字节占据8位byte
proto[x:y]          : 过滤从x字节开始的y字节数。比如ip[2:2]过滤出3、4字节（第一字节从0开始排）
proto[x:y] & z = 0  : proto[x:y]和z的与操作为0
proto[x:y] & z !=0  : proto[x:y]和z的与操作不为0
proto[x:y] & z = z  : proto[x:y]和z的与操作为z
proto[x:y] = z      : proto[x:y]等于z
```

操作符：

```txt
>  : greater 大于
<  : lower 小于
>= : greater or equal 大于或者等于
<= : lower or equal 小于或者等于
=  : equal  等于
!= : different  不等于
```

当我们访问一个地址比如说`curl 172.20.10.4:4000`时，通过抓包我们可以得到请求的报文内容

```txt
0x0000:  4500 0078 48a2 4000 4006 f9ec 0ad3 3706  E..xH.@.@.....7.
0x0010:  ac14 0a04 9340 0fa0 7a28 0f8a a297 21db  .....@..z(....!.
0x0020:  5018 00e5 f85b 0000 4745 5420 2f20 4854  P....[..GET./.HT
0x0030:  5450 2f31 2e31 0d0a 5573 6572 2d41 6765  TP/1.1..User-Age
0x0040:  6e74 3a20 6375 726c 2f37 2e32 392e 300d  nt:.curl/7.29.0.
0x0050:  0a48 6f73 743a 2031 3732 2e32 302e 3130  .Host:.172.20.10
0x0060:  2e34 3a34 3030 300d 0a41 6363 6570 743a  .4:4000..Accept:
0x0070:  202a 2f2a 0d0a 0d0a 0000 0000 0000 0000  .*/*............
0x0080:  0000 0000 0000 0000                      ........
```

报文内容以 16 进制展示，一个字节即为 2 位 16 进制数字，我们可以看到第 40 个字节后的`4745 5420`即为内容<code>GET </code>

```shell
sudo tcpdump -i any 'ip[40:4] = 0x47455420' -A -nn -f
```

	来抓取数据报文中中请求方法为<code>GET </code>的请求

## 示例

```shell
#  报文长度大于100
tcpdump -n -i any -A -x dst port 443 and greater 100
```



## 参考文档

[[wireshark]]