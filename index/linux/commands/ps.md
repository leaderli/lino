---
tags:
  - linux/commands/ps
date updated: 2023-08-06 15:23
---

当前正在运行的进程的快照信息

- `-e` 显示所有进程，而不仅仅是当前用户的进程。
- `-f` 显示完整格式的输出，包括更多的进程信息
- ` -p  ` `<PID>`：仅显示指定PID的进程信息
- `-o <FORMAT>`：自定义输出格式，指定要显示的列。

  常用格式：
  - `PID`：进程ID。
  - `USER`：进程所属的用户名。
  - `%CPU`：CPU使用率。
  - `%MEM`：内存使用率。
  - `START`：进程的启动时间。
  - `TIME`：进程的累计运行时间。
  - `CMD`：进程的命令名称及其参数。
- `--no-headers`：禁止显示列标题行

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
