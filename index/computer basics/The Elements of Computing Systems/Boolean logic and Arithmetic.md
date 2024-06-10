---
aliases: 逻辑门
tags:
  - 计算机基础/计算机系统要素/布尔逻辑与运算
date updated: 2024-06-10 16:16
---

# 布尔代数

参与布尔运算的变量交逻辑变量，用字母A，B，... 表示，每个变量的取值非0即1，0,1不表示数的大小，而是表示两种不同的逻辑状态。

基本运算:

1. 与   $x * y$ , 当 x=y=1时为1，其他情况下为0
2. 或   $x + y$，当x=y=0时为0，其他情况下未1
3. 非   $\overline x$，当x=1是为0，其他情况为1

|                                                  |                                                  |           |
| ------------------------------------------------ | ------------------------------------------------ | --------- |
| $a * ( b * c ) = (a * b ) * c$                   | $a + (b+c) = (a + b) + c$                        | 结合律       |
| $a*b = b*a$                                      | $a+b = b+a$                                      | 交换律       |
| $a+(a*b)=a$                                      | $a*(a+b) = a$                                    | 吸收律       |
| $a+(b*c) = (a+b)*(a+c)$                          | $a*(b+c) = (a*b)+(a*c)$                          | 分配律       |
| $a+\overline a = 1$                              | $a* \overline a = 0$                             | 互补律       |
| $a + a = a$                                      | $a * a = a$                                      | 幂等律       |
| $a+0 =a$                                         | $a*1=a$                                          | 有界律       |
| $a+1 =1$                                         | $a*0=0$                                          | 有界律       |
| $\overline {a+b} = \overline{a} * \overline {b}$ | $\overline {a*b} = \overline{a} + \overline {b}$ | 对偶律,德摩根定律 |
| $\overline {\overline x} =  x$                   |                                                  | 对合律       |

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

## 使用与非门构建其他门

- 非门 $\overline {x * y} \to \overline {x * x} = \overline {x}$
- 与门$\overline {x * y} \to \overline{\overline {x * y}} =  x * y$
- 或门$\overline {x * y} = \overline x + \overline y \to \overline{\overline x}  + \overline{\overline y}  = x + y$

根据公式电路图如下

![[Pasted image 20240610160608.png|400]]

# 仿真软件

[[logicsim.html| 逻辑电路在线仿真工具]]

# 参考文档

[与非门 · 从零开始打造一台简易计算机](https://www.xiaogd.net/book/spcp/gate/nand-gate.html)
[Hardware Simulator](https://nand2tetris.github.io/web-ide/chip/)
[VP Online - Online Drawing Tool](https://online.visual-paradigm.com/app/diagrams/#diagram:proj=0&type=LogicDiagram&width=11&height=8.5&unit=inch)
