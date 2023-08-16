---
tags:
  - linux/centos
date updated: 2023-08-13 19:48
---

## 安装 iso 镜像文件

虚拟机内 centos 挂载了 iso 的镜像后，使用

```shell
#可以看到挂载的iso文件
 $ blkid
/dev/sr0: UUID="2018-09-07-13-27-15-00" LABEL="Parallels Tools" TYPE="iso9660"
/dev/sda1: UUID="0ae18c31-cc28-4d90-bf6a-f65a96b2f57a" TYPE="xfs"
/dev/sda2: UUID="yaZCkD-Sek2-Xluo-rItp-Ed3V-vWuv-jOdAfy" TYPE="LVM2_member"
/dev/mapper/centos-root: UUID="3e9bbf71-0636-4505-b38f-7b88784faaab" TYPE="xfs"
/dev/mapper/centos-swap: UUID="8362ec6f-0e9a-4baa-8187-ea0d434de878" TYPE="swap"

$ mount /dev/sr0 /media/iso/
mount: /dev/sr0 is write-protected, mounting read-only
$ ls /media/iso/
install  install-gui  installer  kmods  tools  version

#可以开始安装了，安装过程中需要下载依赖，需要保持网络链接正常
$ ./media/iso/install
```

上述安装过程可能会失败，可能相关依赖无法自动安装成功，根据提示信息，将缺失的包依次安装后再次安装即可。

## 开始时的选择菜单

要关闭开机时的菜单（GRUB菜单），您需要编辑GRUB的配置文件并更改默认行为。以下是在CentOS 7上关闭开机菜单的步骤：

1. 打开终端或登录到CentOS 7系统中的命令行界面。
2. 使用任意文本编辑器（如vi或nano）以root用户身份打开GRUB的配置文件`/etc/default/grub`。例如，使用以下命令打开`/etc/default/grub`文件：

	```shell
	sudo vi /etc/default/grub
	```

3. 在打开的文件中，找到名为`GRUB_TIMEOUT`的行。该行设置了菜单显示的超时时间（以秒为单位）。将该行的值更改为0，如下所示：

	```shell
	GRUB_TIMEOUT=0
	# 这将使菜单立即隐藏，系统将自动启动默认的操作系统。
	```

4. 保存并关闭文件。在vi编辑器中，按下Esc键，然后输入`:wq`，然后按Enter键保存并退出。

5. 更新GRUB配置，使更改生效。在终端中运行以下命令：

	```shell
	# 这将重新生成GRUB的配置文件。
	sudo grub2-mkconfig -o /boot/grub2/grub.cfg
	```

6. 完成后，重新启动CentOS 7系统。现在，开机时将不再显示GRUB菜单，系统将自动启动默认的操作系统。

## 虚拟机无法链接网络

会自动获取 IP

```shell
#需要以root用户执行
$ dhclient -v
```

### 防火墙

```shell
# 启动
systemctl start firewalld

# 查看状态
systemctl status firewalld

# 停止
systemctl stop firewalld

# 禁用
systemctl disable firewalld
```

## yum

```ad-tip
yum -y 自动确认
```

### 常用命令

```shell

# 查找已安装
yum list installed

# 从源中搜索可安装
yum search
```

### yum 禁用 fastestmirror

```shell
$ sudo vi /etc/yum/pluginconf.d/fastestmirror.conf
#将`enabled=1`更改为`enabled=0`后
$ sudo yum clean all
```

### yum 安装依赖

使用 yum-builddep 提前安装某个库的依赖库

```shell
# 安装freeswitch的依赖库
yum-builddep -y freeswitch
```

### yum 清理无用依赖

```shell
package-cleanup
```

### 清理未完成的事务

安装过程失败或中断等，使用 yum-complete-transaction 清理未完成事务，需要 yum-utils 支持

```shell
yum install yum-utils
yum clean all
yum-complete-transaction --cleanup-only
```
