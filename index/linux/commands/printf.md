---
tags:
  - linux/commands/printf
date created: 2022-04-05 18:01
date updated: 2024-02-28 20:20
---

将十进制转换未16进制

```shell
$ printf "%x\n" 10

a


# 0x0f字符不可见
$ printf  '\x0f'|cat -A
$ printf  '\x0f'|cat -A

```
