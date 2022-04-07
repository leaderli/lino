---
tags:
  - linux/commands/cat
date updated: 2022-04-07 09:51
---

将文件内容连接后传输到标准输出，tac 和 cat 用法一致，但是从最后一行读取

- -A ： 显示回车尾行等特殊字符
- -n(number) ：从第一行开始对文件输出的所有行进行编号
- -b ：忽略空白行的编号

显示目录并给每个文件加上一个编号

```shell
ls |cat -n
```
