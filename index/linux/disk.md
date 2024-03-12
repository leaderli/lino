---
aliases: 磁盘
tags:
  - linux/disk
date updated: 2024-02-15 04:43
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

## 一个扩展的示例

实际有40G

```shell
[root@localhost ~]# fdisk -l

Disk /dev/sda: 42.9 GB, 42949672960 bytes
255 heads, 63 sectors/track, 5221 cylinders
Units = cylinders of 16065 * 512 = 8225280 bytes

   Device Boot      Start         End      Blocks   Id  System
/dev/sda1   *           1          13      104391   83  Linux
/dev/sda2              14        2610    20860402+  8e  Linux LVM
```

但只用了20G

```shell
[root@localhost ~]# df -h
Filesystem            Size  Used Avail Use% Mounted on
/dev/mapper/VolGroup00-LogVol00
                       18G   12G  5.4G  68% /
/dev/sda1              99M   13M   81M  14% /boot
tmpfs                1004M     0 1004M   0% /dev/shm
```

扩展分区, n 新增分区 w 保存 然后重启

```shell
[root@localhost ~]# fdisk  /dev/sda
Command action
   a   toggle a bootable flag
   b   edit bsd disklabel
   c   toggle the dos compatibility flag
   d   delete a partition
   l   list known partition types
   m   print this menu
   n   add a new partition
   o   create a new empty DOS partition table
   p   print the partition table
   q   quit without saving changes
   s   create a new empty Sun disklabel
   t   change a partition's system id
   u   change display/entry units
   v   verify the partition table
   w   write table to disk and exit
   x   extra functionality (experts only)

```

将新的分区添加到逻辑卷管理（LVM）组中

```shell
[root@localhost ~]#  pvcreate /dev/sda3
```

扩展现有的卷组（VG）

```shell
[root@localhost ~]# vgdisplay 
  --- Volume group ---
  VG Name               VolGroup00
  System ID             
  Format                lvm2
  Metadata Areas        2
  Metadata Sequence No  5
  VG Access             read/write
  VG Status             resizable
  MAX LV                0
  Cur LV                2
  Open LV               1
  Max PV                0
  Cur PV                2
  Act PV                2
  VG Size               49.88 GB
  PE Size               32.00 MB
  Total PE              1596
  Alloc PE / Size       956 / 29.88 GB
  Free  PE / Size       640 / 20.00 GB
  VG UUID               FLij4Y-dv68-oddG-6Oa3-goD6-ipyc-pmuraj 
[root@localhost ~]# vgextend VolGroup00 /dev/sda3
```

使用所有可用的空闲空间来扩展逻辑卷


```shell
[root@localhost ~]# lvextend  -l +100%FREE /dev/mapper/VolGroup00-LogVol00
  Extending logical volume LogVol00 to 47.91 GB
  Logical volume LogVol00 successfully resized

[root@localhost ~]# resize2fs  /dev/mapper/VolGroup00-LogVol00
resize2fs 1.39 (29-May-2006)
Filesystem at /dev/mapper/VolGroup00-LogVol00 is mounted on /; on-line resizing required
Performing an on-line resize of /dev/mapper/VolGroup00-LogVol00 to 12558336 (4k) blocks.
The filesystem on /dev/mapper/VolGroup00-LogVol00 is now 12558336 blocks long.
```



## XFS文件系统

```shell
# 设置为100G   1024*1024*4
xfs_growfs  /dev/sdXY -D 26214400
```