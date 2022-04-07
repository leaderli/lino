---
tags:
  - linux/commands/sort
date updated: 2022-04-07 13:45
---

对输出内容进行排序，默认情况下 `sort`  仅比较 `ASCII` 字符。

- -n 以数字大小来排序
- -k, --key=KEYDEF 指定使用第几个字段进行排序
- -t，--field-separator=xxx 使用 `xxx` 替换默认的空格作为间隔符
- -r 反向排序

```shell
~$ cat 1.txt
2   c
10  a
300 b

~$ sort 1.txt
10  a
2   c
300 b

~$ sort -n 1.txt
2   c
10  a
300 b

~$ sort -k 2 1.txt
10  a
300 b
2   c

~$ cat 2.txt
2:c
10:a
300:b

~$ sort  -t ':' -k 2  2.txt
10:a
300:b
2:c
```
