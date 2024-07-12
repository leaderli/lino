---
tags:
  - linux/commands/df
date updated: 2024-07-12 13:07
---

查看文件系统以及它们的相关信息，显示文件系统的磁盘空间使用情况

- `-h` 使用  `K` 、`M` 、`G` 显示
- `-i` 显示文件系统 inode 使用情况

```shell
~$ df -h
Filesystem               Size  Used Avail Use% Mounted on
devtmpfs                 906M     0  906M   0% /dev
tmpfs                    917M  4.0K  917M   1% /dev/shm
tmpfs                    917M  8.9M  908M   1% /run
tmpfs                    917M     0  917M   0% /sys/fs/cgroup
/dev/mapper/centos-root   29G   16G   14G  55% /
/dev/sda1               1014M  151M  864M  15% /boot
Home                     234G  161G   73G  69% /media/psf/Home
tmpfs                    184M     0  184M   0% /run/user/1002
~$ df -ih
Filesystem              Inodes IUsed IFree IUse% Mounted on
devtmpfs                  227K   362  227K    1% /dev
tmpfs                     230K     2  230K    1% /dev/shm
tmpfs                     230K   569  229K    1% /run
tmpfs                     230K    16  230K    1% /sys/fs/cgroup
/dev/mapper/centos-root    15M  317K   15M    3% /
/dev/sda1                 512K   327  512K    1% /boot
Home                      4.0K     0  4.0K    0% /media/psf/Home
tmpfs                     230K     1  230K    1% /run/user/1002
```

