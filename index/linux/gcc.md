---
aliases: linux基础知识
tags:
  - linux/gcc
date updated: 2024-07-31 21:51
---

debian

```shell
$ sudo apt update
$ sudo apt upgrade
$ sudo apt install build-essential
$ sudo apt install manpages-dev

$ gcc --version

```

```c
#include <stdio.h>
int main() {
   // printf() displays the string inside quotation
   printf("Hello, World!\r\n");
   return 0;
}
```

```shell
$ gcc hello.c

$ ./a.out

Hello World!
```


编译运行的shell脚本

```shell
if test -z $1
then
	echo '无参数'
	exit 1
fi
c=$(basename -s .c $1)

gcc $1 -o $c
if test -e $c 
then
	./$c
	rm ./$c
fi
```