---
tags:
  - 软件/wireshark
date updated: 2024-09-19 20:09
---

wireshark 显示过滤器表达式是根据 `协议` + `.` + `属性` 来判断的。

基础使用的 [官方文档](https://wiki.wireshark.org/DisplayFilters)

全部的协议属性列表见 [官方文档](https://www.wireshark.org/docs/dfref/)

各种协议的 [wiki 地址](https://wiki.wireshark.org/ProtocolReference)

## 过滤器表达式基本语法

| english      | c-like | desc                               |       |
| :----------- | :----- | :--------------------------------- | ----- |
| eq           | ==     | ip.src=10.0.0.5                    |       |
| ne           | !=     | ip.src!=10.0.0.5                   |       |
| gt           | >      | frame.len>10                       |       |
| lt           | <      | frame.len<10                       |       |
| ge           | >=     | frame.len>=10                      |       |
| le           | <=     | frame.len<=10                      |       |
| contains     |        | sip.TO contains "a123"             |       |
| matches      | ~      | 使用正则，http.host matches "acme.(org  | com)" |
| bitewire_and | &      | 二进制 and 运算结果不为 0， tcp.flags & 0x02 |       |

数字值可以使用十进制、八进制、十六进制

```yaml
ip.len le 1500
ip.len le 02734
ip.len le 0x5dc
```

布尔类型的值可以使用 `1` (true), `0` (false)

网络地址可以使用 `:` , `.` , `-` 分割

```properties
eth.dst == ff:ff:ff:ff:ff:ff
eth.dst == ff-ff-ff-ff-ff-ff
eth.dst == ffff.ffff.ffff
ip.addr == 192.168.0.1
```

可以比较字符串

```properties
http.request.uri == "https://www.wireshark.org/"
udp contains 81:60:03
```

## 过滤器表达式组合语法

| english | c-like | desc                                  |                                     |
| :------ | :----- | :------------------------------------ | ----------------------------------- |
| and     | &&     | ip.src==10.0.0.5 and tcp.flags.fin    |                                     |
| or      |        |                                       | ip.src==10.0.0.5 or ip.src=10.0.0.6 |
| xor     | ^^     | tr.src==10.0.0.5 xor tr.dst==10.0.0.5 |                                     |
| not     | !      | not tcp                               |                                     |
| [...]   |        | 子序列比较                                 |                                     |
| in      |        | 是否在集合中                                |                                     |

一些示例

```python
eth.src[0:3] == 00:00:83
eth.src[2] == 83

tcp.port in {80 443 8080}
# 等效于
tcp.port == 80 || tcp.port == 443 || tcp.port == 8080

tcp.port in {443 4430..4434}
#不等效于，因为port指代的可能是source，也可能是destination，而下述的每个判断是分别进行的
tcp.port == 443 || (tcp.port >= 4430 && tcp.port <= 4434)
```

## 查看中文报文

![[Pasted image 20240919200926.png]]

选中对应的内容，并右键 **Follow -> HTTP Stream**
![[Pasted image 20240919200946.png]]

之后会有一个弹窗，展示整个http会话过程，红色部分为请求，蓝色部分为响应，我们可以将右下角的Show data as **ASCII**改为Show data as **UTF-8**，以便正确展示中文内容

![[Pasted image 20240919200900.png]]

## 参考文档

各种类型的网络包的demo文件

[SampleCaptures - Wireshark Wiki](https://wiki.wireshark.org/SampleCaptures#sip-and-rtp)
