---
tags:
  - linux/commands/type
date updated: 2022-04-14 11:23
---

查看命令的详情

- `-a` 列出包含别名(alias)在内的指定命令名的命令
- `-p` 显示完整的文件名称
- `-t` 显示文件类型，其文件类型主要有两种，一种是 builtin，为 bash 的内置命令；另一种是 file，为外部命令

```shell
$ type type

type is a shell builtin

$ type mv 
mv is /bin/mv
```
