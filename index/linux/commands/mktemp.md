---
tags:
  - linux/commands/mktemp
date updated: 2022-04-14 11:32
---

创建临时文件，文件名会自动生成

```shell
#根据后面的X个数随机生成n个字符的名称

mktemp -t tmp.XXXXXX
#会生成一个文件 /tmp/tmp.8J6C0Y

mktemp -d tmp.XXXXXX
#会在当前目录下生成一个目录 tmp.SChEBX

mktemp  tmp.XXXX
#会在当前目录下生成一个文件tmp.YTDi
$

name=`mktemp tmp.XXXX`
```
