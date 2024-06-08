---
tags:
  - linux/commands/wget
date updated: 2022-04-14 11:16
---

用`wget`递归下载

```shell
# 不接受html文件
wget -r -np --reject=html www.download.example

# 表示只接受以此结尾的文件
wget -r -np --accept=iso,c,h


# 使用用户名和密码
wget --user=username --password=password URL
```



下载为离线网站，克隆网站

```shell
wget --page-requisites --convert-links --no-clobber --htmlify https://tool.chipdebug.com/logicsim/
```