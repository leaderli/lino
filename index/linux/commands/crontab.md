---
tags:
  - linux/commands/crontab
date updated: 2024-06-27 13:24
---

crond 是linux用来定期执行程序的命令。当安装完成操作系统之后，默认便会启动此任务调度命令。crond命令每分锺会定期检查是否有要执行的工作，如果有要执行的工作便会自动执行该工作。

### 参数

- `-e`  编辑某个用户的cron服务

  为当前用户创建 cron 服务

  键入 crontab -e 编辑 crontab 服务文件

  例如 文件内容如下：

  ```css
   */2 * * * * /bin/sh  /home/admin/jiaoben/buy/deleteFile.sh
   :wq #保存文件并并退出
  ```

  `/bin/sh /home/admin/jiaoben/buy/deleteFile.sh` 这一字段可以设定你要执行的脚本，这里要注意一下 `bin/sh` 是指运行 脚本的命令 后面一段时指脚本存放的路径

- `-l` 列出某个用户cron服务的详细内容

- `-r` 删除某个用户的cron服务

- `-u` 设定某个用户的cron服务，一般root用户在执行这个命令的时候需要此参数

### 示例

```shell
#  root查看自己的cron设置:
crontab -u root -l
# root想删除fred的cron设置
crontab -u fred -r
# 
crontab -u root -e
```

### 启动定时任务

一般启动服务用 `/sbin/service crond start` 若是root用户的 cron 服务可以用 `sudo service crond start`， 这里还是要注意 下 不同版本 Linux 系统启动的服务的命令也不同 ，像我的虚拟机里只需用 `sudo service cron restart` 即可，若是root用户直接键入 `service cron start` 就能启动服务

### cron 文件语法

在编辑cron服务时，编辑的内容有一些格式和约定，输入:crontab -u root -e
进入vi编辑模式，编辑的内容一定要符合下面的格式:
`* * * * * ls >> /tmp/ls.txt`

```css
分     小时    日       月      星期     命令
0-59   0-23   1-31   1-12     0-6     command     (取值范围,0表示周日一般一行对应一个任务)
```

记住几个特殊符号的含义:

- `*` 代表取值范围内的数字,
- `/` 代表”每”,
- `-` 代表从某个数字到某个数字,
- `,` 分开几个离散的数字

## 注意事项

1. command 可以事任何合法的shell命令，而且不应该加引号，cron认为command一直是到这行的末尾，它可以包含空格或制表符
2. crontab的脚本需要有执行权限
3. crontab中默认不会加载用户环境变量（~/.bash_profile等），需要使用如下方式

	```shell
	* * * * * bash -l -c '/path/to/script.sh'
	```

## 示例

```shell
0,1,2 * * * * sh ~/demo.sh
# 每分钟执行
* * * * * sh ~/demo.sh
# 每五分钟执行
*/5 * * * * sh ~/demo.sh
# 每天凌晨执行
0 0  * * * sh ~/demo.sh
```

### 添加crontab权限

文件中添加用户名

```shell
/etc/cron.allow
```
