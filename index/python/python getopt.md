---
tags:
  - python/getopt
date updated: 2022-04-14 11:59
---


C 风格的命令行选项解析器，此模块可以用来协助脚本解析 `sys.argv` 中的命令行参数。

`getopt.getopt(args, shortopts, longopts=[])`

- `args`  为需要解析的参数列表
- `shortopts` 短参数，即以 `-` 开头的参数，如果短参数需要额外参数，需要通过添加 `:` 声明。
	```python
	>>> getopt.getopt(['-a','-b','123','-b456'],'ab:')
	([('-a', ''), ('-b', '123'), ('-b', '456')], [])
	```
- `longopts` 长参数，即以`--`开头的参数，如果长参数需要额外参数，需要通过 `=` 声明
	```python
	>>> getopt.getopt(['--name=123','--name','456','--has','789'],'',['name=','has'])
	([('--name', '123'), ('--name', '456'), ('--has', '')], ['789'])

	```
  长参数列表在实际使用的使用，可以仅使用前缀部分，只要能定位唯一的长参数选项
 
	```python
	>>> getopt.getopt(['--na=123'],'',['name='])
	([('--name', '123')], [])
	```



返回值由两个元素组成：一个是 `(option,value)` 列表， 一个是除了列表之外剩余的所有参数列表。

## 参考文档
[官方文档](https://docs.python.org/zh-cn/3/library/getopt.html)
