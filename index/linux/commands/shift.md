---
tags:
  - linux/commands/shift
date updated: 2022-04-07 13:45
---

用于处理参数位置，每次调用shift时，它将所有参数位置上的参数向左移动一位。

```shell
$ cat shift.sh 
echo $1
shift
echo $1
shift
echo $1
$ sh shift.sh  1 2 3 
1
2
3
```


`shift n `向左移动 n 个参数