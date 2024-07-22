---
tags:
  - linux/commands/strace
date updated: 2024-07-19 23:58
---

跟踪系统调用，linux系统支持的系统调用命令可以通过如下方式查看。strace 还可以模拟系统的调用，使系统调用失败等，例如写文件失败等

```shell
$ man syscalls
```

- `-c` 汇总调用时间，调用次数，错误等统计信息
- `-C` 与 `-c`类似，但是还是会正常显示系统调用信息
- `-p` 追踪指定进程的系统调用
- `-f` 跟踪由fork调用所产生的子进程

```shell
$ strace sleep 1
execve("/bin/sleep", ["sleep", "1"], [/* 20 vars */]) = 0
brk(NULL)                               = 0x120c000
mmap(NULL, 4096, PROT_READ|PROT_WRITE, MAP_PRIVATE|MAP_ANONYMOUS, -1, 0) = 0x7ff4e15a6000
access("/etc/ld.so.preload", R_OK)      = -1 ENOENT (No such file or directory)
open("/etc/ld.so.cache", O_RDONLY|O_CLOEXEC) = 3
fstat(3, {st_mode=S_IFREG|0644, st_size=58892, ...}) = 0
mmap(NULL, 58892, PROT_READ, MAP_PRIVATE, 3, 0) = 0x7ff4e1597000
close(3)                                = 0
open("/lib64/libc.so.6", O_RDONLY|O_CLOEXEC) = 3
read(3, "\177ELF\2\1\1\3\0\0\0\0\0\0\0\0\3\0>\0\1\0\0\0\20&\2\0\0\0\0\0"..., 832) = 832
fstat(3, {st_mode=S_IFREG|0755, st_size=2156160, ...}) = 0
mmap(NULL, 3985888, PROT_READ|PROT_EXEC, MAP_PRIVATE|MAP_DENYWRITE, 3, 0) = 0x7ff4e0fb8000
mprotect(0x7ff4e117b000, 2097152, PROT_NONE) = 0
mmap(0x7ff4e137b000, 24576, PROT_READ|PROT_WRITE, MAP_PRIVATE|MAP_FIXED|MAP_DENYWRITE, 3, 0x1c3000) = 0x7ff4e137b000
mmap(0x7ff4e1381000, 16864, PROT_READ|PROT_WRITE, MAP_PRIVATE|MAP_FIXED|MAP_ANONYMOUS, -1, 0) = 0x7ff4e1381000
close(3)                                = 0
mmap(NULL, 4096, PROT_READ|PROT_WRITE, MAP_PRIVATE|MAP_ANONYMOUS, -1, 0) = 0x7ff4e1596000
mmap(NULL, 8192, PROT_READ|PROT_WRITE, MAP_PRIVATE|MAP_ANONYMOUS, -1, 0) = 0x7ff4e1594000
arch_prctl(ARCH_SET_FS, 0x7ff4e1594740) = 0
mprotect(0x7ff4e137b000, 16384, PROT_READ) = 0
mprotect(0x606000, 4096, PROT_READ)     = 0
mprotect(0x7ff4e15a7000, 4096, PROT_READ) = 0
munmap(0x7ff4e1597000, 58892)           = 0
brk(NULL)                               = 0x120c000
brk(0x122d000)                          = 0x122d000
brk(NULL)                               = 0x122d000
open("/usr/lib/locale/locale-archive", O_RDONLY|O_CLOEXEC) = 3
fstat(3, {st_mode=S_IFREG|0644, st_size=106075056, ...}) = 0
mmap(NULL, 106075056, PROT_READ, MAP_PRIVATE, 3, 0) = 0x7ff4daa8e000
close(3)                                = 0
nanosleep({1, 0}, NULL)                 = 0
close(1)                                = 0
close(2)                                = 0
exit_group(0)                           = ?
+++ exited with 0 +++
```

带统计信息

