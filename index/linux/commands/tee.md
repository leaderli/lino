---
tags:
  - linux/commands/tee
date updated: 2022-04-10 12:19
---

同时向某个文件写入内容

```shell
$ echo 123|tee 1.txt
123
$ cat 1.txt
123
```

- -a 追加
