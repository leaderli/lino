---
aliases: ssh
tags:
  - linux/commands/ssh
date updated: 2024-07-12 22:26
---

## 概述

ssh 是一种协议，有关如何在网络上构建安全通信的规范。协议内容涉及认证、加密、传输数据的完整性。

## ssh免密

操作机上生成秘钥`ssh-keygen -t rsa`,将会生成一对秘钥，将公钥内容追加到服务器的`~/.ssh/authorized_keys`中，

- 可通过 [[#执行远程命令]]
- 可以简单的使用
	```shell
	ssh-copy-id user@example.com
	```

采用的是默认的`22`端口，拷贝的公钥是默认的`id_rsa.pub`

确保服务器的文件及目录权限

1. 设置 authorized_keys 权限\
   `chmod 600 authorized_keys`
2. 设置.ssh 目录权限\
   `chmod 700 -R .ssh`
3. 设置用户目录权限\
   `chmod go-w ~`
4. 检查 AuthorizedKeysFile 配置是否启用 authorized_keys

   ```shell
   $ cat /etc/ssh/sshd_config |egrep AuthorizedKeysFile
   #AuthorizedKeysFile    .ssh/authorized_keys
   ```

   把下面几个选项打开

   ```conf
   AuthorizedKeysFile  .ssh/authorized_keys
   ```

后续再执行`ssh`操作，或者`scp`等操作，则不需要再输入密码

通过系统日志文件我们可以查看无法登陆远程服务器的原因

```shell
tail /var/log/secure -n 20
#也可以在使用ssh时将详情打印出来
ssh -vvv root@192.168.0.1
```

默认情况下，ssh 去`~/.ssh/`目录下去找私钥，有时候无法，可以使用`ssh-agent`将私钥加载到内存中

```shell
# 启动ssh代理
$ eval `ssh-agent`
# 将私钥注册到agent
$ ssh-add  ~/.ssh/id_rsa
```

## 执行远程命令

```shell
cat ~/.ssh/id_rsa.pub |ssh user@example.com 'cat >> ~/.ssh/authorized_keys'
```

```shell
ssh -q  user@ip  'cd dir && ls < /dev/null'
```

## 向远程服务器文件写入

使用管道符基本用法如

```shell
<command> | ssh user@remote-server "cat > output.txt"
```

例如

```shell
echo "qwerty" | ssh user@Server-2 "cat > output.txt"
ssh user@Server-1 "<command>" | ssh user@Server-2 "cat > output.txt"
```

## 服务器安装sshd

以debian作为示例

```shell
$ apt-get install openssh-server

# 查看状态
$ systemctl status ssh
```

## 登录验证

ssh使用几种不同的方式验证用户的登录

1. 如果在 `~/.rhosts` `~/.shosts` `/etc/hosts.equiv` `/etc/shosts.equiv` 中列出了用户从远程登录的主机名，那么用户无需检查口令就可以登录
2. 使用公钥加密来验证远程主机的身份，远程主机的公钥必须在本地主机的`ect/ssh_known_hosts`或`~/.ssh/known_hosts`文件中列出
3. 使用公钥加密来建立用户的身份，在登录时，还需要提供私钥文件。
4. 简单地允许用户输入正常登录口令

身份验证规则在`/etc/ssh/sshd_config`中设置

## 其他

1. 当未指定远程服务器的用户名时，默认使用当前客户端相同的用户名

## 一些配置

`/etc/ssh/sshd_config`

```shell
RhostsAuthentication yes # 允许通过~/.shosts /etc/shosts.equiv等文件登录
AllowAgentForwarding yes # 选项控制是否允许 SSH 代理转发功能
AllowTcpForwarding yes # 选项控制是否允许 TCP 转发，而
GatewayPorts yes #选项则控制是否允许绑定到非本地地址。
IgnoreRootRhosts yes # 禁止对root进行rhosts/shots验证
PasswordAuthentication yes # 允许使用正常的口令登录
```
