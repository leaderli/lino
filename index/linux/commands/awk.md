---
tags:
  - linux/commands/awk
date updated: 2022-04-07 14:34
---

[[perl#类似awk的用法]]


awk的基本语法为

> pattern { action }

pattern用来确定是否执行action，awk 命令是行驱动的，即针对每行文本，判断是否满足 pattern，若满足则执行 action。BEGIN 和 END ，则是在第一行之前和最后一行之后执行的特殊的 pattern

默认情况下 `awk` 以空格进行分割字符串，`-F`，可以指定分割符  `‘{print $1}’`，输出第几个分割字符

```shell
BEGIN { print "START" }
      { print         }
END   { print "STOP"  }
```

## 变量

awk可使用变量

```shell
BEGIN {x=5}
{print x,$x}
END {print "done"}
```

执行

```shell
$ echo abc |awk -f 1.awk
5 
done
```

### 形参

基于位置的形参，类似shell脚本的命令行参数,使用IFS分割字符串作为函数参数，`$0` 表示当前行，`$1` 表示切割的数组的第一个元素，`'{print $1}'`表示打印第一个元素，可使用 `-F` 指定其他切割符，

### 内置变量

- NR 当前处理的行
- NF field的总共个数，可以用 `$NF` 取最后一个field，`$(NF-1)` 倒数第二个

### 算术运算

支持常用的算术运算，字符串操作等。例如使用 `<space>` 连接字符串，例如 `7 3` 输出 `73`

### 内置函数

- system 调用其他shell脚本

```shell
echo abc |awk  '{print $1;system("echo "$1" >> 2.txt")}'
#system中的脚本的变量是独立的，因此不可直接使用$1
```

- exit 提前退出脚本

```shell
#当行有abc时退出脚本
echo abc |awk  '/abc/{exit}'
```

### 用正则表达式

```shell
# 当正则匹配时打印  
$ echo abc |awk  '/a/ {print $0}'
abc


#正则不匹配时打印
$ echo abc |awk  '!/a/ {print $0}'


$ cat 1.txt
06/04/2021 16:55:55:221 INFO - 010000012345678 00123454
06/04/2021 16:55:55:221 INFO - 010000012345678 00123455

$ awk  '$6~/55/ {print $0}' 1.txt
06/04/2021 16:55:55:221 INFO - 010000012345678 00123455
```

## 注意事项

- awk脚本中不可以使用单引号 `'`，可以使用`'\''`来转义
 
- 一般情况下 awk 与 grep 无法配合使用，但当 grep 使用参数`--line-buffered` 时，则可以

## 示例：

### 根据搜索条件追踪相关日志

```shell
#!/bin/bash
log="$1"
filter="$2"
# 06/04/2021 16:55:55:221 INFO - 010000012345678 0012345
ucid=`awk '/'"$filter"'/{exit};END{print $5}' < <(tail -n0 -f "$log")`
# 06/04/2021 16:55:55:221 INFO - 010000012345678 End
awk '{print};/'"$ucid"' End/{exit}' < <(tail -n0 -f "$log"|grep --line-buffered "$ucid")
```

### 截取除第一位之后的所有元素

```shell
echo  1 2 3 4 5|awk '{$1 = ""; print $0 }'
```

### 使用条件判断筛选数据

```shell
awk 'length($2) ==12 && $2 > 20190101 && $2 <= 20191212 {print $0}'
```
