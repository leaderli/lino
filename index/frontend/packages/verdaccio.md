---
tags:
  - frontend/packages/verdaccio
  - node-module
date updated: 2022-04-14 10:08
---

搭建私人仓库

1. 安装 verdaccio，使用 npm 全局安装即可。

   ```shell
   npm install –global verdaccio
   ```

2. 安装完成后，直接输入 verdaccio 命令即可运行

   ```shell
       $ verdaccio
       warn --- config file  - /home/li/.config/verdaccio/config.yaml
       warn --- Verdaccio started
       warn --- Plugin successfully loaded: verdaccio-htpasswd
       warn --- Plugin successfully loaded: verdaccio-audit
       warn --- http address - http://localhost:4873/ - verdaccio/4.7.2
   ```

   `config.yaml`是 verdaccio 的默认配置文件，为了能让外部访问，我们在其中添加

   ```yml
   listen: 0.0.0.0:4873
   ```

   我们使用 pm2 后台启动

   ```shell
   pm2 start verdaccio
   ```

3. 在自定义模块中，发布应用

   ```shell
    # 链接私有仓库
    nrm add verdaccio http://centos7:4873
    # 切换源
    nrm use verdaccio
    # 注册用户
    npm adduser
    # 发布
    npm publish
    # 下载我们发布的应用
    npm install test

   ```

   发布不成功，尝试使用最简格式`package.json`

   例如
   ![node模块_私有仓库.png](node模块_私有仓库.png)

4. verdaccio 存储 nodejs 包的地址
   `~/.local/share/verdaccio/storage`
