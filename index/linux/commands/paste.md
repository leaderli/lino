---
tags:
  - linux/commands/paste
date updated: 2022-04-07 15:00
---

`-d` 使用其他间隔符，而不是默认的`tab`
`-s` 一个一个文件执行，而不是多个文件平行执行
### 合并多行

```shell
$ cat 1.txt
1
a
2
b
$ cat 1.txt| paste -sd ","
1,a,2,b
```

```shell
~$ more 1.txt
1
2
3
~$ more 2.txt
a
b
c
~$ paste  1.txt  2.txt
1	a
2	b
3	c
~$ paste -d ',' 1.txt  2.txt
1,a
2,b
3,c
```
