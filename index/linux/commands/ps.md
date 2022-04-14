---
tags:
  - linux/commands/ps
date updated: 2022-04-14 11:20
---

## 示例

### 查询正在运行的进程信息

```shell
   ps -ef
```

### 查询归属于用户 colin115 的进程

```shell
ps -ef | grep colin115
ps -lu colin115
```

### 查询进程 ID（适合只记得部分进程字段）

```shell
pgrep <name>

```

### 以完整的格式显示所有的进程

```shell
ps -ajx
```

### 显示进程内存占用

```shell
ps -aux
```

### 显示内存占用较多的进程

```shell
ps -aux --sort=-rss|head 10
```
