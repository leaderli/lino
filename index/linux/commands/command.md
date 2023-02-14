---
tags:
  - linux/commands/command
date updated: 2022-05-06 00:24
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