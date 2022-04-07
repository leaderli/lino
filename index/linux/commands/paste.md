---
tags:
  - linux/commands/paste
date updated: 2022-04-07 15:00
---

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
