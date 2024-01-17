---
tags:
  - linux/commands/find
date updated: 2023-10-30 04:04
---

`find` 实时查找命令
命令语法`find [path] [expression]`

###  `-cmin`

`-cmin -n` : 在过去 n 分钟内被修改过
`-cmin +n` : 在 n 分钟之前被修改过
  例如
```shell
#十分钟之内
find . -cmin -10
#十分钟之前
find . -cmin +10
```

###  `-ctime`

`-ctime` 与 `-cmin` 类似，表示天数
`-ctime` 和`-mtime` 的区别，`-mtime` 表示文件内容被修改，`-ctime` 表示文件内部或文件的 metadata（权限，所有者等）被更改

###  `-delete`

满足条件的文件删除

```shell
# 删除十天前的文件
find ./my_dir -mtime +10 -type f -delete
```

###  `-name`

根据文件名搜索，`*`是通配符
`find . -name h*`
若忽略大小写可以使用 `-iname`
可使用正则表达式来搜索文件名，将搜索条件引号包含
`find . -name '[regex]'`
或者使用
`find . -regex '[regex]'`
需要注意的是，正则表达式匹配的是搜索的全名，而不是文件名。例如

```shell
~$ find . -regex '.*.txt' -maxdepth 1
./1.txt
```

若使用 `^1.*` 是搜索不出这个文件的

## `-maxdepth`

`-maxdepth n` ： 搜索指定的深度

### `-not`

反向搜索
例如: `find . -not -name 'he'`

### `-type` 

搜索指定类型的文件

1. `d`: 目录
2. `c`: 字型装置文件
3. `b`: 区块装置文件
4. `p`: 具名贮列
5. `f`: 一般文件
6. `l`: 符号连结
7. `s`: socket

### `-exec`

执行额外命令
```shell
find /path/to/directory -name "*.txt" -exec rm {} \;
```
## 示例
  查找指定扩展名的文件

  ```shell
  find . -type f -regex '.*\.(jpg|png)'
  find . -type f|egrep  '.*\.(jpg|png)'
  ```

循环每个查找到的文件

```shell
# 使用循环将 find 命令结果添加到数组中
while IFS= read -r -d '' file; do
	echo "$file"
done < <(find /path/to/directory -type f -print0)
```
=======
## 示例

移动目录下所有文件到

```shell
find /path/to/source/directory -type f -iname "*.gif" -exec mv {} /path/to/destination/directory \;
```
