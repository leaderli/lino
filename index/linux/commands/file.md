---
aliases: 查看文件类型
tags:
  - linux/commands/file
date updated: 2023-08-13 17:19
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

### 文件名通配符

#### *

匹配零个或多个任意字符。
例如，`*.txt`将匹配所有以`.txt`结尾的文件名。

#### ?

匹配一个任意字符
例如，`file?.txt`将匹配类似于`file1.txt`、`fileA.txt`等的文件名。

#### []

匹配指定范围内的任意字符
例如，`file[123].txt`将匹配类似于`file1.txt`、`file2.txt`、`file3.txt`的日志流就的文件名被改名了。

#### [^]

匹配不在指定范围内的任意字符
例如，`file[!abc].txt`将匹配除了`filea.txt`、`fileb.txt`、`filec.txt`之外的文件名。

#### `{}`

用于指定多个模式的选择
例如，`file{11,22}.txt`将匹配`file11.txt`和`file22.txt`。
