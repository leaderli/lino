---
tags:
  - linux/commands/lsof
date updated: 2022-04-10 12:55
---

### 概述

lsof（list open files）是一个查看当前系统文件的工具。在 linux 环境下，任何事物都以文件的形式存在，通过文件不仅仅可以访问常规数据，还可以访问网络连接和硬件。如传输控制协议 (TCP) 和用户数据报协议 (UDP) 套接字等，系统在后台都为该应用程序分配了一个文件描述符，该文件描述符提供了大量关于这个应用程序本身的信息。

lsof 打开的文件可以是：

1. 普通文件
2. 目录
3. 网络文件系统的文件
4. 字符或设备文件
5. (函数)共享库
6. 管道，命名管道
7. 符号链接
8. 网络文件（例如：NFS file、网络 socket，unix 域名 socket）
9. 还有其它类型的文件，等等

### 命令参数

- -a 列出打开文件存在的进程
- -c<进程名> 列出指定进程所打开的文件
- -g 列出 GID 号进程详情
- -d<文件号> 列出占用该文件号的进程
- +d<目录> 列出目录下被打开的文件
- +D<目录> 递归列出目录下被打开的文件
- -n<目录> 列出使用 NFS 的文件
- -i<条件> 列出符合条件的进程。（4、6、协议、:端口、 @ip ）
- -p<进程号> 列出指定进程号所打开的文件
- -u 列出 UID 号进程详情
- -h 显示帮助信息
- -v 显示版本信息

### 无参数输出

`lsof`

![linux一切皆文件_2020-05-11-23-35-44.png](linux一切皆文件_2020-05-11-23-35-44.png)

lsof 输出各列信息的意义如下：

#### COMMAND

进程的名称

#### PID

进程标识符

#### PPID

父进程标识符（需要指定-R 参数）

#### USER

进程所有者

#### PGID

进程所属组

#### FD

文件描述符，应用程序通过文件描述符识别该文件。如 cwd、txt 等:

可能的标记如下：

1. `cwd`：表示 current work dirctory，即：应用程序的当前工作目录，这是该应用程序启动的目录，除非它本身对这个目录进行更改

2. `txt` ：该类型的文件是程序代码，如应用程序二进制文件本身或共享库，如上列表中显示的 /sbin/init 程序

3. `lnn`：library references (AIX);

4. `er`：FD information error (see NAME column);

5. `jld`：jail directory (FreeBSD);

6. `ltx`：shared library text (code and data);

7. `mxx` ：hex memory-mapped type number xx.

8. `m86`：DOS Merge mapped file;

9. `mem`：memory-mapped file;

10. `mmap`：memory-mapped device;

11. `pd`：parent directory;

12. `rtd`：root directory;

13. `tr`：kernel trace file (OpenBSD);

14. `v86` VP/ix mapped file;

15. `0`：表示标准输入

16. `1`：表示标准输出

17. `2`：表示标准错误

---

一般在标准输出、标准错误、标准输入后还跟着文件状态模式：r、w、u 等

1. `u`：表示该文件被打开并处于读取/写入模式
2. `r`：表示该文件被打开并处于只读模式
3. `w`：表示该文件被打开并处于
4. `空格`：表示该文件的状态模式为 unknow，且没有锁定
5. `-`：表示该文件的状态模式为 unknow，且被锁定

同时在文件状态模式后面，还跟着相关的锁

1. `N`：for a Solaris NFS lock of unknown type;
2. `r`：for read lock on part of the file;
3. `R`：for a read lock on the entire file;
4. `w`：for a write lock on part of the file;（文件的部分写锁）
5. `W`：for a write lock on the entire file;（整个文件的写锁）
6. `u`：for a read and write lock of any length;
7. `U`：for a lock of unknown type;
8. `x`：for an SCO OpenServer Xenix lock on part of the file;
9. `X`：for an SCO OpenServer Xenix lock on the entire file;
10. `space：if there is no lock.

#### TYPE

文件类型，如 DIR、REG 等，常见的文件类型:

1. DIR：表示目录
2. CHR：表示字符类型
3. BLK：块设备类型
4. UNIX： UNIX 域套接字
5. FIFO：先进先出 (FIFO) 队列
6. IPv4：网际协议 (IP) 套接字

#### DEVICE

指定磁盘的名称

#### SIZE

文件的大小

#### NODE

[[linux basic#inode|索引节点]]（文件在磁盘上的标识）

#### NAME

打开文件的确切名称

### 示例

1. 查找某个文件相关的进程

   ```shell
   lsof /bin/bash
   ```

2. 列出某个用户打开的文件信息,-u 选项，u 是 user 的缩写

   ```shell
   $lsof -u username
   ```

3. 列出某个程序进程所打开的文件信息，`-c` 选项将会列出所有以 mysql 这个进程开头的程序的文件，其实你也可以写成`  lsof | grep mysql ` , 但是第一种方法明显比第二种方法要少打几个字符；

   ```shell
   lsof -c mysql
   ```

4. 列出某个用户以及某个进程所打开的文件信息

   ```shell
   lsof  -u test -c mysql
   ```

5. 通过某个进程号显示该进程打开的文件

   ```shell
   lsof -p 11968
   ```

6. 命令查看当前目录下所有文件夹的大小 -d 指深度，后面加一个数值

   ```shell
   du -d 1 -h
   ```

7. 查询指定目录下被进程开启的文件（使用+D 递归目录）：

   ```shell
   lsof +d mydir1/
   ```

8. 查看端口占用的进程状态：

```shell
lsof -i:3306
```
