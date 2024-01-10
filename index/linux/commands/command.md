---
tags:
  - linux/commands/command
date updated: 2023-12-23 21:48
---

查询命令是否存在

```bash
command -v <the_command>
```

```bash
if ! command -v <the_command> &> /dev/null
then
    echo "<the_command> could not be found"
    exit
fi
```

命令的查找路径

通过查找使用冒号分割的多个目录

```shell
$ echo $PATH
/usr/local/bin:/usr/bin:/usr/local/sbin:/usr/sbin:/home/li/.local/bin:/home/li/bin
```

可以在配置文件中添加新的目录

一般是在`/etc/profile` 或者 `~/.bash_profile`

```shell
export PATH=$PATH:/home/li/bin
```