```shell
# strace -C -S calls  sleep 1
execve("/bin/sleep", ["sleep", "1"], [/* 20 vars */]) = 0
brk(NULL)                               = 0x25e1000
mmap(NULL, 4096, PROT_READ|PROT_WRITE, MAP_PRIVATE|MAP_ANONYMOUS, -1, 0) = 0x7f3cf2e4a000
access("/etc/ld.so.preload", R_OK)      = -1 ENOENT (No such file or directory)
open("/etc/ld.so.cache", O_RDONLY|O_CLOEXEC) = 3
fstat(3, {st_mode=S_IFREG|0644, st_size=58892, ...}) = 0
mmap(NULL, 58892, PROT_READ, MAP_PRIVATE, 3, 0) = 0x7f3cf2e3b000
close(3)                                = 0
open("/lib64/libc.so.6", O_RDONLY|O_CLOEXEC) = 3
read(3, "\177ELF\2\1\1\3\0\0\0\0\0\0\0\0\3\0>\0\1\0\0\0\20&\2\0\0\0\0\0"..., 832) = 832
fstat(3, {st_mode=S_IFREG|0755, st_size=2156160, ...}) = 0
mmap(NULL, 3985888, PROT_READ|PROT_EXEC, MAP_PRIVATE|MAP_DENYWRITE, 3, 0) = 0x7f3cf285c000
mprotect(0x7f3cf2a1f000, 2097152, PROT_NONE) = 0
mmap(0x7f3cf2c1f000, 24576, PROT_READ|PROT_WRITE, MAP_PRIVATE|MAP_FIXED|MAP_DENYWRITE, 3, 0x1c3000) = 0x7f3cf2c1f000
mmap(0x7f3cf2c25000, 16864, PROT_READ|PROT_WRITE, MAP_PRIVATE|MAP_FIXED|MAP_ANONYMOUS, -1, 0) = 0x7f3cf2c25000
close(3)                                = 0
mmap(NULL, 4096, PROT_READ|PROT_WRITE, MAP_PRIVATE|MAP_ANONYMOUS, -1, 0) = 0x7f3cf2e3a000
mmap(NULL, 8192, PROT_READ|PROT_WRITE, MAP_PRIVATE|MAP_ANONYMOUS, -1, 0) = 0x7f3cf2e38000
arch_prctl(ARCH_SET_FS, 0x7f3cf2e38740) = 0
mprotect(0x7f3cf2c1f000, 16384, PROT_READ) = 0
mprotect(0x606000, 4096, PROT_READ)     = 0
mprotect(0x7f3cf2e4b000, 4096, PROT_READ) = 0
munmap(0x7f3cf2e3b000, 58892)           = 0
brk(NULL)                               = 0x25e1000
brk(0x2602000)                          = 0x2602000
brk(NULL)                               = 0x2602000
open("/usr/lib/locale/locale-archive", O_RDONLY|O_CLOEXEC) = 3
fstat(3, {st_mode=S_IFREG|0644, st_size=106075056, ...}) = 0
mmap(NULL, 106075056, PROT_READ, MAP_PRIVATE, 3, 0) = 0x7f3cec332000
close(3)                                = 0
nanosleep({1, 0}, NULL)                 = 0
close(1)                                = 0
close(2)                                = 0
exit_group(0)                           = ?
+++ exited with 0 +++
% time     seconds  usecs/call     calls    errors syscall
------ ----------- ----------- --------- --------- ----------------
 34.06    0.000125          16         8           mmap
  6.81    0.000025           5         5           close
 14.99    0.000055          14         4           mprotect
 13.08    0.000048          12         4           brk
  6.54    0.000024           8         3           open
  2.72    0.000010           3         3           fstat
  0.00    0.000000           0         1           read
  9.26    0.000034          34         1           munmap
  0.00    0.000000           0         1         1 access
 11.17    0.000041          41         1           nanosleep
  0.00    0.000000           0         1           execve
  1.36    0.000005           5         1           arch_prctl
------ ----------- ----------- --------- --------- ----------------
100.00    0.000367                    33         1 total
```

一个追踪` tail -f  `的示例

```shell
#  pid 19503
$ tail -f 123.txt


# 开启追踪
$ strace -C -p 19503
```

写入几行信息

```shell
$ echo 123 >> 2.txt
$ echo 456 >> 2.txt
$ echo 789 > 2.txt
```

tail 进程输出

```shell
123
456
tail: 2.txt: file truncated
```

