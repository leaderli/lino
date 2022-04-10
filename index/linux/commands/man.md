---
tags:
  - linux/commands/man
  - search
date updated: 2022-04-10 14:22
---

在 man 的帮助手册中，将帮助文档分为了 9 个类别，对于有的关键字可能存在多个类别，我们就需要指定特定的类别来查看，一般 bash 命令在 1 类别中。如 `printf` 的三类别，可以使用`man 3 printf`来查看

- `-k` 搜索命令，通常用于在只记得部分命令关键词的场合。

### 显示 ASCII 表

```shell
man ascii
```

当提示

> No manual entry for ascii

可以通过安装  `yum install -y man-pages` 来解决这个问题
