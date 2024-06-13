---
tags:
  - linux/commands/svn
date updated: 2022-04-07 14:36
---

通过 `svn info` 判断服务器和本地的版本号是否相同，可使用 `grep` 和 `awk` 组合



## subversion edge 权限设置


```toml
[/]
* = r   // 所有用户，所有都有读权限
[myrepository:/]
* = rw // 所有用户，都拥有仓库 myrepository 的读写权限

[myrepository:/aaa]
user1 = rw // user1，拥有仓库 myrepository 的目录aaa的读写权限
```


## 参考文档

[SVN dump/load迁移](http://xstarcd.github.io/wiki/sysadmin/svn_dump_move.html)