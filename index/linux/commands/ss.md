---
tags:
  - linux/commands/ss
date updated: 2022-04-10 12:06
---

Linux 中的 ss 命令是 Socket Statistics 的缩写。顾名思义，ss 命令可以用来获取 socket 统计信息，它可以显示和 [[netstat]] 类似的内容。但 ss 的优势在于它能够显示更多更详细的有关 TCP 和连接状态的信息，而且比[[netstat]] 更快速更高效。

- 查看所有网络连接
  ```shell
  ss
  ```
- 查看所有TCP连接
  ```shell
  ss -ta
  ```