strace进程输出

```shell
strace: Process 19503 attached
read(4, "\1\0\0\0\2\0\0\0\0\0\0\0\0\0\0\0", 22) = 16
fstat(3, {st_mode=S_IFREG|0644, st_size=20, ...}) = 0
read(3, "123\n", 8192)                  = 4
write(1, "123\n", 4)                    = 4
read(3, "", 8192)                       = 0
read(4, "\1\0\0\0\2\0\0\0\0\0\0\0\0\0\0\0", 22) = 16
fstat(3, {st_mode=S_IFREG|0644, st_size=24, ...}) = 0
read(3, "456\n", 8192)                  = 4
write(1, "456\n", 4)                    = 4
read(3, "", 8192)                       = 0
read(4, "\1\0\0\0\2\0\0\0\0\0\0\0\0\0\0\0", 22) = 16
fstat(3, {st_mode=S_IFREG|0644, st_size=4, ...}) = 0
open("/usr/share/locale/locale.alias", O_RDONLY|O_CLOEXEC) = 5
fstat(5, {st_mode=S_IFREG|0777, st_size=2502, ...}) = 0
mmap(NULL, 4096, PROT_READ|PROT_WRITE, MAP_PRIVATE|MAP_ANONYMOUS, -1, 0) = 0x7f84ebc90000
read(5, "# Locale name alias data base.\n#"..., 4096) = 2502
read(5, "", 4096)                       = 0
close(5)                                = 0
munmap(0x7f84ebc90000, 4096)            = 0
open("/usr/share/locale/en_US.UTF-8/LC_MESSAGES/coreutils.mo", O_RDONLY) = -1 ENOENT (No such file or directory)
open("/usr/share/locale/en_US.utf8/LC_MESSAGES/coreutils.mo", O_RDONLY) = -1 ENOENT (No such file or directory)
open("/usr/share/locale/en_US/LC_MESSAGES/coreutils.mo", O_RDONLY) = -1 ENOENT (No such file or directory)
open("/usr/share/locale/en.UTF-8/LC_MESSAGES/coreutils.mo", O_RDONLY) = -1 ENOENT (No such file or directory)
open("/usr/share/locale/en.utf8/LC_MESSAGES/coreutils.mo", O_RDONLY) = -1 ENOENT (No such file or directory)
open("/usr/share/locale/en/LC_MESSAGES/coreutils.mo", O_RDONLY) = -1 ENOENT (No such file or directory)
write(2, "tail: ", 6)                   = 6
write(2, "2.txt: file truncated", 21)   = 21
write(2, "\n", 1)                       = 1
lseek(3, 4, SEEK_SET)                   = 4
read(3, "", 8192)                       = 0
read(4, ^Cstrace: Process 19503 detached
 <detached ...>
% time     seconds  usecs/call     calls    errors syscall
------ ----------- ----------- --------- --------- ----------------
 60.08    0.000143          14        10           read
 14.29    0.000034           5         7         6 open
  9.24    0.000022           4         5           write
  6.30    0.000015          15         1           munmap
  4.62    0.000011           3         4           fstat
  2.94    0.000007           7         1           mmap
  1.68    0.000004           4         1           close
  0.84    0.000002           2         1           lseek
------ ----------- ----------- --------- --------- ----------------
100.00    0.000238                    30         6 total

```

### 控制跟踪

`-e expr` 指定一个表达式,用来控制如何跟踪.格式如下:

`[qualifier=][!]value1[,value2]...`

qualifier 取值范围 （默认trace）

- trace
- abbrev
- verbose
- raw
- signal
- read
- write

`!`是否定符号.例如: `-etrace!=open`表示跟踪除了open以外的其他调用

value是用来限定的符号或数字，有两个特殊的符号 all 和 none.

-eopen等价于 -e trace=open,表示只跟踪open调用.

示例：

- -e trace=set 只跟踪指定的系统 调用.例如:-e trace=open,close,rean,write表示只跟踪这四个系统调用.默认的为set=all.
- -e trace=network 跟踪与网络有关的所有系统调用.
- -e trace=file 只跟踪有关文件操作的系统调用.
