---
aliases: ssh
tags:
  - linux/commands/ssh
date updated: 2024-07-14 13:37
---

## 概述

ssh 是一种协议，有关如何在网络上构建安全通信的规范。协议内容涉及认证、加密、传输数据的完整性。

## 登录验证

ssh使用几种不同的方式验证用户的登录

1. 如果在 `~/.rhosts` `~/.shosts` `/etc/hosts.equiv` `/etc/shosts.equiv` 中列出了用户从远程登录的主机名，那么用户无需检查口令就可以登录
2. 使用公钥加密来验证远程主机的身份，远程主机的公钥必须在本地主机的`ect/ssh_known_hosts`或`~/.ssh/known_hosts`文件中列出
3. 使用公钥加密来建立用户的身份，在登录时，还需要提供私钥文件。
4. 简单地允许用户输入正常登录口令

身份验证规则在`/etc/ssh/sshd_config`中设置

### 公钥验证的过程

![[ssh_公钥验密过程|800]]

```shell
# 在客户端生成秘钥
$ ssh-keygen -t rsa
```

将公钥追加到服务器的的`~/.ssh/authorized_keys`文件中

- 将公钥的内容复制后直接追加到服务器文件
- 可通过 [[#执行远程命令]] 来完成
- 可以简单的使用
  ```shell
  # 采用的是默认的22端口，拷贝的公钥是默认的id_rsa.pub
  $ ssh-copy-id user@example.com
  # 会自动生成一对密钥
  $ ssh-copy-id -i user@example.com
  ```

### 无法登录的原因

#### 确保服务器的文件及目录权限

1. 设置 authorized_keys 权限\
   `chmod 600 authorized_keys`
2. 设置.ssh 目录权限\
   `chmod 700 -R .ssh`
3. 设置用户目录权限\
   `chmod go-w ~`

#### 检测服务器配置项

检查 AuthorizedKeysFile 配置是否启用 authorized_keys

```shell
$ cat /etc/ssh/sshd_config |egrep AuthorizedKeysFile
#AuthorizedKeysFile    .ssh/authorized_keys
```

把下面几个选项打开

```conf
AuthorizedKeysFile  .ssh/authorized_keys
```

后续再执行`ssh`操作，或者`scp`等操作，则不需要再输入密码

#### 通过日志分析

通过系统日志文件我们可以查看无法登陆远程服务器的原因

```shell
tail /var/log/secure -n 20
#也可以在使用ssh时将详情打印出来
ssh -vvv root@192.168.0.1
```

#### 尝试使用ssh-agent

默认情况下，ssh 去`~/.ssh/`目录下去找私钥，有时候无法，可以使用`ssh-agent`将私钥加载到内存中

```shell
# 启动ssh代理
$ ssh-agent
# 将默认私钥注册到agent
$ ssh-add 
# 将指定私钥注册到agent
$ ssh-add  ~/.ssh/id_rsa
# 查看已经加载的私钥
$ ssh-add  -l
# 删除
$ ssh-add  -d
```

当私钥有密码时，也可以使用这种方式来避免重复输入密码

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

## 端口转发

### 本地转发

在服务器使用[[netcat]]，或者使用python发布一个http服务，使用端口 7777

```shell
# 只转发回环地址的2001端口
ssh -L2001:localhost:7777 centos7
```

上面的命令会登录到centos7上，在关闭连接之前，所有在客户端服务器的2001的端口，将会被转发到centos7的7777

如果想要在其服务器访问上述客户端的2001，可以通过如下方式

```shell
# 只转发回环地址的2001端口
ssh -g -L2001:localhost:7777 centos7
```

或者将 [[#客户端配置|ssh_config]] 中允许使用远程主机进行端口转发

我们也可以在[[#客户端配置|ssh_config]] 中做如下配置，则在连接debian2时，自动启用转发

```shell
Host debian2
	LocalForward 2001 localhost:8000
```

## 服务器安装sshd

以debian作为示例

```shell
$ apt-get install openssh-server

# 查看状态
$ systemctl status ssh
```

## 客户端配置

`/etc/ssh/ssh_config`

```shell
# 指定SSH服务器是否允许远程主机通过该服务器进行端口转发，默认为no
GatewayPorts yes
```

## 服务器配置

`/etc/ssh/sshd_config`

```shell
RhostsAuthentication yes # 允许通过~/.shosts /etc/shosts.equiv等文件登录
AllowAgentForwarding yes # 选项控制是否允许 SSH 代理转发功能
AllowTcpForwarding yes # 选项控制是否允许 TCP 转发，而
GatewayPorts yes #选项则控制是否允许绑定到非本地地址。
IgnoreRootRhosts yes # 禁止对root进行rhosts/shots验证
PasswordAuthentication yes # 允许使用正常的口令登录
```

检查配置

```shell
$ sshd -t 
Could not load host key: /etc/ssh/ssh_host_rsa_key
Could not load host key: /etc/ssh/ssh_host_ecdsa_key
Could not load host key: /etc/ssh/ssh_host_ed25519_key
```

## 其他

1. 当未指定远程服务器的用户名时，默认使用当前客户端相同的用户名
