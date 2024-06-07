---
aliases: linux基础知识
tags:
  - linux/basic
date updated: 2023-05-15 21:59
---

## 用户

linux 的用户分为以下几类

1. root 用户，拥有系统的最高权限，任何文件的权限对 root 用户都是无效的。

2. 普通用户，指可以登录系统，拥有自己的主目录并且能够在主目录创建目录和操作文件的用户

3. 系统用户，又称虚拟用户和伪用户，其不具备登录系统的能力。这些用户用于特定的系统目的，如用来执行特定子系统完成服务所需要的进程等。系统用户的账号不属于任何人，是在系统安装或软件安装过程中默认创建的。

4. 当使用 `sudo` 还是无法运行命令时，需要将当前用户写入到 `/ect/sudoers` 配置中，在
   `root ALL=(ALL) ALL` 下新增一行`[user] ALL = (ALL) ALL`

在 linux 系统下创建的用户的信息都被写在 `/etc/passwd` 这个文件中永久性保存，用户的密码经过 MD5 加密后存放在称为影子文件的 `/etc/shadow` 中

![[w]]

### 密码过期时间

`/etc/login.defs`  它主要用于用户账号限制

```conf
PASS_MAX_DAYS 60        #密码最大有效期，此处参数PASS_MAX_DAYS为60，表示60天后，密码会过期，99999表示永不过期
PASS_MIN_DAYS 0         #两次修改密码的最小间隔时间，0表示可以随时修改账号密码
PASS_MIN_LEN  8         #密码最小长度，对于root无效
PASS_WARN_AGE 7         #密码过期前多少天开始提示
```

## 文件描述符

在 linux 中，对于每个进程（pid），所有打开的文件都是通过文件描述符引用的，文件描述符就是从 0 开始的小的非负整数，内核用以标识一个特定进程正在访问的文件。当打开一个文件或创建一个文件，就会在 `/proc/{pid}/fd` 生成一个可以访问该文件的文件描述符，通过该文件描述符，可以直接去访问该文件

我们可以在`/proc/{pid}/fd`中查看到当前进程相关的文件描述符

```shell
#self 代表当前进程
$ ll /proc/self/fd
total 0
lrwx------. 1 root root 64 2020-09-20 06:36:30 0 -> /dev/pts/0
lrwx------. 1 root root 64 2020-09-20 06:36:30 1 -> /dev/pts/0
lrwx------. 1 root root 64 2020-09-20 06:36:30 2 -> /dev/pts/0
lr-x------. 1 root root 64 2020-09-20 06:36:30 3 -> /proc/4781/fd


#查看当前文件描述
$ lsof -a -p $$

# 查看文件描述符0，1，2
$ lsof -a -p $$ -d 0,1,2
COMMAND  PID USER   FD   TYPE DEVICE SIZE/OFF NODE NAME
bash    6145   li    0u   CHR  136,1      0t0    4 /dev/pts/1
bash    6145   li    1u   CHR  136,1      0t0    4 /dev/pts/1
bash    6145   li    2u   CHR  136,1      0t0    4 /dev/pts/1

```

Linux 进程默认情况下会有三个缺省打开的文件描述符

- 0（标准输入）`stdin`
- 1（标准输出）`stdout`
- 2（标准错误）`stderr`

我们可以看到 `0`，`1`，`2` 都执行`/dev/pts/0`，其代表当前登录的 bash 终端，也就是说默认情况下输入输出错误都是在终端的 bash 界面上操作的

```shell
$ tty
/dev/pts/0
```

当我们以另外一个用户登录并 `tail -f` 文件

```shell
$ ps -ef|grep tail
li       10570  7534  0 21:04 pts/2    00:00:00 tail -f 1.txt

# 我们查看其fd
$ ll /proc/10570/fd
total 0
lrwx------. 1 li li 64 2020-09-17 21:04:59 0 -> /dev/pts/2
lrwx------. 1 li li 64 2020-09-17 21:04:59 1 -> /dev/pts/2
lrwx------. 1 li li 64 2020-09-17 21:04:19 2 -> /dev/pts/2
lr-x------. 1 li li 64 2020-09-17 21:04:59 3 -> /home/li/1.txt
lr-x------. 1 li li 64 2020-09-17 21:04:59 4 -> anon_inode:inotify

# 我们向文件描述符写入一些msg
$ echo '0' > 0
$ echo '1' > 1
$ echo '2' > 2
$ echo '3' > 3

#我们可以在li这个终端上观察到

li$ tail -f 1.txt
0
1
2
3

#我们可以看到1.txt被写入了内容
li$ more 1.txt
3
```

