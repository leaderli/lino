---
aliases: shell
tags:
  - linux/bash
date updated: 2023-08-21 21:42
---

## shell

shell 是系统内核和用户沟通的桥梁，它作为系统的命令解释器为用户提供解释命令的功能。linux 系统上存在多种 shell。可通过

```shell
#查看系统支持的 shell 软件
cat /etc/shells
#查看用户登录后默认使用的shell(当前用户时li)
cat /etc/passwd|grep ^li:
# 查看所有shell
chsh -l
# 切换shell
chsh
```

## 重定向符

重定向符有四个

- `>`   将输出保持到文件中，会覆盖已存在文件，可以使用`set -C`禁止覆盖
- `>>` 将输出追加到文件中
- `<`   将文件内容作为输入源
- `<<`  [[#here]]

```shell
echo 123 > 1.txt
# 完整命令是
echo 123 1> 1.txt
```

linux 中默认输入输出是指向 [[linux basic#文件描述符|文件描述符]]  `0` , `1` , `2` 的，对于 `2>&1` 的意思就是将标准错误也输出到标准输出当中。

默认情况下输出的源文件描述符为`0`，

```shell
$ ls
1.txt
# 1和>没有空格
# 下属语句完整的表达式为 cat 1.txt  2.txt 1> 3.txt
$ cat 1.txt  2.txt > 3.txt
cat: 2.txt: No such file or directory
$ more 3.txt
1.txt
```

`shell`中可能经常能看到：`echo log > /dev/null 2>&1` ,命令的结果可以通过 `>` 的形式来定义输出, `/dev/null` ：代表空设备文件

- `1 > /dev/null 2>&1` 语句含义

  1. `1 > /dev/null` ： 首先表示标准输出重定向到空设备文件，也就是不输出任何信息到终端，说白了就是不显示任何信息。
  2. `2>&1` ：接着，标准错误输出重定向（等同于）标准输出，因为之前标准输出已经重定向到了空设备文件，所以标准错误输出也重定向到空设备文件。

- `cmd >a 2>a` 和 `cmd >a 2>&1` 为什么不同？

  1. `cmd >a 2>a` ：`stdout` 和 `stderr` 都直接送往文件 `a` ，`a` 文件会被打开两遍，由此导致 `stdout` 和 `stderr` 互相覆盖。`cmd >a 2>a`  相当于使用了 `FD1`、`FD2` 两个互相竞争使用文件 `a` 的管道；
  2. `cmd >a 2>&1` ：`stdout` 直接送往文件 `a`，`stderr` 是继承了 `FD1` 的管道之后，再被送往文件 `a`  。`a` 文件只被打开一遍，就是 `FD1` 将其打开。`cmd >a 2>&1` 只使用了一个管道 `FD1`，但已经包括了 `stdout` 和 `stderr` 。从 `IO` 效率上来讲，`cmd >a 2>&1` 的效率更高。

### 关闭文件描述符

- `n<&?`  Close input file descriptor n.
- `0<&?, <&?`  Close stdin.
- `n>&?` Close output file descriptor n.
- `1>&?, #>&?` Close stdout.

### <<<

将字符串转换为输入

```shell
string="Hello, world!"
grep "world" <<< $string
```

### 使错误日志重定向到正常输出

```shell
sh error.sh > messge.log 2>&1
#也可以这样写
sh error.sh  1>$messge.log
```

### 忽略错误信息

```shell
command 2>/dev/null
command 2>&- 
```

### 当前脚本永久重定向

```shell
exec 1>1.log
exec 2>1.log

#关闭某个文件描述符
exec 1>$-
```

### here

又称作 heredoc、hereis、here-字串或 here-脚本，here 文档最通用的语法是`<<` 紧跟一个标识符，从下一行开始是想要引用的文字，然后再在单独的一行用相同的标识符关闭。在 Unix shell 里，here 文档通常用于给命令提供输入内容。

在以下几个例子中，文字用 here 文档传递给 tr 命令。

```shell
$ tr a-z A-Z <<END_TEXT
 > one two three
 > uno dos tres
 > END_TEXT
 ONE TWO THREE
 UNO DOS TRES
```

默认地，会进行变量替换和命令替换：

```shell
 $ cat << EOF
 > Working dir $PWD
 > EOF
 Working dir /home/user
```

输出到其他管道
```shell
 $ cat << EOF > 1.txt
 > Working dir $PWD
 > EOF
```



### 管道符

使用管道符，可以将一个命令的输出重定向到另一个命令的输入，默认情况下只会讲标准输出(fd 为 1)重定向到另一个命令

```shell
command1|command2
```

当 command2 命令结束或被打断时，从 command1 接收的 `/dev/stdout` 的管道则会销毁，但是并不会马上打断 command1 的执行。我们可以使用进程替代

```shell
#< <中间有空格
awk '/STOP/{exit}1' < <(tail -f logfile)
```

### 进程替换

- `<(command_list)` 该表达式表示 command_list 命令的执行的 output 将指向一个`/dev/fd/<n>`下的文件
- `>(command_list)` 该表达式表示 command_list 命令前的 output 指向一个`/dev/fd/<n>`下的文件,command_list 的 input 则为这个文件的内容

可以使用重定向符去操作`/dev/fd/<n>`

例如

```shell
diff <(ls dirA) <(ls dirB)
```

```shell
$ cat <(ls)
1.txt
2.txt

$ echo  <(ls)
/dev/fd/63

#重定向
$ while read lines ; do echo $lines ;done < <(ls)

1.txt
2.txt

$ cat
```

替换进程命令需要在脚本上声明

```shell
!#/bin/bash
```

或者使用`bash xxx.sh`去执行

## 组合命令

可通过 `&&` ,让多个命令顺序执行，也可以通过 `;` ,不同的地方为 ` &&  `，当前一个命令的 返回码 为 0 时，才会执行后一个命令
例如

```shell
cd ~/Downloads/ && rm -rf temp`
```

`||` ,与 `&&` 相反，当前一个命令的返回码大于 0 才执行第二条

`[]` 也可以组合使用

```shell
[ condition1 ] && [ condition2 ]
[ condition1 ] || [ condition2 ]
```

一个示例

```shell
# 当a为start或stop时执行，否则提示错误
a=xxx
[ 'start' = "$a" ] || [ 'stop' = "$a" ] && $a || echo 'only support start,stop'
```

## 子进程

在括号中的命令将会有子进程来执行

```shell
(cat list1 list2 list3 | sort | uniq > list123) &
 (cat list4 list5 list6 | sort | uniq > list456) &
 # Merges and sorts both sets of lists simultaneously.
 # Running in background ensures parallel execution.
 #
 # Same effect as
 # cat list1 list2 list3 | sort | uniq > list123 &
 # cat list4 list5 list6 | sort | uniq > list456 &
 wait # Don't execute the next command until subshells finish.
 diff list123 list456
```

使用重定向符来发送输出结果

- `>(command)`
- -`<(command)`

```shell
diff <(command1) <(command2) 


while read des what mask iface; do
# Some commands ...
done < <(route -n) 
```

## `[` 和`[[`

`[` 是 shell 的一个内置命令（和命令 test 是一样的），`[` 到 `]` 之间都被视为 `[` 的参数
`[[` 是一个关键字，它的参数会根据一定规则进行处理，其他的和 `[` 是一样的

所以下述用法就是不对的

```shell
$ name="here and there"
$ [ -n $name ]
>  then
>  echo not empty
>  fi
bash: [: too many arguments

#正确的用法
$ [ -n "$name" ]
>  then
>  echo not empty
>  fi
not empty

# test

$ if test -n "$name"
>  then
>  echo not empty
>  fi
not empty
```

`[` 的常用语法有

1. 判断

   | 操作符 | 含义                          |
   | --: | :-------------------------- |
   |  -a | 检查文件是否存在                    |
   |  -b | 检查是否为块特殊文件[1]               |
   |  -c | 检查是否为字符特殊文件[2]              |
   |  -d | 检查是否为文件夹                    |
   |  -e | 检查文件是否存在                    |
   |  -f | 检查是否为常规文件[3]                |
   |  -g | 检查 gid[4]是否被置位              |
   |  -G | 检查是否有相同的组 ID                |
   |  -k | 检查防删除位是否被置位                 |
   |  -L | 检查是否为符号链接[5]                |
   |  -O | 检查文件是否被当前进程的 user ID 拥有     |
   |  -p | 检查文件是否为 FIFO[6]特殊文件或命名管道[7] |
   |  -r | 检查文件是否可读                    |
   |  -s | 检查文件大小是否大于 0                |
   |  -S | 检查文件是否为 socket 文件           |
   |  -t | 检查文件描述符是否打开                 |
   |  -u | 检查 uid[8]是否被置位              |
   |  -w | 检查文件是否可写                    |
   |  -x | 检查文件是否可执行                   |
   |  -z | 判断字符串长度是否为 0                |
   |  -n | 判断字符串长度是否不为 0               |

   示例

   ```shell
   if [  -e "$myPath"]; then
     echo 'ok'
   fi

   if [ ! -f /tmp/foo.txt ]; then
       echo "File not found!"
   fi

   if test -n "$name"
   then
   echo name not empty
   fi

   if test -z "$name"
   then
   echo name is empty
   fi
   ```

2. 逻辑判断

   在 linux 中 命令执行状态：0 为真，其他为假

   | 操作符 | 解释            |
   | --: | :------------ |
   | -eq | 等于            |
   | -ne | 不等于           |
   | -gt | 大于 （greater ） |
   | -lt | 小于 （less）     |
   | -ge | 大于等于          |
   | -le | 小于等于          |

`[[` 的用法示例

```shell
#比较两个字符串

if [[ "$a" > "$b" ]];then
  echo ''
fi
```

## 数值运算

在 bool 运算中使用 `((expression))`

```shell
var=10
if (( $var ** 2 > 90))
then
   echo ok
fi


num=$(( 1 + 1))
# 等效
num=$[ 1 + 1 ]


# 自减
((i-=1))
let "i-=1" 

# 自增
((i+=1))
let "i+=1" 
```

## case

```shell
case 值 in
模式1)
    command1
    command2
    command3
    ;;
模式2|模式3）
    command1
    command2
    command3
    ;;
*)
    command1
    command2
    command3
    ;;
esac
```

```shell
function test(){
	case $1 in
		1)
		 echo 'fuck'
		;;
		*)
		echo $1
		;;
	esac
}
```

## 变量

````ad-info
命令可以作为参数传入 shell 脚本中

```shell
echo $1
echo $2
$1 $2 #直接执行
```

````

### 间接引用

```shell

a=1
b='a'

echo ${!b} # 1
```

### declare

```shell
declare -r  a=1        # 只读
declare -i  a=1        # 声明为int
declare -f  func_name  # 声明方法
declare -a   arr       # 声明数组
```

### 多个变量赋值

```shell
read a b c <<<$(echo '1,2,3'|awk -F ','  '{print $1,$2,$3}
```

### 变量引用

一般情况下使用 `$variable`来引用变量值，它是`${variable}`的一种缩写

- `${VALUE:-WORD}`：当变量未定义或者值为空时，返回值为 WORD 的内容，否则返回变量的值。

- `${VALUE:=WORD}`：当变量未定义或者值为空时，返回 WORD 的值的同时并将 WORD 赋值给 VALUE，否则返回变量的值。

- `${VALUE:+WORD}`：当变量已赋值时，其值才用 WORD 替换，否则不进行任何替换。

- `${VALUE:?MESSAGE}`：当变量已赋值时，正常替换。否则将消息 MESSAGE 送到标准错误输出（若此替换出现在 SHELL 程序中，那么该程序将终止运行）

- `${variable#*string}`：从左往右，删除最短的一个以 string 结尾的子串，即截取第一个 string 子串之后的字符串

- `${variable##*string}`：从左往右，删除最长的一个以 string 结尾的子串，即截取最后一个 string 子串之后的字符串

- `${variable%string*}`：从右往左，删除最短的一个以 string 开头的子串，即截取最后一个 string 子串之前的字符串

- `${variable%%string*}`：从右往左，删除最长的一个以 string 开头的子串，即截取第一个 string 子串之前的字符串

- `${variable/OLD/NEW}`：用 NEW 子串替换 VALUE 字符串中匹配的 OLD 子串。

```bash
TEST=123abc456abc789
echo ${TEST#*abc}  #删掉 123abc 剩下 456abc789
echo ${TEST##*abc} #删掉 123abc456abc 剩下"789
echo ${TEST%abc*}  #删掉 abc789 剩下 123abc456
echo ${TEST%%abc*} #删掉 abc456abc789 剩下 123

#字符串长度
len=${#variable}

#当变量为空时，name 就为 hello
name=${variable:-hello}
#当变量为空时，variable被赋为hello，且返回hello
name=${variable:=hello}
#当变量为不为空时，返回hello
name=${variable:+hello}
#当变量为不为空时，variable被赋为hello，否则输出错误信息
name=${variable:+hello}

#例如，尝试读取输入参数，若无则使用默认值
input=$*
name='tom'
name=${input:=name}
```

固定位置截取，类似substr

````shell



`${varible:start:len}`:截取变量 varible 从位置 start 开始长度为 len 的子串。第一个字符的位置为 0。

```bash
TEST=123abc456abc789
echo ${TEST:0:3} #123
echo ${TEST:3:3} #abc"
````

包含

```shell

origin='12345677899'
sub=`567`

if [[ "$origin" == *"$sub"*]] #顺序不能反
then
   echo ok
fi


```

### 字符串

```shell
#!/bin/bash

VAR1="Linuxize"
VAR2="Linuxize"

if [ "$VAR1" = "$VAR2" ]; then
    echo "Strings are equal."
else
    echo "Strings are not equal."
fi

if [[ "$VAR1" == "$VAR2" ]]; then
    echo "Strings are equal."
else
    echo "Strings are not equal."
fi
```

### 形参

命令可以作为参数传入 shell 脚本中

```shell
echo $1
echo $2
$1 $2
```

shell 脚本可以读取执行时传入的参数

#### $[n]

`$0` 表示`shell`脚本本身，`$[n]` 表示 `shell` 第几个参数，`$10` 不能获取第十个参数，获取第十个参数需要 `${10}` 。当 n>=10 时，需要使用 `${n}` 的写法来获取参数。

#### $*

表示所有参数，将所有参数视为一个单词

#### $@

表示所有参数，将所有参数视为一个数组

#### ${@:n}

表示除 n 前的所有参数，例如`${@:2}`表示除了第一个参数之外的所有参数

#### `$#`

获取变量个数

### 状态码

表示最后命令的退出状态码。0 表示没有错误，其他任何值表明有错误

| code | 描述           |
| :--- | :----------- |
| 0    | 成功执行         |
| 1    | 常规错误         |
| 2    | shell 错误使用   |
| 126  | 无法执行         |
| 127  | 找不到命令        |
| 128  | 错误的退出参数      |
| 128+ | linux 信号错误   |
| 130+ | 命令被 Ctl-C 终止 |
| 255  | 退出状态溢出       |

### 状态变量

#### `$?`

表示最后命令的退出 [[#状态码]] 。

```shell
if test $? ==0
then
    echo 'last command execute success'
fi
```

#### `$$`

脚本运行的当前进程 ID 号，即便是在异步函数内部，获取的也是当前进程

```shell
#!/bin/bash

# 示例函数
function my_function {
    echo "异步函数内部的PID: $$"
}

echo "主程序开始执行"

# 异步执行函数
my_function &

echo "主程序继续执行"
```

#### $!

后台运行的最后一个进程的 ID 号

#### $-

当前set的值

#### $PIPESTATUS

表示最后一个管道的状态，他是一个数组，对应管道中每个位置的状态

```shell
command1 | command2 | command3

# 获取整个管道的退出状态码
echo "Exit status of the pipeline: $?"

# 获取每个命令的退出状态码
echo "Exit status of command1: ${PIPESTATUS[0]}"
echo "Exit status of command2: ${PIPESTATUS[1]}"
echo "Exit status of command3: ${PIPESTATUS[2]}"
```

#### *

表示当前目录所有文件，相当于 ls

#### shift n

![[shift]]

### getopts 获取参数

[[configuration#IFS|分隔符IFS]]

![[getopts]]

### 标准的参数选项

linux 有一些标准的参数选项，通过该选项我们大概可以知道该参数的含义

| option | description  |
| :----- | :----------- |
| -a     | 显示所有         |
| -c     | 计数           |
| -d     | 指定一个目录       |
| -e     | 扩展           |
| -f     | 读取一个指定的文件    |
| -h     | 帮助信息         |
| -i     | 忽略大小写        |
| -l     | 展示一个长格式的输出信息 |
| -n     | 使用非交互模式      |
| -o     | 指定一个输出文件     |
| -q     | 不打印输出        |
| -r     | 递归           |
| -s     | 不打印输入        |
| -v     | 输出详细信息       |
| -x     | 包含某个对象       |

### 数组 arrays

```shell
a=(1 2 3 4)
echo $a        #取第一个元素
echo ${a[1]}   #取角标为1的元素
a[1]=100       #赋值
echo ${a[*]}   #取所有元素
echo ${a[@]}   #取所有元素
unset a[1]     #移除角标1的元素
echo ${a[*]}
unset a        #移除整个array
echo ${a[*]}
# 1
# 2
# 1 100 3 4
# 1 3 4
#

```

```shell
#!/bin/bash

string="hello,shell,split,test"
array=(${string//,/ })

# 迭代数组
for var in ${array[@]}
do
   echo $var
done


# 下面这种方式也可以
string='1 2 3 4'
for var in ${array[@]}
do
   echo $var
done


```

### hash map

```shell
# 声明变量
declare -A animals

animals=( ["moo"]="cow" ["woof"]="dog")

animals['key']='value'

echo ${ainimals['key']}
# 打印所有值
echo "${animals[@]}"

# 遍历 key
for sound in "${!animals[@]}"; 
do 
	echo "$sound - ${animals[$sound]}"; 
done

```

### 引号

1. 单引号`''`,被称作弱引用，在 `'` 内的字符串会被直接使用，不会被替换。但是如果在双引号中的单引号中变量还是会被替换的。

   ```shell
   echo ''\'''
   #输出结果
   # '
   ```

   在单引号中转义单引号

   ```shell
   alias rxvt='urxvt -fg '"'"'#111111'"'"' -bg '"'"'#111111'"'"
   #                     ^^^^^       ^^^^^     ^^^^^       ^^^^
   #                     12345       12345     12345       1234
   ```

   上述转义是如何被解析的

   1. ' 第一个引用的结束，使用单引号
   2. " 第二个引用的开始，使用双引号
   3. ' 被引用的字符
   4. " 第二个引用的结束，使用双引号
   5. ' 第三个引用的开始

2. 双引号`""`,被称做强引用，在`"`的字符串的变量引用会被直接替换为实际的值。双引号中可以使用`\$`来转义，但不支持其他转义例如`\n`

3. 反引号`` ` ``, 反引号括起来的字串被 Shell 解释为命令，在执行时，Shell 首先执行该命令，并以它的标准输出结果取代整个反引号（包括两个反引号）部分，也可以使用 `$()` 达到同样的效果，shell 会以子进程的方式去调用被替换的命令，其替换后的值为子进程命令的 stdout 输出，其文件描述符为`1`。标准输出如果不使用双引号包含，则输出的结果可能会使用空格来替换行。例如

   ```shell
   $ cat README.md 
   # li_shell
   shell
   $ echo "`cat README.md `"
   # li_shell
   shell
   $ echo `cat README.md `
   # li_shell shell
   $ echo "$(cat README.md )"
   # li_shell
   shell
   ```

### 容错断言

如果一个或多个必要的环境变量没被设置的话, 就打印错误信息.下面是两种方式

```shell
${HOSTNAME?}  #正常
${HOSTNAME1?} #HOSTNAME1: parameter null or not set
```

### 设置静态变量

```shell
readonly MY_PATH=/usr/bin
```

### 变量使用 `*`

在编写 shell 脚本的过程中，有的时候难免会用到一些变量值被定义为(`*`)的变量，但是当我们试图引用这个变量的时候 bash 有默认会把（`*`）替换成当前目录下的所有文件名的列表，如下：

```shell
[root@vm_102 ~]# a=*
[root@vm_102 ~]# echo $a
anaconda-ks.cfg install.log install.log.syslog
[root@vm_102 ~]# ls
anaconda-ks.cfg  install.log  install.log.syslog
```

这个时候我们可以考虑一个问题：这里的（`*`）是在哪一步被替换成当前目录下面的文件列表的呢：是在第一步，变量赋值的时候就被替换的呢还是说，在 echo 变量值的时候被替换的呢？
事实是这样子的：
1、当变量复制的时候，bash 会直接将(`*`)赋值给变量 a；
2、但是在第二步引用变量的时候，bash 默认会把(`*`)替换成当前目录下的所有文件的列表，大家可以这么实验一下：

```shell
[root@vm_102 ~]# echo *
anaconda-ks.cfg install.log install.log.syslog
[root@vm_102 ~]# echo '*'
*
[root@vm_102 ~]# echo "$a"
*
```

### 打印当前使用变量

```shell
# 所有直接赋值的变量
set
# 所有申明export的变量
export -p
# 所有申明readonly的变量
readonly -p
```

### 移除变量

```shell
$ a=1
$ echo $a
1
$ unset a
$ echo $a

```

### 内置变量

1. BASH\
   bash的完整路径

2. BASH_ENV\
   bash非互动模式下,每次在执行shell脚本时会先检查BASH_ENV是否有指定文件,如果有先执行指定文件

3. BASH_VERSION\
   bash的版本

4. CDPATH\
   cd命令的搜索路径 cd file #如果当前路径下不存在file目录,则由CDPATH中查找

5. ENV\
   bash互动模式下或者POSIX模式下,会先检查ENV是否有指定文件.如果有先执行指定文件

6. EUID\
   有效使用者id

7. FEDITOR\
   fc命令默认使用的比较器

8. FIGNORE\
   在文件名补齐时会排除FIGNORE指定的文件扩展名. 在进行文件名补齐时,如若想忽略的扩展名列表.各文件名之间用:隔开,例如"~:.sh"

9. FUNCNAME\
   在函数式执行期,此变量内容即为函数式的名称 function fun { echo $FUNCNAME #fun }

10. GLOBIGNORE\
    做样式比较时,要想忽略的文件名列表.各文件名之间用:隔开

11. GROUPS\
    这是一个数组变量,包含用户所属的组群列表 echo ${GROUPS[2]}

12. HISTCMD\
    当前指令执行完后,它在历史指令中的排列编号

13. HISTCONTROL\
    控制指令是否存入历史脚本文件中.该变量有三个可能的值 1.ignorespace:凡是指令开头有空格符的不存入历史脚本中 2.ignoredups:连续重复指令只存一个 3.ignoreboth:结合前两者功能

14. HISTFILE\
    设定历史脚本文件的路径文件名

15. HISTFILESIZE\
    历史脚本文件存储指令的最大行数

16. HISTIGNORE\
    不存入历史脚本文件中的指令样式,以:隔开 HISTIGNORE=ls:ps:t*:& #表示ls/ps/t开头的命令/已经重复指令不保存 &代表最后一个指令,这表示如果一直键入重复指令只会存一次.但需要对&先转义成单纯的字符

17. HISTSIZE\
    设定在互动模式的shell中可记住的历史指令数目.一旦该shell结束历史记录脚本中只会保存HISTSIZE行数的指令.

18. HOME\
    设定用户的家目录.

19. HOSTFILE\
    包含自动补齐主机名的数据文件位置

20. HOSTNAME\
    主机名

21. HOSTTYPE\
    主机形态,例如i386

22. IFS\
    定义字段的分割字符

23. IGNOREEOF\
    设定在按ctrl+D时,出现几次EOF后才能注销系统.

24. INPUTRC\
    设定命令行函数式库readline的启动配置文件,可覆盖~/.inputrc的设定

25. LANG\
    目前语系(locale)的名称,locale是指一组地区性语言的信息

26. LC_ALL\
    目前的locale,可覆盖LANG和LC_*的设定

27. LC_COLLATE\
    locale的字母排序

28. LC_CTYPE\
    locale的字符分类

29. LC_MESSAGES\
    locale信息显示的转换

30. LINENO\
    脚本以执行到的行数

31. MACHTYPE\
    描述主机形态的GNU格式:cpu-公司-系统

32. MAIL\
    邮件文件的名称

33. MAILCHECK\
    每隔多久就检查一次邮件,通常是60秒

34. MAILPATH\
    设定检查新邮件的文件名,如果有两个以上用:分割

35. OLDPWD\
    前一个工作目录

36. OPTARG\
    用getopts处理选项时,取得的选项参数

37. OPTIND\
    使用getopts处理选项时,选项的索引值

38. OPTERR\
    如果吧OPTERR设为1,则getopts发生错误时,不管选项行第一个字符是否为:,仍然显示错误信息

39. OSTYPE\
    执行bash 的操作系统种类

40. PATH\
    设置环境变量的值.

41. PPID\
    父进程的id

42. PRONPT_COMMAND\
    出现主要提示符$PS1之前执行的命令

43. PS1\
    主要提示符

44. PS2\
    次级提示符

45. PS3\
    select选单的提示符

46. PS4\
    追踪程序时各行的提示符样式

47. PWD\
    目前的工作路径

48. RANDOM\
    随机函数,随机出现整数.在使用RANDOM变量之前,需要随意设置一个数字给RANDOM,当做随机数种子 `RANDOM=$$`  echo $RANDOM

49. REPLY\
    select和read没有设定读取变量时的默认变量名称

50. SECONDS\
    目前bash shell已经执行的时间

51. SHELL\
    SHELL的文件路径

52. SHELLOPTS\
    本变量的内容经set -o设定为以开启的shell选项,以:分割

53. SHLVL\
    子shell的层级数

54. TIMEFORMAT\
    设定time统计运行时间的格式

55. TMOUT\
    如果TMOUT的值大于0,bash会在TMOUT秒后自动结束当前shell.

56. UID\
    用户的编码

57. $1-$n\
    位置参数,传入程序或者函数式的参数

58. $*\
    代表所有的位置参数,并视为一个字符串

59. $@\
    代表所有的传入参数,并将每一个参数视为一个字符串

60. $#\
    表示传入参数的个数

61. $-\
    bash shell目前使用的功能选项.

62. $?\
    上一个命令结束时返回的退出状态码

63. `$$`\
    目前shell的进程编号

64. $!\
    上一个后台程序的进程号

65. $_\
    用三种用途: 1.脚本执行时,表示bash的绝对路径 2.上一个命令执行时,最后一个位置参数 3.检查邮件时为邮件的文件名

66. HISTTIMEFORMAT\
    如果设定这个变量为一个时间格式,则在执行history时会在每个历史命令前显示日期时间.该变量支持的时间格式与date命令的相同.

## 输入

![[read]]

## 捕获信号

```shell
#!/bin/bash
#捕获EXIT信号
trap "echo byebye" EXIT
sleep 100;
#移除捕获EXIT信号
trap - EXIT

```

```shell
# 列出所有信号，trap可以使用信号的编号
$ trap -l
# 向某个进程发出指定信号
$ kill -s <signal> <pid>
```

例如

```shell
# 杀掉某进程
kill -9  12345

# 一个简单的守护进程

while kill -0 "$pid" >/dev/null 2>&1
do
   echo 'progress is running'
   sleep 1
done

echo 'progress terminated'

```

当使用 ctl-c 中断时，会执行 trap 里的命令

忽略信号：

```shell
#如果陷阱列出的命令是空的，指定的信号接收时，将被忽略。例如，下面的命令：
$ trap '' 2
```

## 函数

shell 中函数的有两种方式

```shell

function name{
   commands
}

name(){
   commands
}

```

1. 返回值（仅允许为 0~255 的数值），可以显示加：return 返回，如果不加，将以最后一条命令运行结果，作为返回值。
2. 函数返回值在调用该函数后通过  `$?` 来获得。
3. 调用函数时可以向其传递参数。在函数体内部，通过 $n 的形式来获取参数的值，例如，$1 表示第一个参数，$2 表示第二个参数
4. 函数的输出可以使用替换命令来得到，即使用`` `command` ``或`$(command)`（不是所有 linux 都支持`$()`)
5. 可以使用`local`声明函数内部的变量，使其作用域仅限于函数内

示例

```shell
fun(){
   echo $1
   return 1
}

fun 'hello'
echo $?

```

### 匿名函数

```shell
{
 read line1
 read line2
} < 1.txt

echo $line1
echo $line2
```

```shell
{
echo 123
echo 456
} > 1.txt

```

### :

NOP 函数，不做任何操作，可用于while，if等用

```shell
if condition
then : # Do nothing and branch ahead
else
 take?some?action
fi


while :
do
	sleep 1
done
```

用于避免副作用

```shell
$ ${username=`whoami`}
-bash: li: command not found
$ : ${username=`whoami`}
$ echo $username
li
```

判断变量是否全部设置

```shell
$ : ${HOSTNAME?} ${USER?} ${MAIL?}
$ : ${HOSTNAME?} ${USER?} ${MAIL1?}
-bash: MAIL1: parameter null or not set
```

清理文件

```shell
: > xxx.log
```

### 引入外部脚本

格式
`. filename` 注意点号`.`和文件名中间有一空格
或
`source filename`

## set

脚本运行时的调试参数

在写脚本的一开始加上`set -xeuo pipefail`，一般用于调试脚本

示例

```shell
#!/bin/bash
set -x
...
```

> -x: 在执行每一个命令之前把经过变量展开之后的命令打印出来
> -e: 在遇到一个命令失败时，立即退出
> -u: 试图使用未经定义的变量，立即退出
> -o pipefail: 只要管道中的一个子命令失败，整个管道命令就失败。

## export

`export`命令用于设置环境变量。环境变量是在Shell会话期间可用的全局变量，可以被Shell及其子进程访问和使用

```shell
export VARIABLE_NAME="value"

function a_func(){
	echo 123
}
# 于将函数导出为环境变量
export -f a_func
```

## 循环

c 风格的 for 循环

```shell
for (( a=1;a<10;a++ ))
do
   echo $a;
done


# 遍历文件
for file in *.sh 
do 
echo $file;
done
```

### break 和 continue

`break n`可以跳出 n 层循环，`continue n`的用法类似

```shell
for (( a=1;a<5;a++))
do
   for (( b=1;b<5;b++))
   do
      if [ $a -gt 2 ] && [ $b -gt 3 ]
      then
         break 2
         # continue 2
      fi
   done
done
```

### done

可以在 done 处使用重定向符，管道符，类似的用法可以在 if 的结束 fi 上使用，case 的 esac 处使用

```shell
for (( a=1;a<100;a++))
do
   echo $a;
done |grep 5

for (( a=1;a<100;a++))
do
   echo $a;
done  > 1.txt


if [ -n "$1" ]
then
echo $1
fi > 1.txt

```

### 死循环

无线循环并睡眠 1 秒

```bash

#!/bin/bash
while [ 1 ]
do
      sleep 1s
done
```

## 数据库相关

查询数据库字段将其赋值给变量

```shell
db2 "connect to ${1} user ${2} using ${3}"
db2 "set schema ${4}"

db2 -x "select status,timestamp from results where id = 1" | while read status timestamp ; do
    echo $status
    echo $timestamp
done
```

## 图形化

### 菜单

select 命令只需要一条命令就可以创建出菜单，然后获取输入的答案并自动处理。
命令格式如下：

```shell
select variable in list
do
commands
done
```

list 参数是由空格分隔的文本选项列表，这些列表构成了整个菜单。select 命令会将每个列表项显示成一个带编号的选项，然后为选项显示一个由 PS3 环境变量定义的特殊提示符。

例如：

```shell
#!/bin/bash
# using select in the menu

function diskspace {
 clear
 df -k
}

function whoseon {
 clear
 who
}

function memusage {
 clear
 cat /proc/meminfo
}

PS3="Enter an option: "
select option in "Display disk space" "Display logged on users" "Display memory usage" "Exit program"
do
 case $option in
 "Exit program")
 break ;;
 "Display disk space")
 diskspace ;;
 "Display logged on users")
 memusage ;;
 "Display memory usage"）
 memusage ;;
 *)
 clear
 echo "Sorry, wrong selection";;
 esac
done
clear
```

> wsx@wsx:~/tmp$ ./smenu1
>
> 1. Display disk space 3) Display memory usage
> 2. Display logged on users 4) Exit program

## 免密

### sudo 执行不输密码

在`/etc/sudoers`最后一行新增规则，即可达到免密执行

```shell
# li 为登陆用户
li ALL=(root) NOPASSWD: /root/dhclient.sh
```

## debug

对某一个脚本开启debug模式

```shell
$ cat test.sh

echo 123123

$ sh -x test.sh

+ echo 123
123
```

也可以在脚本头申明

```shell
#!/bin/bash -x
echo 123
```

也可以指定一段范围内使用debug

```shell

echo 1
# 开启debug
set -x
echo 2

# 关闭 debug
set +x
echo 3
```

实际执行效果

```shell
1
+[1.sh::3]echo 2
2
+[1.sh::4]set +x
3
```

![[configuration#命令行debug模式提示符]]

## 调用java

```java
// 相当于标准输出
System.out.println("123123")

// 相当于标准错误
System.err.println("error")


// 相当于标准输入

public void main(String [] args){

}


// 退出码，shell中使用 $?获取

System.exit(1)

```

```shell
java -jar  xxxx.jar  123123 > 1.log
```

## 测试框架

[Bach Unit Testing Framework](https://bach.sh/)

## 常用命令

### 获取当前路径

pwd 获得的是当前 shell 的执行路径，而不是当前脚本的执行路径。

应当使用

```shell
$(dirname $(readlink -f $0 ))
```

## 错误问题

执行 sh 脚本时报错

> '\r':command not found

这是因为在 win 上的格式有问题，使用 dos2unix 命令转换一下脚本即可
