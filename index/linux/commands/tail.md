---
tags:
  - linux/commands/tail
date updated: 2022-04-07 14:36
---

- -n 输出最后几行 `-n0` 即一个也不输出

```shell
awk '{print};/222/{exit}' < <(tail -f -n0 1.txt|grep --line-buffered 1)
#当向文件1.txt分别输入000,001,222,1222时，会
001
1222 #命令结束执行
```

跟踪 `bin` 文件

```shell
tail -f somefile | hexdump -C
```
