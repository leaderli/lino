---
aliases: 逻辑门
tags:
  - 计算机基础/计算机系统要素/布尔逻辑与运算
date updated: 2024-06-06 23:52
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


[Hardware Simulator](https://nand2tetris.github.io/web-ide/chip/)