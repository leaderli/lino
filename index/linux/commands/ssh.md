---
aliases: ssh免密
tags:
- linux/commands/ssh
---

## ssh免密


操作机上生成秘钥`ssh-keygen -t rsa`,将会生成一对秘钥，将公钥内容追加到服务器的`~/.ssh/authorized_keys`中，
- 可通过 ![[#执行远程命令]] `
- 可以简单的使用
	```shell
	ssh-copy-id user@example.com
	```

采用的是默认的`22`端口，拷贝的公钥是默认的`id_rsa.pub`

确保服务器的文件及目录权限

1. 设置 authorized_keys 权限  
   `chmod 600 authorized_keys`
2. 设置.ssh 目录权限  
   `chmod 700 -R .ssh`
3. 设置用户目录权限  
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