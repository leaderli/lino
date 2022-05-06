---
tags:
  - linux/commands/column
date updated: 2022-05-06 00:24
---

以列的格式显示文件内容

`column [参数] [文件]`

参数：

- `-s` 指定分割符，默认情况下换行
- `-t`  以表格的形式展示列，默认使用空格作为分隔符，可以使用`-s`指定其他分隔符
- `-x`   默认情况下column是先填充列在填充行，此参数则表示先填充行
- `-c` 指定宽度

```shell
$ cat test 
S.No
VM
IP address
RAM
$ column  test 
S.No            VM              IP address      RAM
```

```shell
$ cat test 
S/No.,VM,IP address,RAM
1,win,10.1.1.1,2GB
2,mac,10.1.1.2,2GB
3,centos,10.1.1.3,2GB

$ column  -t test
S/No.,VM,IP            address,RAM
1,win,10.1.1.1,2GB
2,mac,10.1.1.2,2GB
3,centos,10.1.1.3,2GB

$ column  -t test -s ','
S/No.  VM      IP address  RAM
1      win     10.1.1.1    2GB
2      mac     10.1.1.2    2GB
3      centos  10.1.1.3    2GB
```

```shell
$ for (( i=1; i< 30; ++i )) do echo $i ; done > test


$ column  test 
1       4       7       10      13      16      19      22      25      28
2       5       8       11      14      17      20      23      26      29
3       6       9       12      15      18      21      24      27

$ column  -x test 
1       2       3       4       5       6       7       8       9       10
11      12      13      14      15      16      17      18      19      20
21      22      23      24      25      26      27      28      29
$ 

```

```shell
$ column  -x test  -c 30
1       2       3
4       5       6
7       8       9
10      11      12
13      14      15
16      17      18
19      20      21
22      23      24
25      26      27
28      29


$ column  -x test  -c 50
1       2       3       4       5       6
7       8       9       10      11      12
13      14      15      16      17      18
19      20      21      22      23      24
25      26      27      28      29
```