## 文件系统

`linux` 一切都是基于文本的，许多操作文本的命令都可以对其他各种命令其作用，比如说 [[grep]] ，可以作用于 [[top]]


linux 使用虚拟目录来管理硬盘，第一个被加载的硬盘被视为 root 驱动器，root 驱动包含虚拟目录的核心部分，在 root 驱动器上，linux 创建一个特殊的目录被称为 mount points,用来挂载其他硬盘。使用虚拟目录可以将所有文件都存储在一起，尽管他们可能存储在不同的硬盘上，通常来说，系统的核心文件存储在 root 驱动器上。

**Linux 系统中常见的目录名称以及相应内容**

| 目录名称        | 说明                                |
| ----------- | --------------------------------- |
| /boot       | 开机所需文件——内核、开机菜单以及所需配置文件等等         |
| /dev        | 以文件形式存放任何设备与接口                    |
| /etc        | 配置文件                              |
| /home       | 用户家目录                             |
| /bin        | 存放单用户模式下还可以操作的命令                  |
| /lib        | 开机时用到的函数库，以及/bin与/sbin下面的命令要调用的函数 |
| /sbin       | 开机过程中需要的命令                        |
| /media      | 用于挂载设备文件的目录                       |
| /opt        | 放置第三方的软件                          |
| /root       | 系统管理员的家目录                         |
| /srv        | 一些网络服务的数据文件目录                     |
| /tmp        | 任何人均可使用的“共享”临时目录                  |
| /proc       | 虚拟文件系统，例如系统内核、进程、外部设备及网络状态等       |
| /usr/local  | 用户自行安装的软件                         |
| /usr/sbin   | Linux系统开机时不会使用到的软件/命令/脚本          |
| /usr/share  | 帮助与说明文件，也可放置共享文件                  |
| /var        | 主要存放经常变化的文件，如日志                   |
| /lost+found | 当文件系统发生错误时，将一些丢失的文件片段存放在这里        |


### dev

| 设备类型      | 设备文件                |
| --------- | ------------------- |
| IDE 设备    | /dev/hd[a-d]        |
| SATA 设备   | /dev/sd[a-z]        |
| U 盘       | /dev/sd[a-z]        |
| Virtio 设备 | /dev/vd[a-z]        |
| 软驱        | /dev/fd[0-1]        |
| 打印机       | /dev/lp[0-15]       |
| 光驱        | /dev/cdrom          |
| 鼠标        | /dev/mouse          |
| 磁带机<br>   | /dev/st0 或 /dev/ht0 |


现在一般硬盘设置都是 `/dev/sd` ，用 `a~z` 来代表不同的硬盘（默认从a开始分配），硬盘分区主分区或扩展分区的编号从1开始，到4结束，逻辑分区从编号5开始。

例如 `/dev/sda5`
![[Pasted image 20240527123348.png]]

扩展分区其 实并不是一个真正的分区，而更像是一个占用 16 字节分区表空间的指针— 一个指向另外一 个分区的指针。这样一来，用户一般会选择使用 3 个主分区加 1 个扩展分区的方法，然后在 扩展分区中创建出数个逻辑分区，从而来满足多分区(大于 4 个)的需求

![[Pasted image 20240527123637.png]]

### proc 目录

Linux 内核提供了一种通过 proc 文件系统，在运行时访问内核内部数据结构、改变内核设置的机制。proc 文件系统是一个伪文件系统，它只存在内存当中，而不占用外存空间。它以文件系统的方式为访问系统内核数据的操作提供接口。

1. cmdline 启动时传递给 kernel 的参数信息

2. cpuinfo cpu 的信息

3. filesystems 内核当前支持的文件系统类型

4. locks 内核锁住的文件列表

5. meminfo RAM 使用的相关信息

6. swaps 交换空间的使用情况

7. version Linux 内核版本和 gcc 版本

8. self 链接到当前正在运行的进程

