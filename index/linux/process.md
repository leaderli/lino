---
aliases: linux基础知识
tags:
  - linux/process
date updated: 2022-04-10 12:56
---

## 后台运行

shell 中执行命令若以`&` 结尾，则程序会在后台执行，当用户退出时该后台程序会停止运行。若需要程序永久运行可以使用 `nohup`
可使用 `jobs` 查看正在运行的作业，然后可以使用 `fg %n` (n 为作业编号)将后台任务返回前台

Ctrl+c 是强制中断程序的执行。
Ctrl+z 的是将任务中断,但是此任务并没有结束,他仍然在进程中他只是维持挂起的状态。

Ctrl+z 的程序也可以使用 `fg` 将其返回前台

`jobs -l` 显示 `pid`

## 查询进程

![[lsof#示例]]

![[ps#示例]]

## 杀进程

![[kill]]

## 分析进程

![[pstack]]

## 常用命令

### 快速杀进程

```shell
ps -ef|grep java|grep -v grep|awk '{print "kill -9 "$2}'|sh
```
