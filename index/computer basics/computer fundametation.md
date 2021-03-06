---
aliases: 计算机基础知识
tags: 
- 计算机基础/计算机基础知识
---

## 位，字节，字

- **_位_**
  在计算机中,数据只用 0 和 1 两种表现形式,(这里只表示一个数据点,不是数字),一个 0 或者 1 占一个“位”。
- **_字节_**
  而系统中规定 8 个“位”为一个“字节”.
- **_字长_**
  而一个字的位数，是由机器字长决定的【系统硬件（总线、cpu 命令字位数等）】
  1. 在 16 位的系统中（比如 8086 微机） 1 字 （word）= 2 字节（byte）= 16（bit）
  2. 在 32 位的系统中（比如 win32） 1 字（word）= 4 字节（byte）=32（bit）
  3. 在 64 位的系统中（比如 win64）1 字（word）= 8 字节（byte）=64（bit）

## 运算减法(补码反码)

对于十二刻时的时钟来说，它的一个周期为 12 个小时，我们称之为模。`9-3`即从 9 点向后拨 3 个小时，那么就是 6 点，同时我们也可以向前拨 9 个小时，那么也是 6 点。也就是说减法可以通过与模来变换成加法。对于时钟来说模`R = 12`,`-3`与模相差`9`。那么`-3`等同于`+9`。这个可以通过如下公式来证明

$$
   a-b=a-b+R=a+(R-b)
$$

对于一个`n`位的二进制来说，它的模 R = $2^n$，它的减法可以用以下公式来换算

$$
   a-b=a-b+2^n=a+(2^n-b)=a+(2^n-1+1-b)=a+((2^n-1)-b)+1
$$

$2^n-1$用二进制表达就是 n 位 1,$(2^n-1) - b$其实就是计算`-b`的补码所以上述表示式最终可以表现为$a+\overline{b}+1$，这个就是俗称的反码

## 与非门实现真值表达式

![大学计算机笔记_2020-04-18-17-50-17.png](大学计算机笔记_2020-04-18-17-50-17.png)
![大学计算机笔记_2020-04-18-17-51-41.png](大学计算机笔记_2020-04-18-17-51-41.png)

## 中文ASCII 码

`html`中以 `&#x` 开头的特殊字符