proc 目录下一些以数字命名的目录，它们是进程目录。系统中当前运行的每一个进程都有对应的一个目录在 proc 下，以进程的 PID 号为目录名，它们是读取进程信息的接口。而 self 目录则是读取进程本身的信息接口，是一个 link。

1. `/proc/[pid]/cmdline` 该进程的命令及参数

2. `/proc/[pid]/comm` 该进程的命令

3. `/proc/[pid]/cwd` 进程工作目录

4. `/proc/[pid]/environ` 该进程的环境变量

5. `/proc/[pid]/exe` 该进程命令的实际命令地址

6. `/proc/[pid]/fd` 该进程打开的文件描述符

7. `/proc/[pid]/maps` 显示进程的内存区域映射信息

8. `/proc/[pid]/statm` 显示进程所占用内存大小的统计信息 。包含七个值，度量单位是 page(page 大小可通过 getconf PAGESIZE 得到)。举例如下：

   ```shell
   $ cat statm
   26999 154 130 15 0 79 0

   ```

   - a）进程占用的总的内存
   - b）进程当前时刻占用的物理内存
   - c）同其它进程共享的内存
   - d）进程的代码段
   - e）共享库(从 2.6 版本起，这个值为 0)
   - f）进程的堆栈
   - g）dirty pages(从 2.6 版本起，这个值为 0)

9. `/proc/[pid]/status` 包含进程的状态信息。

   ```shell
   $ cat /proc/2406/status
   Name:   frps
   State:  S (sleeping)
   Tgid:   2406
   Ngid:   0
   Pid:    2406
   PPid:   2130
   TracerPid:  0
   Uid:    0   0   0   0
   Gid:    0   0   0   0
   FDSize: 128
   Groups: 0
   NStgid: 2406
   NSpid:  2406
   NSpgid: 2406
   NSsid:  2130
   VmPeak:    54880 kB
   VmSize:    54880 kB
   VmLck:         0 kB
   VmPin:         0 kB
   VmHWM:     34872 kB
   VmRSS:     10468 kB
   VmData:    47896 kB
   VmStk:       132 kB
   VmExe:      2984 kB
   VmLib:         0 kB
   VmPTE:        68 kB
   VmPMD:        20 kB
   VmSwap:        0 kB
   HugetlbPages:          0 kB
   Threads:    11
   SigQ:   0/31834
   SigPnd: 0000000000000000
   ShdPnd: 0000000000000000
   SigBlk: 0000000000000000
   SigIgn: 0000000000000000
   SigCgt: fffffffe7fc1feff
   CapInh: 0000000000000000
   CapPrm: 0000003fffffffff
   CapEff: 0000003fffffffff
   CapBnd: 0000003fffffffff
   CapAmb: 0000000000000000
   Seccomp:    0
   Cpus_allowed:   f
   Cpus_allowed_list:  0-3
   Mems_allowed:   00000000,00000001
   Mems_allowed_list:  0
   voluntary_ctxt_switches:    2251028
   nonvoluntary_ctxt_switches: 18031
   ```

### atime

atime是Linux/UNIX系统下的一个文件属性，每当读取文件时，操作系统都会将读操作发生的时间回写到磁盘上。对于读写频繁的数据库文件来说，记录文件的访问时间一般没有任何用处，却会增加磁盘系统的负担，影响I/O的性能！因此，可以通过设置文件系统的mount属性，阻止操作系统写atime信息，以减轻磁盘I/O的负担。在Linux下的具体做法如下。

1. 修改文件系统配置文件/etc/fstab，指定noatime选项：`LABEL=/home /home ext3 noatime 1 2`
2. 重新mount文件系统：`mount -oremount /home`

## inode

数据是保存在磁盘中的，磁盘上最小存储数据的是扇区，每个扇区一般都可以存放512字节的数据。

当数据大于512字节的时候，磁盘需要不停地移动磁头来查找数据，为了效率一一般将多个扇区合并为一个块，一个块多为4KB。文件数据都存储在块中，那么很显然，我们还必须找到一个地方存储文件的元数据，比如文件的创建者、文件的创建时间、文件的大小等等。这种存储文件元数据的区域就叫做inode，中文译名为索引节点

里面记录如下信息：

