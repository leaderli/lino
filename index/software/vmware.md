---
tags:
  - 软件/vmware
date updated: 2023-12-23 20:32
---

centos7共享目录

```shell
yum install open-vm-tools

sudo /usr/bin/vmhgfs-fuse .host:/ /mnt/hgfs -o subtype=vmhgfs-fuse,allow_other

```

设置IP的参考资料

[VMware虚拟机安装Centos7后设置静态ip - 今天不打怪 - 博客园](https://www.cnblogs.com/hsz-csy/p/9811969.html)
![[Pasted image 20211219230652.png]]
![[Pasted image 20211219230442.png]]
![[Pasted image 20211219230854.png]]

![[Pasted image 20211219230318.png]]
`/etc/sysconfig/network-scripts/ifcfg-ens33`

```diff
TYPE="Ethernet"
PROXY_METHOD="none"
BROWSER_ONLY="no"
- BOOTPROTO="dhcp"
+ BOOTPROTO="static"
DEFROUTE="yes"
IPV4_FAILURE_FATAL="no"
IPV6INIT="yes"
IPV6_AUTOCONF="yes"
IPV6_DEFROUTE="yes"
IPV6_FAILURE_FATAL="no"
IPV6_ADDR_GEN_MODE="stable-privacy"
NAME="ens33"
UUID="87140c19-5b18-4db4-a259-1ea4bfdda736"
DEVICE="ens33"
ONBOOT="yes"
+ IPADDR="192.168.159.31"
+ NETMASK="192.168.159.0"
+ GATEWAY="192.168.159.2"
+ DNS1="127.0.0.1"
+ DNS2="8.8.8.8"
+ DNS3="8.8.4.4"
```

修改后重启

```shell
systemctl restart network
```

## 安装vmware-tool

确保虚拟机包含 `CD/DVD驱动器`，则虚拟机右键菜单中可以点击安装 `vmware-tool

使用root执行

```shell

mkdir /mnt/cdrom

# 挂在CDROM
$ sudo mount /dev/cdrom /mnt/cdrom
mount: /mnt/cdrom: WARNING: source write-protected, mounted read-only.

$ sudo ls /mnt/cdrom 

VMwareTools-5.0.0-12124.tar.gz


$ cp /mnt/cdrom/VMwareTools-version.tar.gz /tmp/

$ cd /tmp
$ tar -zxvf VMwareTools-version.tar.gz

$ cd vmware-tools-distrib

# 安装
$ ./vmware-install.pl


# 卸载CD-ROM
$ umount /mnt/cdrom

# 删除安装包

$ rm /tmp/VMwareTools-version.tar.gz
$ rm -rf /tmp/vmware-tools-distrib
```

### 设置共享目录

虚拟机|设置|选项|共享文件夹

linux中设置

```shell
# 目录没有，则创建
$ ls /mnt/hgfs/

#
$ vmhgfs-fuse .host:/  /mnt/hgfs/
```


## 开机自启动虚拟机


gpedit.msc打开组策略编辑器

用户配置—》Windows设置—》脚本(登录|注销) 右边，名称下选择 “登录”
![[Pasted image 20231225195823.png]]

```shell
"D:\ProgramFiles\VMware\vmrun.exe"  -T ws start  "D:\ProgramData\Virtual Machines\CentOS7\CentOS 7.vmx" nogui
```