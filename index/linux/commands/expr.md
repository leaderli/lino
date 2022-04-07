---
tags:
  - linux/commands/expr
date updated: 2022-04-07 15:20
---

expr 命令是一个手工命令行计数器，用于在 UNIX/LINUX 下求表达式变量的值，一般用于整数值，也可用于字符串。

### 计算字串长度

```shell
$ expr length “this is a test”
14
```

### 抓取字串

```shell
$ expr substr “this is a test” 3 5
is is
```

### 抓取第一个字符数字串出现的位置

```shell
$ expr index "sarasara" a
2
```

### 整数运算

```shell
$ expr 14 % 9
5
$ expr 10 + 10
20
$ expr 1000 + 900
1900
$ expr 30 / 3 / 2
5
$ expr 30 \* 3 #使用乘号时，必须用反斜线屏蔽其特定含义。因为 shell 可能会误解显示星号的意义
90
$ expr 30 \* 3
$ expr: Syntax error
```
