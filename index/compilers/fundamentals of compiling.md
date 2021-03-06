---
aliases: 编译原理概述
tags:
- compilers/编译原理概述
---

[编译原理（哈工大）_哔哩哔哩](https://www.bilibili.com/video/BV1zW411t7YE?from=search&seid=17662228773593089278)

[[编译原理课件.pdf]]


编译原理的编译过程有着严格的数学证明，类似[[automation|自动机理论]]，我们首先需要了解编译相关的各种概念

# 编译器的结构

![[Pasted image 20211006003506.png|500]]


## 词法分析/扫描（Scanning）

词法分析的主要任务,从左向右逐行扫描程序的字符，识别出各个单词，确定单词的类型，将识别出的单词转为为统一的词法单元（token）形式

`token`:<种别码，属性值>

- 关键字   ， `if` `else` `then` `while` ，  一词一码          
-  标识符   ， `变量名` `数组名` `方法名`     ，  多词一码           ^df98e9
-  常量    ，  `整型` `浮点型`  `字符型` `布尔型`  ，一型一码           
-  运算符  ，  `+` `-` `<` `=` `&` `~`      ，一词一码或一型一码
-  界限符 ，   `(` `)` `{` `}`  `;`           ， 一词一码           

^2b904d

例如：

```java
while(value!=100){num++;}
```

转换为token可得到如下
```shell
while     < WHILE	,   - 	>
(		  < SLP		,   - 	>
value     < IDN		, value > 	
!=		  < NE		,   -   >
100		  < CONST	,  100  >
)		  < SRP		,   -   >
{		  < LP      ,   -   >
num		  < IDN     ,  num  >
++		  < INC     ,   -   >
;         < SEMI    ,   -   >
}         < RP      ,   -   >
```

扫描的具体实现参考[[grammar|文法]]，[[automation|自动机理论]]

### 词法分析阶段的错误处理


**词法分析阶段可检测的错误类型**

1. 单词拼写错误，例如 `int i = 0x3G`
2. 非法字符,例`~@`

**词法错误检测**

如果当前状态与当前输入符号在转换表中对应项中的信息为空，而当前状态又不是终止状态，则调用错误处理程序。 

**错误处理**

查找已扫描字符中最后一个对应与某状态的字符，
- 如果`找到`，则将改字符与前面的字符识别为一个单词，然后将输入指针退回到改字符，扫描器重新回到初始状态，继续识别下一个单词。
- 如果`没找到`，则确定出错。
## 语法分析（parsing）

### 概述
语法分析器（parser）从词法分析器输出的token序列中识别出各类短语，并构建语法[[grammar#上下文无关文法分析树|分析树]]


例1：

`position = initial + rate * 60;`

token序列如下

`<id,position> <=> <id,initial> <+> <id,rate> <*> <num,60> <;>`

![[Pasted image 20211006152147.png|300]]

例2：
变量声明语句的[[grammar#上下文无关文法分析树|分析树]]

其[[grammar#文法|文法]]为
- $D$ 表示声明语句
- $T$ 表示 关键字
- $IDS$ 表示变量名

 
 $\langle D\rangle \rightarrow \langle T\rangle \langle IDS \rangle;$
 $\langle T\rangle  \rightarrow int|char|bool$
 $\langle IDS\rangle \rightarrow  \langle IDS\rangle |\langle IDS\rangle , \langle IDS\rangle$

对于一个赋值语句`int a,b,c;`来说，其[[grammar#上下文无关文法分析树|分析树]]如下
![[Pasted image 20211006152744.png|200]]

### 最左[[grammar#推导|推导]]

总是选择每个[[grammar#句型|句型]]的最左[[grammar#非终结符|非终结符]]进行替换的分析
![[Pasted image 20211031151008.png|300]]

### 自顶向下的分析
从[[grammar#上下文无关文法分析树|分析树]]的顶部（根节点）向底部（叶节点）方向构造[[grammar#上下文无关文法分析树|分析树]]，可以看成是从文法开始符号S [[grammar#推导|推导]] 出词串  $\omega$ 的过程

例：
![[Pasted image 20211031144958.png|400]]

每一步推导中，都需要做两个选择
- 替换当前句型中的哪个[[grammar#非终结符|非终结符]]
- 用该[[grammar#非终结符|非终结符]]的哪个[[grammar#候选式|候选式]]


一般情况下自顶向下的语法分析采用[[#最左 grammar 推导 推导|最左推导]]方式 
- 总是选择每个[[grammar#句型|句型]]的最左[[grammar#非终结符|非终结符]]进行替换
- 根据输入流中的下一个[[grammar#终结符|终结符]]，选择最左[[grammar#非终结符|非终结符]]的一个[[grammar#候选式|候选式]]

例如：
![[Pasted image 20211031155147.png|500]]
根据每个输入的 [[grammar#终结符|终结符]] ，推导过程如下
1.  $E \to TE' \Rightarrow E\to FE' \Rightarrow id E'$
2.  $\Rightarrow id+TE'$    
3.  $\Rightarrow id+FT'\Rightarrow  id+idT'$ 
4. $\Rightarrow id+id*FT'$
5. $\Rightarrow id+id*idT'\Rightarrow id+id*id$

### 递归下降分析
自顶向下语法分析的通用形式，由一组过程组成，每个过程对应一个非终结符。由[[grammar#开始符号（start symbol）|开始符号S]]对应的过程开始，其中递归调用[[grammar#文法|文法]]中其他[[grammar#非终结符|非终结符]]对应的过程。如果S对应的过程恰好扫描了整个输入串，则完成语法分析

左递归[[grammar#文法|文法]]可能使递归下降分析器陷入无限循环

![[Pasted image 20211031182005.png|300]]

可以通过引入一些[[grammar#非终结符|非终结符]]和 $\varepsilon$  [[grammar#产生式|产生式]]来消除左递归

![[Pasted image 20211031182205.png|400]]

消除间接左递归
![[Pasted image 20211031184002.png|400]]

通过提取左公因子来解决[[grammar#回溯|回溯]]问题

![[Pasted image 20211031184039.png|400]]

提取左公因子的算法

对于每个[[grammar#非终结符|非终结符]]A，找出它的两个或多个选项之间的最长公共前缀 $\alpha$ ，如果 $\alpha \ne\varepsilon$ ，即存在一个非平台的公共前缀，那么将所有 $A-$ 产生式

![[Pasted image 20211031184559.png|400]]

其中，$\gamma_i$ 表示所有不以 $\alpha$ 开头的产生式体，$A'$ 是一个新的[[grammar#非终结符|非终结符]]，不断应用这个转换，知道每个[[grammar#非终结符|非终结符]]的任意两个产生式都没有公共前缀为止


[[LL(1)]]
## 语义分析

###  收集[[#^df98e9|标识符]]的属性信息
- 种属（Kind）
- 类型（Type）
- 存储位置、长度
- 值
- 作用域
- 参数和返回值信息
	- 参数个数
	- 参数类型
	- 参数传递方式
	- 返回值类型

收集[[#^df98e9|标识符]]的属性信息会被存储在符号表
![[Pasted image 20211006161206.png]]

### 语义检查
- 变量或方法未经声明就使用
- 变量或方法名重复声明
- 运算分量类型不匹配
- 操作符与操作数之间的类型不匹配
	- 数组下标不是整数
	- 对非数组声明使用数组访问操作符
	- 对非方法名使用过程调用操作符
	- 过程调用的参数类型或数目不匹配
	- 函数返回类型有误
  
## 中间代码生成器

### 常用的中间表示形式
#### 三地址码（Three-address Code)
三地址码由类似于汇编语言的指令序列组成，每个指令最多有三个操作数（operand），可以四元式（Quadruples），即`(op,y,z,x)`来表示。
常见的三地址指令的四元式表示：

![[Pasted image 20211006162835.png|300]]

三地址指令序列可以确定一个完整运算的顺序

例如：
![[Pasted image 20211006162940.png]]

#### 语法结构树/语法树（Syntax Trees）
可参考[[AST]]

## 目标代码生成器

目标代码生成以源程序的中间表示形式作为输入，并把他映射到目标语言