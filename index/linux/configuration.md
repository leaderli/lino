---
aliases: 设置
tags:
  - linux/configuration
date updated: 2022-04-14 11:18
---

## 配置文件的加载

一般情况下位于用户目录下的配置文件以 `.` 开头，同时系统`/etc`下会有同名不以 `.` 开头的文件，首先加载 `/etc` 下的配置文件，然后加载用户目录下的配置文件

### login shell

`login shell`是需要用户输入账号和密码进入`shell`，进行一个完整的登录流程。这种登录方式加载配置文件的方式如下

1. 加载全局配置文件`/etc/profile` ， 该脚本会将`/etc/profile.d` 目录下的 sh 文件全部执行
2. 加载用户配置文件，`~/.bash_profile` 或 `~/.bash_login` 或 `~/.profile` 。上述三个文件只会读取一个，优先级依次降低
   login shell 是说在取得 bash 时需要完整的登陆流程。什么时候取得 bash 呢？当然就是用户登陆的时候。当你在 `tty1~tty6` 登陆，需要输入账号和密码，此时取得的 bash 就是 login shell。

### interactive shell

当使用非登录的方式启动一个 bash 时 ，就像你在桌面视图中用`ctrl+alt+T` 启动的 shell 输入窗口就是 `non-login shell` 。还有就是你在 shell 窗口直接 su 切换的用户，都属于 `non-login shell`。
`non-login shell`

1. 加载全局配置文件 `/etc/bashrc`
2. 加载 `~/.bashrc`

当使用`su <user>`切换用户的时，是以 `non-login shell` 的方式取得 bash 的，所以你的环境变量 PATH 等是不会改变的，如果你需要读取`/etc/profile` 的话， 你需要用`su - <user>`的方式登录。`su -` 就是 `su -l` 即`su --login`的意思

配置文件修改后需要使用 `source` 命令让它立即生效，例如 `source ~/.bashrc`

### Non-interactive shell

在脚本中执行的 shell

## 变量

### 全局变量

![[printenv]]

### 临时变量

```shell
set             # 打印所有临时变量
set hello=you   # 设置临时变量
unset hello     # 移除变量，当你尝试移除一个全局变量时，仅仅移除当前环境的变量，在退出当前执行进程后，该变量依然存在
```

### 一些常见变量

| 变量   | 描述                            |
| :--- | :---------------------------- |
| IFS  | 一系列用于区分不同属性的字符串集合，默认是空格       |
| PATH | shell 用来查找命令的目录，不同的目录用 `:` 分割 |
| PS1  | 原始的 shell 提示字符串               |
| PS2  | 提示继续进行输入的提示符                  |
| PS4  | debug脚本的提示符，默认为`+`|
| PWD  | 当前目录                          |

## 常见配置

### 设定文件日期显示格式

编辑全局配置文件：`/etc/profile`，使所有用户均显示该格式：

```shell
#vi  /etc/profile
export TIME_STYLE="+%Y-%m-%d %H:%M:%S"
```

### 命令行提示字符串的格式

通过配置变量 `PS1` 的值，可设置命令行提示字符串的格式 ^504e6a

```shell
# 一个高亮紫色的$符号
PS1='\[\e[1m\]\[\e[35m\]\$ \[\e[0m\]'
```

### 命令行debug模式提示符

```shell
# 一个显示脚本名，方法名，脚本行数的提示符
export PS4='+\e[01;32m[${BASH_SOURCE}:${FUNCNAME[0]}:${LINENO}]\e[00m'
```

效果如下：

```shell
sh -x test.sh

+[test.sh::1]echo 123
123
```

### 更新系统时间

```shell
# 同步上海的时间
ntpdate  ntp.api.bz
# 查看时区
date -R
```

### 关闭自动退出

```shell
# vi /etc/profile

unset TMOUT
# 或者
TMOUT=0
```

## IFS

Shell 脚本中有个变量叫 IFS(Internal Field Seprator) ，内部域分隔符，shell 根据 IFS 的值，默认是 space, tab, newline 来拆解读入的变量，然后对特殊字符进行处理，最后重新组合赋值给该变量。

```shell
#!/bin/bash

string="hello,shell,split,test"

#对IFS变量 进行替换处理
OLD_IFS="$IFS"
IFS=","
array=($string)
IFS="$OLD_IFS"

for var in ${array[@]}
do
   echo $var
done
```

## inputrc

在 `~/.inputrc` 下面新增，以实现终端Tab补全提示忽略大小写

```
set completion-ignore-case on
```

## history

通过修改 [[#login shell|配置文件]] 设置历史记录不重复

```bash
# 忽略记录一些命令
export HISTIGNORE='ls:ll:ls *:ll *bg:fg:history'
# 忽略重复命令，仅有空格区别的命令视为同一个命令
export HISTCONTROL=ignoreboth:erasedups
# history 带上命令执行时间
export HISTTIMEFORMAT="%Y-%m-%d %T"
```

同时我们可以设置 `~/.bashrc` ，使得可以使用上下箭头补全历史命令

```shell
if [[ $- == *i* ]]
then
        bind '"\e[A": history-search-backward'
        bind '"\e[B": history-search-forward'
fi
```

需要确保 `/etc/inputrc` 的两个配置打开了

```shell
"\e[5~": history-search-backward
"\e[6~": history-search-forward
```


history的命令也可以直接用 `!n`  执行，例如

```shell
 1249  cat hosts
 1250  cat yum.conf 
 1251  :q
 1252  cat tcsd.conf
 1253  sudo cat tcsd.conf
 1254  ll
 1255  history 
$ !1249
cat hosts
127.0.0.1   localhost localhost.localdomain localhost4 localhost4.localdomain4
::1         localhost localhost.localdomain localhost6 localhost6.localdomain6

```