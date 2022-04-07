---
tags:
  - linux/commands/cut
date updated: 2022-04-07 14:27
---

cut以每一行为一个处理对象，类似 [[awk]]，cut 主要用来剪切数据

- `-b` 按字节（bytes）定位
- `-c` 按字符（characters）定位，与 `-b` 基本类似，但适合处理中文等
- `-f` 按域（fields）定位，使用 `-d` 定义分割符，分割符只支持单个字符，不能识别多个空格等，默认分隔符为制表符

```shell
who|cut -b 3-5,8 # 每一行的第 3、第 4、第 5 和第 8 个字节

cat /etc/passwd|cut -d : -f 1 # 以：作为分隔符，取第一个域
```