1. 该文件的访问权限(read、write、execute);
2. 该文件的所有者与所属组(owner、group);
3. 该文件的大小(size);
4. 该文件的创建或内容修改时间(Ctime);
5. 该文件的最后一次访问时间(Atime);
6. 该文件的修改时间(Mtime);
7. 文件的特殊权限(SUID、SGID、SBIT);
8. 该文件的真实数据地址(point)。


而文件的实际内容则保存在 block 块中(大小一般是 1KB、2KB 或 4KB)，一个 inode 的 默认大小仅为 128 字节，记录一个 block 则消耗 4 字节。当文件的 inode 被写满后，Linux 系 统会自动分配出一个 block，专门用于像 inode 那样记录其他 block 块的信息，这样把各个 block 块的内容串到一起，就能够让用户读到完整的文件内容了。对于存储文件内容的 block 块，有 下面两种常见的情况(以 4KB 大小的 block 为例进行说明)。

-   情况 1:文件很小(1KB)，但依然会占用一个 block，因此会潜在地浪费 3KB
-  情况 2:文件很大(5KB)，那么会占用两个 block(5KB−4KB 后剩下的 1KB 也要占用一个 block)
### 参考文档

[Linux文件系统和inode - 简书](https://www.jianshu.com/p/9ef6542ced92)

## 链接

![[ln]]

## 其他

### 列出所有用户

```shell
awk -F: '{ print $1}' /etc/passwd
```

```shell
cut -d: -f1 /etc/passwd
```

### 重复执行上次命令

1. 使用上方向键，并回车执行。

2. 按 `!!` 并回车执行。

3. 输入`  !-1 ` 并回车执行。`!-n` 执行上第 n 条命令

4. 按 `Ctrl+P` 并回车执行。

```ad-info
可以使用 `sudo`，以 root 用户执行上条命令

`sudo !!`

`sudo !-1`
```

### root 用户无法加载 bash_profile

在尝试通过使用 `su root` 登录到 root 用户， `/var/root/.bash_profile` 的环境变量始终无法加载。
通过查看 `su` 的文档
`su` 会以当前登录用户的 session 去切换用户，而 `su -` 会重新登录

```
The su command is used to become another user during a login session. Invoked without a username, su defaults to becoming the superuser. The optional argument - may be used to provide an environment similar to what the user would expect had the user logged in directly.
```

同时

```
-, -l, --login
Provide an environment similar to what the user would expect had the user logged in directly.
```

使用 `su - root` 则可正常加载环境配置

下述问题也是这样的原因，可以通过上述方式去解决

> autojump_add_to_database command not found

### `./`执行脚本头文件不存在

> !#/usr/bin/python3: No such file or directory

因为复制粘贴 `!#/usr/bin/python3` 时带上了不可见的换行或其他字符

通过命令`$ head -1 yourscript | od -c` 文件的头文件的

- `0000000 # ! / b i n / b a s h \r \n`
- `0000000 357 273 277 # ! / b i n / b a s h \n`
- `0000000 # ! / b i n / b a s h \n`（这样的才是正确的输出）

> od 指令会读取所给予的文件的内容，并将其内容以八进制字码呈现出来

### 判断当前是否为 root 用户执行

```shell
#!/bin/bash
if [[ $EUID -eq 0 ]]; then
   echo "this is root"
   exit 1
fi
```

### 睡眠

```shell
sleep 3 #暂停3秒
echo 'ok'
```

### Your password has expired

修改密码
[[#密码过期时间]]

### 查看系统编码等

```shell
$ locale
LANG=en_US.UTF-8
LC_CTYPE="en_US.UTF-8"
LC_NUMERIC="en_US.UTF-8"
LC_TIME="en_US.UTF-8"
LC_COLLATE="en_US.UTF-8"
LC_MONETARY="en_US.UTF-8"
LC_MESSAGES="en_US.UTF-8"
LC_PAPER="en_US.UTF-8"
LC_NAME="en_US.UTF-8"
LC_ADDRESS="en_US.UTF-8"
LC_TELEPHONE="en_US.UTF-8"
LC_MEASUREMENT="en_US.UTF-8"
LC_IDENTIFICATION="en_US.UTF-8"
LC_ALL=

```


### Resource temporarily unavailable

使用df命令，查看 inode 资源是否占满了
