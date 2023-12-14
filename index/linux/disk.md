---
aliases: 磁盘
tags:
  - linux/disk
date updated: 2022-04-14 11:18
---


给某个目录挂载一个分区的详细步骤

```shell
# 显示系统中所有磁盘的分区信息，包括磁盘设备名称、分区类型、起始扇区和大小等
$ fdisk -l 

#用于显示块设备信息的命令行工具。它以树状结构的形式列出系统中的块设备，包括硬盘、分区、逻辑卷等
$ lsblk
NAME            MAJ:MIN RM  SIZE RO TYPE MOUNTPOINT
sda               8:0    0   32G  0 disk
├─sda1            8:1    0    1G  0 part /boot
└─sda2            8:2    0   31G  0 part
  ├─centos-root 253:0    0   29G  0 lvm  /
  └─centos-swap 253:1    0    2G  0 lvm  [SWAP]
sr0              11:0    1 1024M  0 rom

#是一个用于显示卷组（Volume Group）信息的命令行工具。卷组是逻辑卷管理器（LVM）中的一个概念，它将物理磁盘合并成一个逻辑单元，为逻辑卷提供存储空间
$ vgdisplay
  --- Volume group ---
  VG Name               centos
  System ID
  Format                lvm2
  Metadata Areas        1
  Metadata Sequence No  3
  VG Access             read/write
  VG Status             resizable
  MAX LV                0
  Cur LV                2
  Open LV               2
  Max PV                0
  Cur PV                1
  Act PV                1
  VG Size               <31.00 GiB
  PE Size               4.00 MiB
  Total PE              7935
  Alloc PE / Size       7934 / 30.99 GiB
  Free  PE / Size       1 / 4.00 MiB
  VG UUID               Y28iBc-qR9z-Gkv0-epZG-VgwO-ARgx-Neyxco

# 用于显示逻辑卷（Logical Volume）信息的命令行工具，逻辑卷是逻辑卷管理器（LVM）中的一个概念，它是从卷组中划分出的逻辑存储单元，提供给文件系统或其他应用使用
$ lvdisplay
  --- Logical volume ---
  LV Path                /dev/centos/swap
  LV Name                swap
  VG Name                centos
  LV UUID                NqgmcB-ODrF-BK5e-UkAq-JeAr-deXG-CSdbm1
  LV Write Access        read/write
  LV Creation host, time 192.168.0.106, 2020-01-10 01:26:49 +0800
  LV Status              available
  # open                 2
  LV Size                2.00 GiB
  Current LE             512
  Segments               1
  Allocation             inherit
  Read ahead sectors     auto
  - currently set to     8192
  Block device           253:1

  --- Logical volume ---
  LV Path                /dev/centos/root
  LV Name                root
  VG Name                centos
  LV UUID                xVFqgO-vE3B-do1C-a9a1-vUNW-DcFs-JKmkLq
  LV Write Access        read/write
  LV Creation host, time 192.168.0.106, 2020-01-10 01:26:50 +0800
  LV Status              available
  # open                 1
  LV Size                28.99 GiB
  Current LE             7422
  Segments               1
  Allocation             inherit
  Read ahead sectors     auto
  - currently set to     8192
  Block device           253:0

# 如果我们需要新增逻辑卷，在卷组空间还有剩余的情况下

# app 为逻辑卷名称 centos为卷组
$ lvcreate -L 10G -n app centos

# 创建成功后，用lvdisplay 和 vgdisplay可以看到创建的app逻辑卷

# 格式化分区 xxx为逻辑卷的文件类型，可以通过lsblk查看
$ mkfs.xxx /dev/centos/app


# 将逻辑卷写入分区表配置中，这样系统启动时会自动挂载
# xxx为逻辑卷的文件类型
$ echo '/dev/centos/app /app xxx defaults 0 0 ' >> /etc/fstab

# 触发分区表的挂载
$ mount -a

# 查看app目录的细节
$ df -h /app
```