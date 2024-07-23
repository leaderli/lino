---
tags:
  - linux/commands/uniq
date updated: 2024-07-23 11:39
---

去重
`uniq` 默认仅会比较相邻的字符串，若需要全部去重，需要先 [[sort]]

- `-c` 显示出现次数
- `-i` 忽略大小写
- `-u` 仅显示不连续重复的
- `-d` 仅显示连续重复的
- `-f num`  忽略前 num 个字符，切割符号为 [[configuration#IFS]]

```bash
$ more 1.txt|uniq -c
   3 a
   3 b
   1 a
```


```shell
$ cat 1.txt
a 1
a 1
a 2
b 2
b 3
b 3
a 4
a 4
c 5
$ uniq -f 1 1.txt
a 1
a 2
b 3
a 4
c 5
$ uniq -f 1 -u 1.txt
c 5
```