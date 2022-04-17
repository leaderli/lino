---
tags:
  - linux/commands/ls
date updated: 2022-04-14 11:02
---

## 参数

- `-F` 为不同类型的文件添加后缀`*/=>@|`
  - `@`  软连接
  - `*` 可执行文件
  - `=` socket
  - `|` 管道
  - `>` door
  - `/` 目录

    ```shell
    # 查看文件描述符的示例
    $ ls -F  /proc/self/fd
    0@  1@  2@  3@
    ```

- -h 使用 `-h` 参数时，会根据文件的大小自动选择显示的单位是 `K`、`M` 、 `G`

- -R 递归显示文件

- -i 显示 [[linux basic#inode|inode]] 节点编号

## 设置

设定 `ls` 的文件日期显示格式

编辑全局配置文件：/etc/profile，使所有用户均显示该格式：

```shell
#vi  /etc/profile
export TIME_STYLE="+%Y-%m-%d %H:%M:%S"
```

## 字段含义

```shell
ls -l
-rw-rw-r--.  1 li li        22 2020-10-16 22:14:31 1.log
drwxrwxr-x.  3 li li       269 2020-09-12 09:09:21 backup
lrwxrwxrwx.  1 li li        24 2020-05-22 10:44:52 redis -> /usr/share/redis/cluster
```

第一个字段用来描述文件或目录的权限，第一个字符确定文件的类型

- `-` 文件

- `d` 目录

- `l` 链接

- `c` 字符设备文件。一般位于 `/dev` 如键盘，最小传输单位为一个字节

- `b` 块设备文件,一般至于 `/dev` 目录下，设备文件是普通文件和程序访问硬件设备的入口，最小传输单位为一个数据块（512 字节）

- `n`

## 示例

### 按时间排序

```shell
ll -rt
```

### 按文件大小顺序显示

```shell
ll -LS
```
