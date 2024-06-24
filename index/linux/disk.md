---
aliases: 磁盘
tags:
  - linux/disk
date updated: 2024-06-24 13:06
---

![[linux basic#dev|硬盘设备信息]]

## blkid

命令用于显示设备的属性信息

```shell
$ blkid
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

```shell
$ cat -n /etc/fstab
     1
     2	#
     3	# /etc/fstab
     4	# Created by anaconda on Fri Jan 10 01:26:50 2020
     5	#
     6	# Accessible filesystems, by reference, are maintained under '/dev/disk'
     7	# See man pages fstab(5), findfs(8), mount(8) and/or blkid(8) for more info
     8	#
     9	/dev/mapper/centos-root /                       xfs     defaults        0 0
    10	UUID=0ae18c31-cc28-4d90-bf6a-f65a96b2f57a /boot                   xfs     defaults        0 0
    11	/dev/mapper/centos-swap swap                    swap    defaults        0 0
```

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

给某个目录挂载一个分区的详细步骤

我们可以看到 `/dev/sdb`为新增的1G的硬盘

```shell
$ fdisk  -l

Disk /dev/sda: 34.4 GB, 34359738368 bytes, 67108864 sectors
Units = sectors of 1 * 512 = 512 bytes
Sector size (logical/physical): 512 bytes / 4096 bytes
I/O size (minimum/optimal): 4096 bytes / 4096 bytes
Disk label type: dos
Disk identifier: 0x000a93c2

   Device Boot      Start         End      Blocks   Id  System
/dev/sda1   *        2048     2099199     1048576   83  Linux
/dev/sda2         2099200    67108863    32504832   8e  Linux LVM

Disk /dev/sdb: 1073 MB, 1073741824 bytes, 2097152 sectors
Units = sectors of 1 * 512 = 512 bytes
Sector size (logical/physical): 512 bytes / 4096 bytes
I/O size (minimum/optimal): 4096 bytes / 4096 bytes


Disk /dev/mapper/centos-root: 31.1 GB, 31130124288 bytes, 60801024 sectors
Units = sectors of 1 * 512 = 512 bytes
Sector size (logical/physical): 512 bytes / 4096 bytes
I/O size (minimum/optimal): 4096 bytes / 4096 bytes


Disk /dev/mapper/centos-swap: 2147 MB, 2147483648 bytes, 4194304 sectors
Units = sectors of 1 * 512 = 512 bytes
Sector size (logical/physical): 512 bytes / 4096 bytes
I/O size (minimum/optimal): 4096 bytes / 4096 bytes
```

准备操作这块磁盘

```shell
$ fdisk  /dev/sdb
Welcome to fdisk (util-linux 2.23.2).

Changes will remain in memory only, until you decide to write them.
Be careful before using the write command.

Device does not contain a recognized partition table
Building a new DOS disklabel with disk identifier 0x664619d4.

The device presents a logical sector size that is smaller than
the physical sector size. Aligning to a physical sector (or optimal
I/O) size boundary is recommended, or performance may be impacted.

Command (m for help):
```

输入参数p 来查看硬盘设备内已有的分区信息，其中包括了硬盘的容量大小、扇区个数等信息:

```shell
Command (m for help): p

Disk /dev/sdb: 1073 MB, 1073741824 bytes, 2097152 sectors
Units = sectors of 1 * 512 = 512 bytes
Sector size (logical/physical): 512 bytes / 4096 bytes
I/O size (minimum/optimal): 4096 bytes / 4096 bytes
Disk label type: dos
Disk identifier: 0x664619d4

   Device Boot      Start         End      Blocks   Id  System
```

输入参数 n 尝试添加新的分区。系统会要求用户是选择继续输入参数 p 来创建主分区， 还是输入参数 e 来创建扩展分区。这里输入参数 p 来创建一个主分区:

```shell
Command (m for help): n
Partition type:
   p   primary (0 primary, 0 extended, 4 free)
   e   extended
Select (default p): p
```

在确认创建一个主分区后，系统要求用户先输入主分区的编号。在前文得知，主分区 的编号范围是 1~4，因此这里输入默认的 1 就可以了。接下来系统会提示定义起始的扇 区位置，这不需要改动，敲击回车键保留默认设置即可，系统会自动计算出最靠前的空闲 扇区的位置。最后，系统会要求定义分区的结束扇区位置，这其实就是要去定义整个分区 的大小是多少。我们不用去计算扇区的个数，只需要输入+500M 即可创建出一个容量为 500M 的硬盘分区。

```shell
Partition number (1-4, default 1): 1
First sector (2048-2097151, default 2048):
Using default value 2048
Last sector, +sectors or +size{K,M,G} (2048-2097151, default 2097151): +500M
Partition 1 of type Linux and of size 500 MiB is set
```

再次使用参数 p 来查看硬盘设备中的分区信息。果然就能看到一个名称为/dev/sdb1、起 始扇区位置为 2048、结束扇区位置为 1026047的主分区了。这时千万不要直接关闭窗口，而 应该敲击参数 w 后按回车键，这样分区信息才是真正地写入成功啦。

```shell
Command (m for help): p

Disk /dev/sdb: 1073 MB, 1073741824 bytes, 2097152 sectors
Units = sectors of 1 * 512 = 512 bytes
Sector size (logical/physical): 512 bytes / 4096 bytes
I/O size (minimum/optimal): 4096 bytes / 4096 bytes
Disk label type: dos
Disk identifier: 0x664619d4

   Device Boot      Start         End      Blocks   Id  System
/dev/sdb1            2048     1026047      512000   83  Linux

Command (m for help): w
The partition table has been altered!

Calling ioctl() to re-read partition table.
Syncing disks.
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

此时该磁盘还未格式化，我们可以通过[[#mkfs]] 命令来对分区进行格式化

新建目录，并挂载

```shell
$ mkdir /newFS
$ mount /dev/sdb1 newFS/
$ df -h
Filesystem               Size  Used Avail Use% Mounted on
devtmpfs                 906M     0  906M   0% /dev
tmpfs                    917M  4.0K  917M   1% /dev/shm
tmpfs                    917M  8.9M  908M   1% /run
tmpfs                    917M     0  917M   0% /sys/fs/cgroup
/dev/mapper/centos-root   29G   16G   14G  54% /
/dev/sda1               1014M  151M  864M  15% /boot
Home                     234G  183G   52G  79% /media/psf/Home
tmpfs                    184M     0  184M   0% /run/user/1002
/dev/sdb1                494M   26M  469M   6% /newFS
```

此时使用 [[#blkid]] 也可以看到新挂载的设备

```shell
$ blkid
/dev/sda1: UUID="0ae18c31-cc28-4d90-bf6a-f65a96b2f57a" TYPE="xfs"
/dev/sda2: UUID="yaZCkD-Sek2-Xluo-rItp-Ed3V-vWuv-jOdAfy" TYPE="LVM2_member"
/dev/mapper/centos-root: UUID="3e9bbf71-0636-4505-b38f-7b88784faaab" TYPE="xfs"
/dev/mapper/centos-swap: UUID="8362ec6f-0e9a-4baa-8187-ea0d434de878" TYPE="swap"
/dev/sdb1: UUID="e20a43ff-020a-41d0-87a3-e133bbfb64b4" TYPE="xfs"
```

## mkfs

分区格式化命令，根据分区类型有很多扩展命令

```shell
$ mkfs
mkfs         mkfs.cramfs  mkfs.ext3    mkfs.fat     mkfs.msdos   mkfs.xfs
mkfs.btrfs   mkfs.ext2    mkfs.ext4    mkfs.minix   mkfs.vfat
```

如果你想格式化为 `xfs` 则如下使用

```shell
$ mkfs.xfs  /dev/sdb1
meta-data=/dev/sdb1              isize=512    agcount=4, agsize=32000 blks
         =                       sectsz=4096  attr=2, projid32bit=1
         =                       crc=1        finobt=0, sparse=0
data     =                       bsize=4096   blocks=128000, imaxpct=25
         =                       sunit=0      swidth=0 blks
naming   =version 2              bsize=4096   ascii-ci=0 ftype=1
log      =internal log           bsize=4096   blocks=1605, version=2
         =                       sectsz=4096  sunit=1 blks, lazy-count=1
realtime =none                   extsz=4096   blocks=0, rtextents=0
```

扩展

```shell
$ 设置为100G   1024*1024*4
xfs_growfs  /dev/sdXY -D 26214400
```

## LVM

### 概述

逻辑卷管理器，LVM 技术是在硬盘分区和文件系统之间添加了一个逻辑层，它提供了一个抽象的卷组，可以把多块硬盘进行卷组合并。 这样一来，用户不必关心物理硬盘设备的底层架构和布局，就可以实现对硬盘分区的动态调 整。

在日常的使用中，如果卷组(VG)的剩余容量不足，可以随时将新的物理卷(PV)加 入到里面，进行不断地扩容

![[Pasted image 20240621125024.png|800]]

### 新增逻辑卷

让新添加两块新的硬盘支持LVM技术

```shell
$ pvcreate  /dev/sdb /dev/sdc
Physical volume "/dev/sdb" successfully created. 
Physical volume "/dev/sdc" successfully created.
```

```shell
$ vgcreate  storage /dev/sdb /dev/sdc
 Volume group "storage" successfully created

$ vgdisplay
  --- Volume group ---
  VG Name               storage
  System ID
  Format                lvm2
  Metadata Areas        2
  Metadata Sequence No  1
  VG Access             read/write
  VG Status             resizable
  MAX LV                0
  Cur LV                0
  Open LV               0
  Max PV                0
  Cur PV                2
  Act PV                2
  VG Size               1.99 GiB
  PE Size               4.00 MiB
  Total PE              510
  Alloc PE / Size       0 / 0
  Free  PE / Size       510 / 1.99 GiB
  VG UUID               yhG160-pYkf-j4o1-OoOf-uSrb-DvnZ-iRM9TN
# 省略部分信息
```

在对逻辑卷进行切割时有两种计量单位。第一种是以容 量为单位，所使用的参数为-L。例如，使用-L 150M 生成一个大小为 150MB 的逻辑卷。另外 一种是以基本单元的个数为单位，所使用的参数为-l。每个基本单元的大小默认为 4MB。例 如，使用-l 37 可以生成一个大小为 37×4MB=148MB 的逻辑卷。

```shell
$ lvcreate  -n vo -l 37 storage
  Logical volume "vo" created.
```

```shell
$ lvdisplay

# 省略部分信息
  --- Logical volume ---
  LV Path                /dev/storage/vo
  LV Name                vo
  VG Name                storage
  LV UUID                HBQ9zU-4DST-CEab-GfR1-FekX-6jNE-IuVbNs
  LV Write Access        read/write
  LV Creation host, time CentOS7_Temp, 2024-02-04 18:15:50 +0800
  LV Status              available
  # open                 0
  LV Size                148.00 MiB
  Current LE             37
  Segments               1
  Allocation             inherit
  Read ahead sectors     auto
  - currently set to     8192
  Block device           253:2
```

使用[[#mkfs]]格式化 ，xfs文件系统与LVM兼容性不好。且xfs本身可以使用`xfs_growfs`扩容

```shell
$ mkfs.ext4  /dev/storage/vo
mke2fs 1.42.9 (28-Dec-2013)
Discarding device blocks: done
Filesystem label=
OS type: Linux
Block size=1024 (log=0)
Fragment size=1024 (log=0)
Stride=4 blocks, Stripe width=4 blocks
38000 inodes, 151552 blocks
7577 blocks (5.00%) reserved for the super user
First data block=1
Maximum filesystem blocks=33816576
19 block groups
8192 blocks per group, 8192 fragments per group
2000 inodes per group
Superblock backups stored on blocks:
	8193, 24577, 40961, 57345, 73729

Allocating group tables: done
Writing inode tables: done
Creating journal (4096 blocks): done
Writing superblocks and filesystem accounting information: done
$ mkdir /vo
$ mount /dev/storage/vo  /vo
$ df -h
Filesystem               Size  Used Avail Use% Mounted on
devtmpfs                 906M     0  906M   0% /dev
tmpfs                    917M  4.0K  917M   1% /dev/shm
tmpfs                    917M  8.9M  908M   1% /run
tmpfs                    917M     0  917M   0% /sys/fs/cgroup
/dev/mapper/centos-root   29G   15G   15G  49% /
/dev/sda1               1014M  151M  864M  15% /boot
Home                     234G  177G   58G  76% /media/psf/Home
tmpfs                    184M     0  184M   0% /run/user/0
tmpfs                    184M     0  184M   0% /run/user/1002
/dev/mapper/storage-vo   140M  1.6M  128M   2% /vo
```

写入配置文件，使其永久生效

```shell
$ echo "/dev/storage/vo /vo ext4 defaults 0 0" >> /etc/fstab
$ cat /etc/fstab

#
# /etc/fstab
# Created by anaconda on Fri Jan 10 01:26:50 2020
#
# Accessible filesystems, by reference, are maintained under '/dev/disk'
# See man pages fstab(5), findfs(8), mount(8) and/or blkid(8) for more info
#
/dev/mapper/centos-root /                       xfs     defaults        0 0
UUID=0ae18c31-cc28-4d90-bf6a-f65a96b2f57a /boot                   xfs     defaults        0 0
/dev/mapper/centos-swap swap                    swap    defaults        0 0
/dev/storage/vo /vo ext4 defaults 0 0

```

### 扩容逻辑卷

一定要先卸载设备和挂载点的关联，然后使用lvextend进行扩展

```shell
$ umount  /vo
$ lvextend  -L 290M /dev/storage/vo
  Rounding size to boundary between physical extents: 292.00 MiB.
  Size of logical volume storage/vo changed from 148.00 MiB (37 extents) to 292.00 MiB (73 extents).
  Logical volume storage/vo successfully resized.
```

检查硬盘的完整性，确认目录结构、内容和文件内容没有丢失。一般情况下没 有报错，均为正常情况。

```shell
$ e2fsck  -f /dev/storage/vo
e2fsck 1.42.9 (28-Dec-2013)
Pass 1: Checking inodes, blocks, and sizes
Pass 2: Checking directory structure
Pass 3: Checking directory connectivity
Pass 4: Checking reference counts
Pass 5: Checking group summary information
/dev/storage/vo: 11/38000 files (0.0% non-contiguous), 10453/151552 blocks
```

重置设备在系统中的容量。刚刚是对 LV(逻辑卷)设备进行了扩容操作，但系 统内核还没有同步到这部分新修改的信息，需要手动进行同步。

```shell
$ resize2fs  /dev/storage/vo
resize2fs 1.42.9 (28-Dec-2013)
Resizing the filesystem on /dev/storage/vo to 299008 (1k) blocks.
The filesystem on /dev/storage/vo is now 299008 blocks long.
```

重新挂载硬盘设备并查看挂载状态。

```shell
# 触发分区表的挂载 /etc/fstb
$ mount -a 
$ df -h
Filesystem               Size  Used Avail Use% Mounted on
devtmpfs                 906M     0  906M   0% /dev
tmpfs                    917M  4.0K  917M   1% /dev/shm
tmpfs                    917M  8.9M  908M   1% /run
tmpfs                    917M     0  917M   0% /sys/fs/cgroup
/dev/mapper/centos-root   29G   15G   15G  49% /
/dev/sda1               1014M  151M  864M  15% /boot
Home                     234G  177G   58G  76% /media/psf/Home
tmpfs                    184M     0  184M   0% /run/user/0
tmpfs                    184M     0  184M   0% /run/user/1002
/dev/mapper/storage-vo   279M  2.1M  259M   1% /vo
```

### 缩减逻辑卷


先卸载，然后检查硬盘完整

```shell
$ umount /vo
$ e2fsck -f /dev/storage/vo
e2fsck 1.42.9 (28-Dec-2013)
Pass 1: Checking inodes, blocks, and sizes
Pass 2: Checking directory structure
Pass 3: Checking directory connectivity
Pass 4: Checking reference counts
Pass 5: Checking group summary information
/dev/storage/vo: 12/74000 files (0.0% non-contiguous), 15509/299008 blocks
```

先通知系统内核将逻辑卷 vo 的容量减小到 120MB，然后将 LV(逻辑卷)的容量修改为 120MB。


```shell
$ resize2fs  /dev/storage/vo 120M
resize2fs 1.42.9 (28-Dec-2013)
Resizing the filesystem on /dev/storage/vo to 122880 (1k) blocks.
The filesystem on /dev/storage/vo is now 122880 blocks long.

$ lvreduce -L 120M /dev/storage/vo
  WARNING: Reducing active logical volume to 120.00 MiB.
  THIS MAY DESTROY YOUR DATA (filesystem etc.)
Do you really want to reduce storage/vo? [y/n]: y
  Size of logical volume storage/vo changed from 292.00 MiB (73 extents) to 120.00 MiB (30 extents).
  Logical volume storage/vo successfully resized.
```

重新挂载并查看状态

```shell
$ mount -a
$ df -h
Filesystem               Size  Used Avail Use% Mounted on
devtmpfs                 906M     0  906M   0% /dev
tmpfs                    917M  4.0K  917M   1% /dev/shm
tmpfs                    917M  8.9M  908M   1% /run
tmpfs                    917M     0  917M   0% /sys/fs/cgroup
/dev/mapper/centos-root   29G   15G   15G  49% /
/dev/sda1               1014M  151M  864M  15% /boot
Home                     234G  177G   58G  76% /media/psf/Home
tmpfs                    184M     0  184M   0% /run/user/0
tmpfs                    184M     0  184M   0% /run/user/1002
/dev/mapper/storage-vo   113M  1.6M  103M   2% /vo
```


### 逻辑卷快照

略

### 删除逻辑卷

```shell
$ umount /vo
# 删除分区表中vo挂载的行
$ vi /etc/fstab
$ lvremove  /dev/storage/vo
Do you really want to remove active logical volume storage/vo? [y/n]: y
  Logical volume "vo" successfully removed

$ vgremove storage
  Volume group "storage" successfully removed
$ pvremove  /dev/sdb /dev/sdc
  Labels on physical volume "/dev/sdb" successfully wiped.
  Labels on physical volume "/dev/sdc" successfully wiped.
```
 
## umout

> target is bussy

`fuser -km /app`
`lsof|grep -w /app` 查看所有进程，然后 ` kill -9  `

## RAID

独立冗余磁盘阵列。把多个硬盘设备组合成一个容量更大、安全性更好的磁盘阵列，并把数据切割成多 个区段后分别存放在各个不同的物理硬盘设备上，然后利用分散读写技术来提升磁盘阵列整 体的性能，同时把多个重要数据的副本同步到不同的物理硬盘设备上，从而起到了非常好的 数据冗余备份效果。

![[Pasted image 20240621124209.png]]

## 参考文档

Linux 就该这么学（第2版 RHEL 8） (刘遄)
