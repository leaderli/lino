---
aliases: 查看文件类型
tags:
  - linux/commands/file
date updated: 2022-04-07 15:22
---

用于识别文件类型，查看文件格式

```shell
file [-b] [文件或目录...]
```

`-b` 列出识别结果时，不显示文件名称

```shell
$ file hello.class
hello.class: compiled Java class data, version 52.0 (Java 1.8)

$ file -b hello.class
compiled Java class data, version 52.0 (Java 1.8)
```

^dc4f9b

`-i` 猜测文件的编码

```shell
file -i *
1.txt:                           text/plain; charset=us-ascii
2.txt:                           text/plain; charset=utf-8
```