---
tags:
  - linux/commands/uname
  - linux/commands/lsb_release
date updated: 2024-07-12 00:19
---

显示系统信息

- `-a`  显示所有系统概要信息

```shell
$ uname -a
Linux localhost.localdomain 3.10.0-1160.36.2.el7.x86_64 #1 SMP Wed Jul 21 11:57:15 UTC 2021 x86_64 x86_64 x86_64 GNU/Linux
```

大多数 Linux 发行版都具有一个位于 `/etc/os-release` 的文件，其中包含有关操作系统的信息。可以使用以下命令查看文件内容：

```shell
$ cat /etc/os-release
NAME="CentOS Linux"
VERSION="7 (Core)"
ID="centos"
ID_LIKE="rhel fedora"
VERSION_ID="7"
PRETTY_NAME="CentOS Linux 7 (Core)"
ANSI_COLOR="0;31"
CPE_NAME="cpe:/o:centos:centos:7"
HOME_URL="https://www.centos.org/"
BUG_REPORT_URL="https://bugs.centos.org/"

CENTOS_MANTISBT_PROJECT="CentOS-7"
CENTOS_MANTISBT_PROJECT_VERSION="7"
REDHAT_SUPPORT_PRODUCT="centos"
REDHAT_SUPPORT_PRODUCT_VERSION="7"
```

查看linux操作系统版本详情

```shell
lsb_release -a 
```
