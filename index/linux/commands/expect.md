---
tags:
  - linux/commands/expect
---


expect是一个自动化交互套件，主要应用于执行命令和程序时，系统以交互形式要求输入指定字符串，实现交互通信。

expect自动交互流程：

spawn启动指定进程---expect获取指定关键字---send向指定程序发送指定字符---执行完成退出.

```shell
#!/usr/bin/expect

spawn ssh saneri@192.168.56.103
expect "*password"
send "123456\n"
expect eof
```