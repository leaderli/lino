---
tags:
  - 计算机基础/go
date created: 2022-03-24 16:22
date updated: 2023-02-05 22:31
---

# go

## 安装

[官方下载网址](https://golang.google.cn/dl/)，[仓库镜像地址](https://goproxy.cn/)

### linux

[linux安装](https://golang.org/doc/install)

```shell
rm -rf /usr/local/go && tar -C /usr/local -xzf go1.17.1.linux-amd64.tar.gz

export PATH=$PATH:/usr/local/go/bin

go version
```

## 新建工程

```shell
$ cd Hello
$ go mod init hello
go: creating new go.mod: module hello

$ cat go.mod
module hello

go 1.17

```

hello.go

```go
package main

import "fmt"

func main() {
	fmt.Println("Hello, go")
}

```

```shell
# 运行
$ go run hello.go
hello , go
# 编译
$ go build 

# 运行exe
$ ./hello.exe
hello , go
```

## 环境

```shell
$ go env 
set GO111MODULE=
set GOARCH=amd64
set GOBIN=
set GOCACHE=C:\Users\pc\AppData\Local\go-build
set GOENV=C:\Users\pc\AppData\Roaming\go\env
set GOEXE=.exe
set GOEXPERIMENT=
set GOFLAGS=
set GOHOSTARCH=amd64
set GOHOSTOS=windows
set GOINSECURE=
set GOMODCACHE=C:\Users\pc\go\pkg\mod
set GONOPROXY=
set GONOSUMDB=
set GOOS=windows
set GOPATH=C:\Users\pc\go
set GOPRIVATE=
set GOPROXY=https://proxy.golang.org,direct
set GOROOT=D:\ProgramFiles\Go
set GOSUMDB=sum.golang.org
set GOTMPDIR=
set GOTOOLDIR=D:\ProgramFiles\Go\pkg\tool\windows_amd64
set GOVCS=
set GOVERSION=go1.17.1
set GCCGO=gccgo
set AR=ar
set CC=gcc
set CXX=g++
set CGO_ENABLED=1
set GOMOD=D:\work\study\go\Hello\go.mod
set CGO_CFLAGS=-g -O2
set CGO_CPPFLAGS=
set CGO_CXXFLAGS=-g -O2
set CGO_FFLAGS=-g -O2
set CGO_LDFLAGS=-g -O2
set PKG_CONFIG=pkg-config
set GOGCCFLAGS=-m64 -mthreads -fno-caret-diagnostics -Qunused-arguments -fmessage-length=0 -fdebu
g-prefix-map=C:\Users\pc\AppData\Local\Temp\go-build2303936022=/tmp/go-build -gno-record-gcc-swit
ches

```

注意里面两个重要的环境变量`GOOS`和`GOARCH`,其中`GOOS`指的是目标操作系统，它的可用值为：

1. aix
2. android
3. darwin
4. dragonfly
5. freebsd
6. illumos
7. js
8. linux
9. netbsd
10. openbsd
11. plan9
12. solaris
13. windows

一共支持13种操作系统。`GOARCH`指的是目标处理器的架构，目前支持的有：

1. arm
2. arm64
3. 386
4. amd64
5. ppc64
6. ppc64le
7. mips
8. mipsle
9. mips64
10. mips64le
11. s390x
12. wasm

### 修改环境变量

需要用管理员权限

```shell
setx GOPATH E:\Gopath
```

报错`go: GOPATH entry is relative; must be absolute path`

```shell
$ export GOPATH="/d/resource/gopath"
```

## 打印的占位符

### General

- `%v` 以默认的方式打印变量的值
- `%T` 打印变量的类型

### Integer

- `%+d` 带符号的整型，fmt.Printf("%+d", 255)输出+255
- `%q` 打印单引号
- `%o` 不带零的八进制
- `%#o` 带零的八进制
- `%x` 小写的十六进制
- `%X` 大写的十六进制
- `%#x` 带0x的十六进制
- `%U` 打印Unicode字符
- `%#U` 打印带字符的Unicode
- `%b` 打印整型的二进制
- `%c` 相应的unicode字符串

### Integer width

- `%5d` 表示该整型最大长度是5，下面这段代码

  ```go
  fmt.Printf("|%5d|", 1)
  fmt.Printf("|%5d|", 1234567)

  //输出结果如下：
  |    1|
  |1234567|
  ```

- `%-5d`则相反，打印结果会自动左对齐

- `%05d`会在数字前面补零。

### Float

- `%f`(=%.6f) 6位小数点
- `%e` (=%.6e) 6位小数点（科学计数法）
- `%g` 用最少的数字来表示
- `%.3g` 最多3位数字来表示
- `%.3f` 最多3位小数来表示

### String

- `%s` 正常输出字符串
- `%q` 字符串带双引号，字符串中的引号带转义符
- `%#q` 字符串带反引号，如果字符串内有反引号，就用双引号代替
- `%x`将字符串转换为小写的16进制格式
- `%X` 将字符串转换为大写的16进制格式
- `% x` 带空格的16进制格式

### String Width (以5做例子）

- `%5s` 最小宽度为5
- `%-5s` 最小宽度为5（左对齐）
- `%.5s` 最大宽度为5
- `%5.7s` 最小宽度为5，最大宽度为7
- `%-5.7s` 最小宽度为5，最大宽度为7（左对齐）
- `%5.3s` 如果宽度大于3，则截断
- `%05s` 如果宽度小于5，就会在字符串前面补零

### Struct

- `%v`正常打印。比如：`{sam {12345 67890}}`
- `%+v`带字段名称。比如：`{name:sam phone:{mobile:12345 office:67890}`
- `%#v` 用Go的语法打印。比如`main.People{name:”sam”, phone:main.Phone{mobile:”12345”, office:”67890”}}`

### Boolean

- `%t` 打印true或false

### Pointer

- `%p` 带0x的指针
- `%#p` 不带0x的指针

## 指针

[Go语言指针详解](http://c.biancheng.net/view/21.html)

每个变量在运行时都拥有一个地址，这个地址代表在内存中位置，指针存储的就是该变量的内存地址。指针作为一个变量，它本身也有内存地址，其本身也可以被另外一个指针来访问。

对于下面的 `swap` 函数，`a`,`b` 是指针变量，类型为`*ptr`，其交换的是存储的内存地址，即 `&a`,`&b`的指针变量（类型为 `**ptr` ）的值。

```go
package main  
  
import "fmt"  
  
func main() {  
   a, b := 1, 2  
  
   ptrA := &a  
   ptrB := &b  
   fmt.Println(&ptrA, &ptrB, ptrA, ptrB, a, b)  
   swap(ptrA, ptrB)  
   fmt.Println(&ptrA, &ptrB, ptrA, ptrB, a, b)  
}  
  
func swap(a, b *int) {  
  
   fmt.Println(&a, &b, a, b, *a, *b)  
   b, a = a, b  
   fmt.Println(&a, &b, a, b, *a, *b)  
}
```

```log
0xc00008e010 0xc00008e018 0xc000094000 0xc000094008 1 2
0xc00008e028 0xc00008e030 0xc000094000 0xc000094008 1 2
0xc00008e028 0xc00008e030 0xc000094008 0xc000094000 2 1
0xc00008e010 0xc00008e018 0xc000094000 0xc000094008 1 2
```

## 常用示例

### 随机sleep一段时间

```go
rand.Seed(time.Now().UnixNano())  
r := rand.Intn(60)
d= time.Duration(i) * time.Second  
time.Sleep(d)
```

### 根据类型switch

```go
package main

import (
    "fmt"
)

func main() {
    var a int
    a = 10
    getType(a)
}

func getType(a interface{}) {
    switch a.(type) {
    case int:
        fmt.Println("the type of a is int")
    case string:
        fmt.Println("the type of a is string")
    case float64:
        fmt.Println("the type of a is float")
    default:
        fmt.Println("unknown type")
    }
}
```

### 类型断言

类型断言的基本格式如下：

```go
1.  t := i.(T)
```

其中，i 代表接口变量，T 代表转换的目标类型，t 代表转换后的变量。

如果 i 没有完全实现 T 接口的方法，这个语句将会触发宕机。触发宕机不是很友好，因此上面的语句还有一种写法：

```go
1.  t,ok := i.(T)
```

这种写法下，如果发生接口未实现时，将会把 ok 置为 false，t 置为 T 类型的 0 值。正常实现时，ok 为 true。这里 ok 可以被认为是：i 接口是否实现 T 类型的结果。

### 格式化时间

Go语言的诞生时间 2006 年 1 月 2 号 15 点 04 分 05 秒，以此作为格式

```go
now := time.Now()
// 格式化的模板为Go的出生时间2006年1月2号15点04分 Mon Jan
// 24小时制
fmt.Println(now.Format("2006-01-02 15:04:05.000 Mon Jan"))
// 12小时制
fmt.Println(now.Format("2006-01-02 03:04:05.000 PM Mon Jan"))
```

### 单向通道

仅用于限制使用

```go
ch := make(chan int)
// 声明一个只能写入数据的通道类型, 并赋值为ch
var chSendOnly chan<- int = ch
//声明一个只能读取数据的通道类型, 并赋值为ch
var chRecvOnly <-chan int = ch


// 关闭通道
close(ch)

// 判断通道是否关闭
x, ok := <-ch
```



### select 超时

```go
package main

import (
    "fmt"
    "time"
)

func main() {
    ch := make(chan int)
    quit := make(chan bool)

    //新开一个协程
    go func() {
        for {
            select {
            case num := <-ch:
                fmt.Println("num = ", num)
            case <-time.After(3 * time.Second):
                fmt.Println("超时")
                quit <- true
            }
        }

    }() //别忘了()

    for i := 0; i < 5; i++ {
        ch <- i
        time.Sleep(time.Second)
    }

    <-quit
    fmt.Println("程序结束")
}
```
## 参考文档

[Go语言入门教程，Golang入门教程（非常详细）](http://c.biancheng.net/golang/)

[Go语言常用内置包简介](http://c.biancheng.net/view/4306.html)

[Go语言并发简述（并发的优势）](http://c.biancheng.net/view/4356.html)

[Go语言channel超时机制](http://c.biancheng.net/view/4361.html)
