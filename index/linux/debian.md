---
tags:
  - linux/debian
date updated: 2023-12-23 20:36
---

## 镜像源

163

```config
deb http://mirrors.163.com/debian/ buster main non-free contrib
deb http://mirrors.163.com/debian/ buster-updates main non-free contrib
deb http://mirrors.163.com/debian/ buster-backports main non-free contrib
deb http://mirrors.163.com/debian-security/ buster/updates main non-free contrib

deb-src http://mirrors.163.com/debian/ buster main non-free contrib
deb-src http://mirrors.163.com/debian/ buster-updates main non-free contrib
deb-src http://mirrors.163.com/debian/ buster-backports main non-free contrib
deb-src http://mirrors.163.com/debian-security/ buster/updates main non-free contrib
```

[Debian 10 Buster 国内常用镜像源-腾讯云开发者社区-腾讯云](https://cloud.tencent.com/developer/article/1590080)

## 软件

```shell
$ apt-get install net-tools
```
