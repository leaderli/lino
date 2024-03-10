---
tags:
  - compilers/EBNF
date updated: 2024-03-10 19:08
---

## EBNF

表达作为描述计算机编程语言和形式语言的正规方式的上下文无关文法的元语法(metalanguage)符号表示法。它是基本巴科斯范式(BNF)元语法符号表示法的一种扩展。
一种用递归的思想来表述计算机语言符号集的定义规范。

| 用途   | 符号表示      | 其他表示      | 解释   |
| ---- | --------- | --------- | ---- |
| 定义   | =         |           |      |
| 串联   | ,         |           |      |
| 终止   | ;         | .         |      |
| 或    | &#124;       | / or !    |      |
| 可选   | [ ... ]   | (/ ... /) | 0或1次 |
| 重复   | { ... }   | (: ... :) | 0或多次 |
| 分组   | ( ... )   |           |      |
| 字符   | " ... "   |           |      |
| 字符   | ' ... '   |           |      |
| 注释   | (* ... *) |           |      |
| 特别序列 | ? ... ?   |           |      |
| 除外   | -         |           |      |

例如for语句

```bnf
FOR_STATEMENT ::= "(" 
(varaiable_declaretion|(expression ";")|";")
[expression]";"
[expression]
")" statement
```

> varaiable_declaretion 已经额外包含 ";" 结尾

## 参考

[EBNF_WIKI](https://en.wikipedia.org/wiki/Extended_Backus%E2%80%93Naur_form)
