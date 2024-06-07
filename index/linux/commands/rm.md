---
tags:
  - linux/commands/rm
date updated: 2023-08-20 19:53
---

在使用 `cd dir && rm -rf file` 时需要注意，当 `dir` 不存在时，`rm` 会直接删除当前目录的文件，因此`rm`后跟文件绝对路径

参数

- `-i` 根据 [[linux basic#inode|inode]] 删除文件



```shell
# 当文件数量过多时，可能无法通过 rm -rf * 删除
ls|xargs rm -rf
```
