---
tags:
  - linux/commands/lsblk
date updated: 2022-04-10 12:13
---

`lsblk`命令用于列出块设备的信息，包括磁盘、分区和逻辑卷等

```shell
[root@CentOS7 ~]# lsblk
NAME            MAJ:MIN RM  SIZE RO TYPE MOUNTPOINT
sda               8:0    0   32G  0 disk
├─sda1            8:1    0    1G  0 part /boot
└─sda2            8:2    0   31G  0 part
  ├─centos-root 253:0    0   29G  0 lvm  /
  └─centos-swap 253:1    0    2G  0 lvm  [SWAP]
sr0              11:0    1 1024M  0 rom
```

TYPE列以确定磁盘的类型。常见的磁盘类型包括以下几种：

- `disk`：表示物理磁盘。
- `part`：表示分区。
- `lvm`：表示逻辑卷管理器（LVM）创建的逻辑卷。


可以使用[[disk#blkid]]查看磁盘的文件类型

如果某个分区没有信息，可能未格式化
