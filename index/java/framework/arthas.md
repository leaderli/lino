---
date created: 2022-03-22 17:22
aliases: Java诊断工具
tags:
  - java/框架/arthas
date updated: 2023-12-14 22:33
---

---

Java诊断工具

[💾  全量包下载地址](https://github.com/alibaba/arthas/releases)

## 快速入门

测试程序

```shell
curl -O https://arthas.aliyun.com/math-game.jar
java -jar math-game.jar
```

```shell
curl -O https://arthas.aliyun.com/arthas-boot.jar
java -jar arthas-boot.jar
```

> `* [1]: 2262 math-game.jar`

选择1，开始监听测试程序的进程

```shell
wiki       https://arthas.aliyun.com/doc                                        
tutorials  https://arthas.aliyun.com/doc/arthas-tutorials.html                  
version    3.5.4                                                                
main_class                                                                      
pid        2262                                                                 
time       2021-12-19 23:59:58                                                  

[arthas@2262]$ 
```

```shell
# 显示java进程的详细信息，类似ps -ef
java -jar arthas-boot.jar -v
```

类似cli的程序，可输入命令进行操作，例如 `dashboard` ，`thread` 等

## dashboard

展示进程的信息，`ctrl+c`中断执行

## thread

查看所有进程
`thread 1` 查看进程ID为1的进程

```shell
# 1 后面需要有空格
[arthas@2262]$ thread 1 |grep main
"main" Id=1 TIMED_WAITING
    at demo.MathGame.main(MathGame.java:17)
```

```shell
# 支持一键展示当前最忙的前 N 个线程并打印堆栈
$ thread -n 3 

#  找出当前阻塞其他线程的线程
$ thread -b 


# 统计最近 1000ms 内的线程 CPU 时间
$ thread -i 1000


# 查看id为1的线程的堆栈
$ thread 1
```

## jad

反编译字节码，根据类的全名

```java
[arthas@2262]$ jad demo.MathGame 

ClassLoader:
+-sun.misc.Launcher$AppClassLoader@70dea4e                                                                                                                                                                                                                      
  +-sun.misc.Launcher$ExtClassLoader@4c585cd7
 
Location:
/home/li/study/arthas/math-game.jar                                                                                                                                                                                                                             
 
/*
 * Decompiled with CFR 0_132.
 */
package demo;
 
import java.io.PrintStream;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.Random;
import java.util.concurrent.TimeUnit;
 
public class MathGame {
    private static Random random = new Random();
    private int illegalArgumentCount = 0;
 
    public static void main(String[] args) throws InterruptedException {
        MathGame game = new MathGame();
        do {
            game.run();
            TimeUnit.SECONDS.sleep(1L);
        } while (true);
    }
 
    public void run() throws InterruptedException {
        try {
            int number = random.nextInt();
            List<Integer> primeFactors = this.primeFactors(number);
            MathGame.print(number, primeFactors);
        }
        catch (Exception e) {
            System.out.println(String.format("illegalArgumentCount:%3d, ", this.illegalArgumentCount) + e.getMessage());
        }
    }
 
    public static void print(int number, List<Integer> primeFactors) {
        StringBuffer sb = new StringBuffer("" + number + "=");
        Iterator<Integer> iterator = primeFactors.iterator();
        while (iterator.hasNext()) {
            int factor = iterator.next();
            sb.append(factor).append('*');
        }
        if (sb.charAt(sb.length() - 1) == '*') {
            sb.deleteCharAt(sb.length() - 1);
        }
        System.out.println(sb);
    }
 
    public List<Integer> primeFactors(int number) {
        if (number < 2) {
            ++this.illegalArgumentCount;
            throw new IllegalArgumentException("number is: " + number + ", need >= 2");
        }
        ArrayList<Integer> result = new ArrayList<Integer>();
        int i = 2;
        while (i <= number) {
            if (number % i == 0) {
                result.add(i);
                number /= i;
                i = 2;
                continue;
            }
            ++i;
        }
        return result;
    }
}
 
Affect(row-cnt:1) cost in 970 ms.
```

## watch

监听`demo.MathGame#primeFactors`函数的返回值：

```shell
[arthas@2262]$ watch demo.MathGame primeFactors returnObj
Press Q or Ctrl+C to abort.
Affect(class count: 1 , method count: 1) cost in 176 ms, listenerId: 1
method=demo.MathGame.primeFactors location=AtExceptionExit
ts=2021-12-20 00:13:17; [cost=0.71443ms] result=null
method=demo.MathGame.primeFactors location=AtExit
ts=2021-12-20 00:13:18; [cost=0.14941ms] result=@ArrayList[
    @Integer[2],
    @Integer[2],
    @Integer[3],
    @Integer[11],
    @Integer[41],
]
method=demo.MathGame.primeFactors location=AtExit
ts=2021-12-20 00:13:19; [cost=3.648804ms] result=@ArrayList[
    @Integer[2],
    @Integer[44879],
]
method=demo.MathGame.primeFactors location=AtExit
ts=2021-12-20 00:13:20; [cost=0.243086ms] result=@ArrayList[
    @Integer[2],
    @Integer[5],
    @Integer[13],
    @Integer[1117],
]
```

查看某个方法被调用的情况

```shell
$ watch org.apache.commons.io.input.Tailer getRun

# -m 1000 指定最大匹配数量，默认50
$ watch org.apache.* * -m 1000
```

## trace

查看某个方法执行细节

```shell
$ trace org.apache.commons.io.input.Tailer getRun

# -n 1 匹配一次就退出
$ trace org.apache.commons.io.input.Tailer getRun -n 1

# -m 1000 指定最大匹配数量，默认50
$ trace org.apache.* * -m 1000

# 显示更多信息
$ trace org.apache.commons.io.input.Tailer getRun  -v
```

## jvm

查看当前 JVM 的信息

## sysprop

查看和修改JVM的系统属性

## sysenv

查看JVM的环境变量

## profiler

持生成应用热点的火焰图。本质上是通过不断的采样，然后把收集到的采样结果生成火焰图。

```shell
# 采集的事件，默认采集cpu
$ profiler list 
# 采集内存回收事件
$ profiler start --event alloc
# 指定生成目录
$ profiler start --file  /tmp/profiler.html
# 开始采集
$ profiler start
# 采集状态
$ profiler status
# 结束采集
$ profiler stop

# 应用比较复杂，生成的内容很多，想只关注部分数据，可以通过 include/exclude 来过滤。 include/exclude 都支持设置多个值 ，但是需要配置在命令行的最后。
profiler start --include 'java/*' --include 'demo/*' --exclude '*Unsafe.park*'


# 指定运行时间
profiler start --duration 300

```

## monitor

对匹配的类的方法的调用进行监控

```shell
$ monitor -c 5 demo.MathGame primeFactors
# -m 指定匹配的类的数量，默认是50，超过则不执行
$ monitor -c 5 -m 100 demo.*  *
```

## sc

查看JVM已加载的类信息

模糊搜索

```shell
[arthas@2262]$ sc demo.**
demo.MathGame
Affect(row-cnt:1) cost in 55 ms.
```

打印类的详细信息

```shell
[arthas@2262]$ sc -d demo.MathGame
class-info        demo.MathGame
code-source       /private/tmp/math-game.jar
name              demo.MathGame
isInterface       false
isAnnotation      false
isEnum            false
isAnonymousClass  false
isArray           false
isLocalClass      false
isMemberClass     false
isPrimitive       false
isSynthetic       false
simple-name       MathGame
modifier          public
annotation
interfaces
super-class       +-java.lang.Object
class-loader      +-sun.misc.Launcher$AppClassLoader@3d4eac69
                    +-sun.misc.Launcher$ExtClassLoader@66350f69
classLoaderHash   3d4eac69
 
Affect(row-cnt:1) cost in 875 ms.
```

打印出类的Field信息

```shell
[arthas@2262]$ sc -d -f demo.MathGame
class-info        demo.MathGame
code-source       /private/tmp/math-game.jar
name              demo.MathGame
isInterface       false
isAnnotation      false
isEnum            false
isAnonymousClass  false
isArray           false
isLocalClass      false
isMemberClass     false
isPrimitive       false
isSynthetic       false
simple-name       MathGame
modifier          public
annotation
interfaces
super-class       +-java.lang.Object
class-loader      +-sun.misc.Launcher$AppClassLoader@3d4eac69
                    +-sun.misc.Launcher$ExtClassLoader@66350f69
classLoaderHash   3d4eac69
fields            modifierprivate,static
                  type    java.util.Random
                  name    random
                  value   java.util.Random@522b4
                          08a
 
                  modifierprivate
                  type    int
                  name    illegalArgumentCount
```

## classloader

查看类加载器

[classloader — Arthas 3.5.5 文档](https://arthas.aliyun.com/doc/classloader.html)

| 参数名称                  | 参数说明                              |
| --------------------- | --------------------------------- |
| `[l]`                 | 按类加载实例进行统计                        |
| `[t]`                 | 打印所有ClassLoader的继承树               |
| `[a]`                 | 列出所有ClassLoader加载的类，请谨慎使用         |
| `[c:]`                | ClassLoader的hashcode              |
| `[classLoaderClass:]` | 指定执行表达式的 ClassLoader 的 class name |
| `[c: r:]`             | 用ClassLoader去查找resource           |
| `[c: load:]`          | 用ClassLoader去加载指定的类               |

## vmtool

- `-c` 表示classloader
- `-a` 表示动作

查看某个类实例，无 --limit 参数默认10个

```shell
vmtool -c 3e2e18f2 -a getInstances --className *EncryptClass
vmtool -c 3e2e18f2 -a getInstances --className *EncryptClass --express 'instances.length'
vmtool -c 3e2e18f2 -a getInstances --className *EncryptClass --express 'instances[0]'

```

实例方法调用

```shell
vmtool -c 3e2e18f2 -a getInstances --className *EncryptClass --express '#val=instances[0],#val.getNote()'
vmtool -c 3e2e18f2 -a getInstances --className *EncryptClass --express '#val=instances[0],#val.setNote("modify by instance"+#val.getNote())'

```

实例属性操作
获取或者修改第一个实例 note 属性

```shell
vmtool -c 3e2e18f2 -a getInstances --className *EncryptClass --express '#val=instances[1].note'
vmtool -c 3e2e18f2 -a getInstances --className *EncryptClass --express '#val=instances[1],#val.note="modify by instance"+#val.note'

```

## ognl

通过ognl表达式，直接执行java表达式

[ 📒 OGNL - Apache Commons OGNL - Language Guide](https://commons.apache.org/proper/commons-ognl/language-guide.html)

调用静态函数

```shell
[arthas@2262]$ ognl '@java.lang.System@out.println("hello")'
null
# 同时我们可以观察到，测试程序执行处打印出了hello
```

获取静态类的静态字段：

```shell
[arthas@2262]$ ognl  '@demo.MathGame@random'
@Random[
    serialVersionUID=@Long[3905348978240129619],
    seed=@AtomicLong[188638839553977],
    multiplier=@Long[25214903917],
    addend=@Long[11],
    mask=@Long[281474976710655],
    DOUBLE_UNIT=@Double[1.1102230246251565E-16],
    BadBound=@String[bound must be positive],
    BadRange=@String[bound must be greater than origin],
    BadSize=@String[size must be non-negative],
    seedUniquifier=@AtomicLong[-3282039941672302964],
    nextNextGaussian=@Double[0.0],
    haveNextNextGaussian=@Boolean[false],
    serialPersistentFields=@ObjectStreamField[][isEmpty=false;size=3],
    unsafe=@Unsafe[sun.misc.Unsafe@110940e0],
    seedOffset=@Long[24],
]
```

通过 [[#sc|sc -d ]] 命令我们我们找出指定 Class 的 `classLoaderHash`，从而调用实例方法或变量，或者如果Class仅有唯一的实例，则可以直接使用类名来调用

```shell
ognl -c 3d4eac69  '@demo.MathGame@illegalArgumentCount'
```

## stop

关闭 Arthas 服务端，所有 Arthas 客户端全部退出。

## 参考文档

[📒 官方文档](https://arthas.aliyun.com/doc/)

[命令列表 — Arthas 3.5.5 文档](https://arthas.aliyun.com/doc/commands.html)

[进阶使用 — Arthas 3.5.5 文档](https://arthas.aliyun.com/doc/advanced-use.html)
