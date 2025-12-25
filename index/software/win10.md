---
tags:
  - 软件/win10
date updated: 2024-04-09 23:14
---

## 注册表

### 添加环境变量

`计算机\HKEY_CURRENT_USER\Enviroment`
新建字符串变量`a`，设置值为`1`

### 修改hosts

```shell
C:\Windows\System32\drivers\etc

编辑 hosts 文件，编辑后清空dns缓存

192.168.111.133 centos7
```

有时候域名不起作用，需要重新刷新一下

### 清空dns缓存

```shell
ipconfig /flushdns

netsh winsock reset
```

### 无法枚举容器内对象

1. 鼠标右键单击想要删除的“文件夹”-“属性”-“安全”-“高级”

2. 所有者“更改”-输入要选择的对象名称下面的对话框中手动输入（everyone）

3. 替换子容器和对象所有者前面框“打钩”以及使用可从此对象继承的权限项目替换所有子对象的权限项目前面也“打钩”

4. 最后点了“应用”后点“确定”，返回之前的对话框都点“确定”即可。然后就可以直接删除文件了

需要将uac`更改用户帐户控制设置` 设置为最低，然后才能成功修改

1. 在win10系统桌面上，任务栏，右键，单击任务管理器。
2. 单击性能。
3. 单击打开资源监视器。
4. 在单击CPU标签，然后再“关联的句柄”右侧的搜索框中输入要删除的文件夹名。例：文件夹名。
5. 找到关于要删除的文件夹名目录。然后右键，结束进程。

## 添加右键菜单

[vscode如何添加鼠标右键打开文件_zzsan的博客-CSDN博客_vscode怎么设置右键打开](https://blog.csdn.net/zzsan/article/details/79305279)

## 策略

关机时候有应用弹出来禁止关机，需要在Windows 10中设置关机弹出结束程序的窗口以确认关机

[解决办法](https://www.cnblogs.com/lumc5/p/15264886.html)

## 路由器

ChinaNet-P74c

bfynvcfn

pcfdn

蜡笔小新

Pass1234qwe

0070595165

telecomadmin

JHJTABbt51

KD1149597450
88147873

解绑设备码、添加设备码



登录不进路由器管理界面，修改网络配置

![[Pasted image 20240624202627.png]]
### 修改键盘按键

将 Caps Lock 修改为 esc

`计算机\HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\Keyboard Layout` 新建值 `Scancode Map`

![[Pasted image 20220716090737.png|left|400]]

新增 Scancode Map， 其值为

![[Pasted image 20220716090828.png|left|400]]

需要手动依次输入十六进制数字

![[1135660-20220921142117118-1035407055.png]]

![[1135660-20220921142305836-149811369.png]]

修改后重启

## 开机自启动脚本

gpedit.msc打开组策略编辑器

用户配置—》Windows设置—》脚本(登录|注销) 右边，名称下选择 “登录”
![[Pasted image 20231225195823.png]]

## 常见设置

设备管理器

```shell
devmgmt.msc
```

## cherry键盘

`FN F9`关闭游戏模式，一般因为alt tab没有使用

F2，F3没有用，使用 `ctrl FN` 关闭


## 浏览器收藏夹


![[xbs_backup_20240410223957.json]]