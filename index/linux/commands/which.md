---
tags:
  - linux/commands/which
date updated: 2022-04-07 09:35
---

在 PATH 变量指定的路径中，搜索某个系统命令的位置，并且返回第一个搜索结果。也就是说，使用 which 命令，就可以看到某个系统命令是否存在，以及执行的到底是哪一个位置的命令。

```shell
$ which vi
alias vi='vim'
   /usr/bin/vim
```

如果找不到，可以尝试 whereis，该命令搜索更大范围的系统目录。或者尝试使用[[locate]]
