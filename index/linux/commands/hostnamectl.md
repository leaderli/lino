---
tags:
  - linux/commands/hostnamectl
date updated: 2022-04-07 14:38
---

查看系统信息


```shell
$ hostnamectl
   Static hostname: localhost.localdomain
Transient hostname: CentOS7
         Icon name: computer-vm
           Chassis: vm
        Machine ID: bd4c6f6a37a8714e934e180e52b61da3
           Boot ID: 2111e414a75b4d63890c009c3e610c59
    Virtualization: kvm
  Operating System: CentOS Linux 7 (Core)
       CPE OS Name: cpe:/o:centos:centos:7
            Kernel: Linux 3.10.0-1062.el7.x86_64
      Architecture: x86-64
```

也可以通过 [[uname]] , 或者 ` cat /etc/os-release` 查看