---
tags:
  - python/cmd
date updated: 2022-05-12 15:15
---

一个命令行框架，提供可交互的 `cli`，支持补全，帮助文档。

主要的两个方法。

- `Cmd.onecmd(str)`  一次性命令，执行完后即退出。

- `Cmd.cmdloop(intro=None))`  提供类似bash的terminal，支持历史记录，补全等。



## 参考文档

[24.2. cmd — Support for line-oriented command interpreters — Python 3.6.15 documentation](https://docs.python.org/3.6/library/cmd.html)
