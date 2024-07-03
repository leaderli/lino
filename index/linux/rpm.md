---
tags:
  - linux/rpm
date updated: 2022-04-07 14:41
---

### 离线安装 rpm 忽略依赖

```shell
rpm -ivu *.rpm --nodeps --force
```

然后在`~/.bash_profile` 中配置一个 `alias` 即可，或者在 `PATH` 更新 `git` 的`/usr/bin`路径，例如 `export PATH="$PATH:/usr/bin"`


### 查看是否已安装软件

```shell
~$ rpm -qa|grep dhcp
dhcp-common-4.2.5-77.el7.centos.x86_64
dhcp-libs-4.2.5-77.el7.centos.x86_64
```