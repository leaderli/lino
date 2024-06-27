---
tags:
  - linux/commands/strings
date updated: 2024-06-27 12:26
---

将二进制文件输出可打印字符串

```shell
$ echo -e "\x48\x65\x6C\x6C\x6F" | strings
Hello
```