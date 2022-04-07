---
tags:
  - linux/commands/sed
date updated: 2022-04-07 14:56
---

### 合并上下行

```shell

$ cat file.txt
1
a
2
b
3
c

$ sed 'N;s/\n/ /' file.txt

1 a
2 b
3 c
```
