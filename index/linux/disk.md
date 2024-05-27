---
aliases: 磁盘
tags:
  - linux/disk
date updated: 2024-02-15 04:43
---
`blkid` 命令用于显示设备的属性信息

```shell
[root@CentOS7 ~]# blkid
/dev/sda1: UUID="0ae18c31-cc28-4d90-bf6a-f65a96b2f57a" TYPE="xfs"
/dev/sda2: UUID="yaZCkD-Sek2-Xluo-rItp-Ed3V-vWuv-jOdAfy" TYPE="LVM2_member"
/dev/mapper/centos-root: UUID="3e9bbf71-0636-4505-b38f-7b88784faaab" TYPE="xfs"
/dev/mapper/centos-swap: UUID="8362ec6f-0e9a-4baa-8187-ea0d434de878" TYPE="swap"
```

UUID 是一串用于标识每块独立硬盘的字符串，具有唯一性及稳定性，特 别适合用来挂载网络设备


```shell
mount UUID=yaZCkD-Sek2-Xluo-rItp-Ed3V-vWuv-jOdAfy /backup
```

手动挂载的文件系统，重启系统后失效，如果要开机后自动挂在，则需要写入到 `/etc/fstab` 中


## fdisk

fdisk 命令用于新建、修改及删除磁盘的分区表信息

- `-m`: 显示帮助信息以了解更多参数和用法
- `-n`: 添加新的分区
- `-d`: 删除某个分区信息
- `-l`: 列出所有可用的分区类型
- `-t`: 改变某个分区的类型
- `-p`: 查看分区表信息
- `-w`: 保存并退出
- `-q`: 不保存直接退出


### 一个示例 

#TODO 重新尝试

首先使用 fdisk 命令来尝试管理/dev/sda 硬盘设备。在看到提示信息后输入参数 p 来查看硬盘设备内已有的分区信息，其中包括了硬盘的容量大小、扇区个数等信息:
```shell
[root@CentOS7 ~]# fdisk  /dev/sda

The device presents a logical sector size that is smaller than
the physical sector size. Aligning to a physical sector (or optimal
I/O) size boundary is recommended, or performance may be impacted.
Welcome to fdisk (util-linux 2.23.2).

Changes will remain in memory only, until you decide to write them.
Be careful before using the write command.


Command (m for help): p

Disk /dev/sda: 34.4 GB, 34359738368 bytes, 67108864 sectors
Units = sectors of 1 * 512 = 512 bytes
Sector size (logical/physical): 512 bytes / 4096 bytes
I/O size (minimum/optimal): 4096 bytes / 4096 bytes
Disk label type: dos
Disk identifier: 0x000a93c2

   Device Boot      Start         End      Blocks   Id  System
/dev/sda1   *        2048     2099199     1048576   83  Linux
/dev/sda2         2099200    67108863    32504832   8e  Linux LVM
```

输入参数 n 尝试添加新的分区。系统会要求用户是选择继续输入参数 p 来创建主分区， 还是输入参数 e 来创建扩展分区。这里输入参数 p 来创建一个主分区:

```shell
Command (m for help): n
Partition type:
   p   primary (2 primary, 0 extended, 2 free)
   e   extended
Select (default p):
```

在确认创建一个主分区后，系统要求用户先输入主分区的编号。在前文得知，主分区 的编号范围是 1~4，因此这里输入默认的 1 就可以了。接下来系统会提示定义起始的扇 区位置，这不需要改动，敲击回车键保留默认设置即可，系统会自动计算出最靠前的空闲 扇区的位置。最后，系统会要求定义分区的结束扇区位置，这其实就是要去定义整个分区 的大小是多少。我们不用去计算扇区的个数，只需要输入+2G 即可创建出一个容量为 2GB 的硬盘分区。

```shell
Partition number (1-4, default 1): 1  
First sector (2048-41943039, default 2048):  
Last sector, +sectors or +size{K,M,G,T,P} (2048-41943039, default 41943039): +2G

Created a new partition 1 of type 'Linux' and of size 2 GiB.
```

再次使用参数 p 来查看硬盘设备中的分区信息。果然就能看到一个名称为/dev/sdb1、起 始扇区位置为 2048、结束扇区位置为 4196351 的主分区了。这时千万不要直接关闭窗口，而 应该敲击参数 w 后按回车键，这样分区信息才是真正地写入成功啦。


