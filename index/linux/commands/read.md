---
aliases: 读取输入
tags:
  - linux/commands/read
date updated: 2022-03-24 16:09
---

```shell
echo 'please input your name'
read name
echo 'you name is '$name
```

对于有多行输出的脚本，可以使用`while read`来读取每一行，每一个字端

```shell
git status -s |while read mode file;
do
   echo $mode
   echo $file
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
