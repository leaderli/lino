---
tags:
  - linux/commands/wc
date updated: 2023-08-12 19:28
---

- `m` 按char来统计
- `l` 按行来统计
- `w` 按照单词来统计

统计单词数

```shell
$ wc freeswitch.md
#   行数     单词数  byte字节数
    1081    2968   41953 freeswitch.md
$ wc -m freeswitch.md
#  char字数
   30744 freeswitch.md
```
