---
tags:
  - linux/commands/grep
date created: 2022-04-05 18:01
date updated: 2023-08-13 15:34
---

grep 支持不同的匹配模式，比如默认的 BRE 模式，增强型的 ERE 模式，还有更强悍的 PRE 模式。普通情况下使用默认的 BRE(basic regular expression) 模式就可以了，这种方式的特点是支持的正则表达式语法有限。如果需要更进一步的正则表达式语法支持，可以使用 ERE(extended regular expression) 模式。如果要使用复杂的正则表达式语法，可以使用 PRE 模式，它支持 Perl 语言的正则表达式语法。

语法格式：
`grep [OPTIONS] PATTERN [FILE...]`

- `-A` n 可以输出匹配行后的 n 行
- `-B` n 可以输出匹配行前的 n 行
- `-c` 计算找到的符号行的次数
- `-C` n 可以输出匹配行前后的 n 行
- `-e` 使用多个规则
- `-f` FILE 如果正则表达式太长，或者是需要指定多个正则表达式，可以把它们放在文件中。如果指定了多个正则表达式(每行一个)，任何一个匹配到的结果都会被输出：
- `-F` 使用固定字符串的形式进行匹配，而不是使用正则表达式的模式匹配。类似`fgrep`
- `-i` 忽略大小写
- `-l` 仅显示文件名
- `-h` 不显示文件名
- `-n` 顺便输出行号
- `-o` 只输出匹配到的部分(而不是整个行)
- `-R`, -r, --recursive 会递归指定指定目录(可使用通配符)下的所有文件
- `-v` 反向选择，即输出没有没有匹配的行
- `-w` 表示匹配全词
- `--binary-files=without-match` 不搜索二进制文件
- `--colour='auto'` 是否高亮显示匹配词，可以为`never`, `always` or `auto`
- `--exclude-dir=[PATTERN]` 排除一些目录(注意，这里设置的也是正则表达式),还可以同时指定多个表达式,例如`grep -r --exclude-dir={.git,xgit} 'email' .`
- `--include` 仅搜索某些文件，可使用正则表达式，同时可以指定多个表达式 `grep -rn 'stream' . --include='*.cpp'`
- `-P` 使用 perl 的正则引擎
- `-q` ：表示静默模式，不输出任何内容，只返回状态码。

grep 支持简单的正则表达式，

其规则如下

![linux搜索_linux搜索_基础的正则表达式规则.png](linux搜索_linux搜索_基础的正则表达式规则.png)

示例

```shell
~$ grep -i he 1.txt
Hello
hello

~$ grep -e a123 -e b123 1.log
a123456bcd
b1234aaeef

 ~$ grep -rn 'include' . --include='*.c' --exclude-dir={backup,temp}
./test/hello.c:1:#include <stdio.h>
./test/hello.c:2:#include <stdlib.h>

~$ grep -P '\d{6}' 1.log
a123456bcd


# 查找含有tab的行
~$ grep -P '\t' 1.log 
~$ grep -rnP '\t'  .   --include='*.yml'
# some_command的输出为空，则执行
~$ some_command|grep -q .|| echo 'empty'

```

## fgrep

`fgrep`是一个用于在文件中进行快速字符串搜索的命令行工具。它是`grep`命令的一个变种，专门用于执行固定字符串（而不是正则表达式）的快速搜索。
