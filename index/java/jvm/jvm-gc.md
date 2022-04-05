---
aliases: jvm性能排除
tags:
  - java/jvm/jvm-gc
date updated: 2022-04-05 18:02
---

我们已一个简单的代码来示范如何使用

```java
public class Fooloop {
    public static void main(String[] args) {
        for (; ; ) {

            System.out.println("args = " + args);
        }
    }
}
```

启动 Fooloop后，使用  [[top]] 命令查看进程使用情况

进程使用，如果信息过多可考虑使用 `top|grep java` ,需要清楚哪个是`cpu` 的占用信息，对于下述示例为 `9`
![[jvm性能排除_2019-12-20-00-39-21.png]]

我们可以看到 ` pid  `为 432 的进程 `cpu` 占用率很高，我们使用 `top -Hp <pid>` 来查看具体是哪个线程 `cpu` 占用率高。我们可以看到是 `433`
![[jvm性能排除_2019-12-20-00-42-52.png]]

`jstack` 命令生成的日志中，关于 `nid` 是使用 `16` 进制来表示的，而 `top` 不是。我们可以使用 `printf "%x\n" nid` 来讲 `10` 进制转换为 `16` 进制。根据此 `nid` 去 `jstack` 日志中去找到对应的信息。可使用命令 `jstack <pid> |grep -A 30 <nid>`，

我们计算出 `433` 的十六进制为 `1b1`
![[jvm性能排除_2019-12-20-00-45-36.png]]
通过日志，可以看出问题出在 `Fooloop.main(Fooloop.java:5)`

`jstack` 日志中，可以分析是否某个线程持续的输出日志，说明锁的竞争比较激烈，就有可能造成性能问题。我们也可以通过 `jps -v` 或者 `ps -ef|grep java` 等来查看具体 java 进程的 `pid` 。