```shell
Command (m for help): p  
Disk /dev/sdb: 20 GiB, 21474836480 bytes, 41943040 sectors Units: sectors of 1 * 512 = 512 bytes  
Sector size (logical/physical): 512 bytes / 512 bytes  
I/O size (minimum/optimal): 512 bytes / 512 bytes Disklabel type: dos  
Disk identifier: 0x88b2c2b0

    Device     Boot Start     End Sectors Size Id Type
    /dev/sdb1        2048 4196351 4194304   2G 83 Linux

Command (m for help): w  
The partition table has been altered. Calling ioctl() to re-read partition table. Syncing disks.
```

分区信息中第 6 个字段的 Id 值是一个编码，用于标识该分区的作用，可帮助用户快速了 解该分区的作用，一般没必要修改。使用 l 参数查看一下磁盘编码都有哪些

```shell
Command (m for help): l

 0  Empty           24  NEC DOS         81  Minix / old Lin bf  Solaris
 1  FAT12           27  Hidden NTFS Win 82  Linux swap / So c1  DRDOS/sec (FAT-
 2  XENIX root      39  Plan 9          83  Linux           c4  DRDOS/sec (FAT-
 3  XENIX usr       3c  PartitionMagic  84  OS/2 hidden C:  c6  DRDOS/sec (FAT-
 4  FAT16 <32M      40  Venix 80286     85  Linux extended  c7  Syrinx
 5  Extended        41  PPC PReP Boot   86  NTFS volume set da  Non-FS data
 6  FAT16           42  SFS             87  NTFS volume set db  CP/M / CTOS / .
 7  HPFS/NTFS/exFAT 4d  QNX4.x          88  Linux plaintext de  Dell Utility
 8  AIX             4e  QNX4.x 2nd part 8e  Linux LVM       df  BootIt
 9  AIX bootable    4f  QNX4.x 3rd part 93  Amoeba          e1  DOS access
 a  OS/2 Boot Manag 50  OnTrack DM      94  Amoeba BBT      e3  DOS R/O
 b  W95 FAT32       51  OnTrack DM6 Aux 9f  BSD/OS          e4  SpeedStor
 c  W95 FAT32 (LBA) 52  CP/M            a0  IBM Thinkpad hi eb  BeOS fs
 e  W95 FAT16 (LBA) 53  OnTrack DM6 Aux a5  FreeBSD         ee  GPT
 f  W95 Ext'd (LBA) 54  OnTrackDM6      a6  OpenBSD         ef  EFI (FAT-12/16/
10  OPUS            55  EZ-Drive        a7  NeXTSTEP        f0  Linux/PA-RISC b
11  Hidden FAT12    56  Golden Bow      a8  Darwin UFS      f1  SpeedStor
12  Compaq diagnost 5c  Priam Edisk     a9  NetBSD          f4  SpeedStor
14  Hidden FAT16 <3 61  SpeedStor       ab  Darwin boot     f2  DOS secondary
16  Hidden FAT16    63  GNU HURD or Sys af  HFS / HFS+      fb  VMware VMFS
17  Hidden HPFS/NTF 64  Novell Netware  b7  BSDI fs         fc  VMware VMKCORE
18  AST SmartSleep  65  Novell Netware  b8  BSDI swap       fd  Linux raid auto
1b  Hidden W95 FAT3 70  DiskSecure Mult bb  Boot Wizard hid fe  LANstep
1c  Hidden W95 FAT3 75  PC/IX           be  Solaris boot    ff  BBT
1e  Hidden W95 FAT1 80  Old Minix
```

在上述步骤执行完毕之后，Linux 系统会自动把这个硬盘主分区抽象成/dev/sdb1 设备文 件。可以使用 file 命令查看该文件的属性，但我在讲课和工作中发现，有些时候系统并没有 自动把分区信息同步给 Linux 内核，而且这种情况似乎还比较常见(但不能算作严重的 bug)。 可以输入 partprobe 命令手动将分区信息同步到内核，而且一般推荐连续两次执行该命令，效果会更好。如果使用这个命令都无法解决问题，那么就重启计算机吧，这个“杀手锏”百试 百灵，一定会有用的。


## 挂载分区步骤

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

## 一个扩展硬盘的示例



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

## umout 

> target is bussy

`fuser -km /app`
`lsof|grep -w /app` 查看所有进程，然后 `kill -9 `