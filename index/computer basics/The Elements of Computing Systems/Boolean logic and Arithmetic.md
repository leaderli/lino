---
aliases: 逻辑门
tags:
  - 计算机基础/计算机系统要素/布尔逻辑与运算
date updated: 2024-06-08 23:10
---

# 布尔代数

有两个基本值 1 和 0 ，三个基本算子 `And` `Or` `Not`，分别使用 $x \bullet y$ , $x + y$ , $\bar{x}$

下面是两个布尔参数所有可能的布尔函数

![[Pasted image 20240606224224.png|300]]

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

继电器可以多个串联形成连接继电器
![[Pasted image 20240608111205.png|350]]

# 逻辑门

门是用来实现布尔函数的物理设备，如果布尔函数 f 有 n 个输入变量， 返回 m 个二进制结果，那么用来实现这个函数 f 的门 将有 n 个输入管脚和 m 个输出管脚

$Xor(a,b) = a \cdot \overline b +  \overline a \cdot b$

![[Pasted image 20240606235555.png|400]]

## 门的电路示意图

### 连接继电器

[[#继电器]]的输出与开关的状态一致

![[Pasted image 20240608120858.png|200]]

连接[[#继电器]]是建立逻辑门的关键
![[Pasted image 20240608121140.png|200]]

当输入时，第一个[[#继电器]]被触发，提供电压给第二个继电器，于是第二个[[#继电器]]也被触发，使灯泡发光
![[Pasted image 20240608121211.png|200]]

### 非门

当有输入开关断开的时候，灯泡发光。[[#继电器]]的输出与开关状态正好相反
![[Pasted image 20240608121525.png|200]]
![[Pasted image 20240608121600.png|200]]

![[Pasted image 20240608131910.png|200]]

### 与门

![[Pasted image 20240608131440.png|200]]

![[Pasted image 20240608131732.png|300]]

### 或门

![[Pasted image 20240608131812.png|300]]

![[Pasted image 20240608131843.png|300]]

### 或非门

![[Pasted image 20240608132402.png|300]]

![[Pasted image 20240608132422.png|200]]

### 与非门

![[Pasted image 20240608132521.png|300]]

![[Pasted image 20240608132558.png|200]]

## 复合门

门可以连起来构成具有任意复杂度的复合门电路

例如  $a \cdot b \cdot c =  (a \cdot b) \cdot c$

![[Pasted image 20240606235417.png|400]]

# 仿真软件


[[logicsim.html| 逻辑电路在线仿真工具]]

# 参考文档

[与非门 · 从零开始打造一台简易计算机](https://www.xiaogd.net/book/spcp/gate/nand-gate.html)
[Hardware Simulator](https://nand2tetris.github.io/web-ide/chip/)
[VP Online - Online Drawing Tool](https://online.visual-paradigm.com/app/diagrams/#diagram:proj=0&type=LogicDiagram&width=11&height=8.5&unit=inch)
