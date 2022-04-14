---
tags:
  - frontend/packages/nrm
  - node-module
date updated: 2022-04-14 10:07
---

### 镜像源管理工具

```shell
$ npm install -g nrm

# *表示当前正在使用的源
$ nrm ls
* npm -------- https://registry.npmjs.org/
  yarn ------- https://registry.yarnpkg.com/
  cnpm ------- http://r.cnpmjs.org/
  taobao ----- https://registry.npm.taobao.org/
  nj --------- https://registry.nodejitsu.com/
  npmMirror -- https://skimdb.npmjs.com/registry/
  edunpm ----- http://registry.enpmjs.org/

# 新增源
$ nrm add verdaccio http://centos7:4873
# 切换源
$ nrm use verdaccio
```

测试源响应速度

```shell
$ nrm test taobao
  taobao - 407ms
# 测试所有
nrm test
  npm ---- 336ms
  yarn --- 334ms
  cnpm --- 810ms
  taobao - 545ms
  nj ----- Fetch Error
  npmMirror  794ms
  edunpm - Fetch Error
* verdaccio  41ms

```
