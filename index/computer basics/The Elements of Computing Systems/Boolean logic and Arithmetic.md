---
aliases: 逻辑门
tags:
  - 计算机基础/计算机系统要素/布尔逻辑与运算
date updated: 2024-06-08 11:13
---

# 布尔代数

有两个基本值 1 和 0 ，三个基本算子 `And` `Or` `Not`，分别使用 $x \bullet y$ , $x + y$ , $\bar{x}$

下面是两个布尔参数所有可能的布尔函数

![[Pasted image 20240606224224.png|300]]

# 逻辑门

门是用来实现布尔函数的物理设备，如果布尔函数 f 有 n 个输入变量， 返回 m 个二进制结果，那么用来实现这个函数 f 的门 将有 n 个输入管脚和 m 个输出管脚

![[Pasted image 20240606234914.png|400]]

门可以连起来构成具有任意复杂度的复合门电路

例如  $a \cdot b \cdot c =  (a \cdot b) \cdot c$

![[Pasted image 20240606235417.png|400]]

$Xor(a,b) = a \cdot \overline b +  \overline a \cdot b$

![[Pasted image 20240606235555.png|400]]

# 继电器

一根铁棒，用导线绕几百圈，然后接通电流，因为电磁现象，铁棒就变成了一块磁铁，就能吸其他的铁块。断开电流，铁棒失去磁性。

![[Pasted image 20240608105349.png|150]]

电磁铁是电报机的基础，在线路的一端闭合或断开开关，可以使线路的另一端的电磁铁有所行动
![[Pasted image 20240608110419.png|400]]
把接地的电池用大写`V`表示

![[Pasted image 20240608110645.png|400]]

电磁铁的右端可以连接另外一个开关

![[Pasted image 20240608110824.png|400]]

继电器示意图如下：

![[Pasted image 20240608111015.png|200]]

当输入的电流触发了电磁铁，电磁铁把一个弹性金属条吸附下来，就像闭合了开关一样，使电流可以从接口处输出

![[Pasted image 20240608111145.png|200]]

继电器可以多个串联
![[Pasted image 20240608111205.png|350]]

## 参考文档

[与非门 · 从零开始打造一台简易计算机](https://www.xiaogd.net/book/spcp/gate/nand-gate.html)
[Hardware Simulator](https://nand2tetris.github.io/web-ide/chip/)
