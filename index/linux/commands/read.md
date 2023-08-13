---
aliases: 读取输入
tags:
  - linux/commands/read
date updated: 2023-08-13 16:51
---

read 命令用于从标准输入读取数值。

- -p 参数，允许在 read 命令行中直接指定一个提示
- -s 选项能够使 read 命令中输入的数据不显示在命令终端上
- -r 禁用反斜杠的转义功能
- -t 参数指定 read 命令等待输入的秒数，当计时满时，read 命令返回一个非零退出状态。
- -n 参数设置 read 命令计数输入的字符。当输入的字符数目达到预定数目时，
- -e 参数，以下实例输入字符 a 后按下 Tab 键就会输出相关的文件名(该目录存在的)：

```shell
echo 'please input your name'
read name
echo 'you name is '$name
```

```shell
$ read -e -p "输入文件名:" str
输入文件名:a
a.out a.py a.pyc abc.txt
输入文件名:a
```

read 不能单独用在管道命令上，对于有多行输出的脚本，可以使用 `while read` 来读取每一行，可以使用一个变量来接受每一行，也可以使用多个变量来接受，当指定多个变量时根据  [[configuration#IFS|IFS]] 规则分割变量。当变量少于实际时，剩余的参数会被最后一个变量接收

```shell
cat file.csv|IFS=',' read -r field1 field2 field3
```

其原理为：

read 通过输入重定向，把 file 的第一行所有的内容赋值给变量 line，循环体内的命令一般包含对变量 line 的处理；然后循环处理 file 的第二行、第三行。。。一直到 file 的最后一行。还记得 while 根据其后的命令退出状态来判断是否执行循环体吗？是的，read 命令也有退出状态，当它从文件 file 中读到内容时，退出状态为 0，循环继续惊醒；当 read 从文件中读完最后一行后，下次便没有内容可读了，此时 read 的退出状态为非 0，所以循环才会退出。

```shell
git status -s |while read mode file;
do
   echo $mode '-->' $file
done
```

从管道中读取输入

```shell
name=`git branch|while read branch
do
   if test "dev" == "$branch"
   then
      echo "dev"
      break
   fi
done
`
```

从文件中读取输入

```shell
# line 仅仅是个变量名
while read line
do
   echo $line
done < file
```

```shell
# 去除每行的换行符
cat $FILE | tr -d '\r' | while read line
do
   echo $line
done 
```
