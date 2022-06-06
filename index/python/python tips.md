---
tags:
  - python/tips
date updated: 2022-05-27 17:03
---

## 注释

### 获取方法文档注释

```python
def my_func():
	'''
		the doc 
	'''
	pass


my_func.__doc__
```

### 获取整个脚本的注释

```python

'''
test doc
'''

print(__doc__)

```

## arr

定长数组

```python
[0, ] * len

# tuple
(0,) * 10
```

扩展数组

```python
[0,1] + [3,4]
```

筛选数组

```python
[x for x in range(10) if x % 2 == 0 ]

list(filter(lambda x: x % 2 == 0, range(10)))
[0, 2, 4, 6, 8]

```
## datetime

### strftime
当天日期

```python
from datetime import  datetime  
  
  
  print(datetime.strftime(datetime.now(),'%Y-%m-%d'))
```


| 指令 | 解释     |
| ---- | -------- |
| `%Y` | 四位年份 |
| `%m` | 两位月份 |
| `%d` | 两位日   |
|     `%H` |    两位小时      |
| `%M` | 两位分钟 |
| `%S` | 两位秒         |


[datetime — Basic date and time types — Python 3.10.4 documentation](https://docs.python.org/3/library/datetime.html#strftime-strptime-behavior)

## dict

### 安全的取值

```python
d = {}  
# 对于不存在的key这里会报错
d['a']  
# 对于不存在的key这里返回None
d.get('a')
```

### 判断key是否存在

```python
d = {'b': 1}  
  
print('a' in d)  # False
print('b' in d)  # true
```

### 合并两个dict

3.9.0版本之后

```python
z = x | y
```

3.5版本之后

```python
z = {**x, **y}
```

python2或者3.4版本及3.4版本之前

```python
def merge_two_dicts(x, y):
    z = x.copy()   
    z.update(y)   
    return z
```

## enumerate

函数用于将一个可遍历的数据对象(如列表、元组或字符串)组合为一个索引序列，同时列出数据和数据下标

```python
enumerate(sequence, [start=0])

seasons = ['Spring', 'Summer', 'Fall', 'Winter']
list(enumerate(seasons))
#[(0, 'Spring'), (1, 'Summer'), (2, 'Fall'), (3, 'Winter')]
```

## list

很多常用函数函数的不是直接的数组，比如 `map` , `filter` 等，需要再使用 `list` 直接转换为数组

## inspect

提供关于各种python元数据的内容

获取方法源码，可以用来截取装饰属性

```python
@li.li_annotation.run_on_uat  
def hello(a: int):  
    pass  
  
  
  
for line in inspect.getsourcelines(hello)[0]:  
    print(line)
```

## os

### 取环境变量

等同于 [[printenv]]

```python

import os  
  
print(os.environ.get('user'))  
print(os.environ.get('APPDATA'))

```

## str

`python`可以使用`''' str '''`,来进行纯字符串赋值，而不需要考虑转译字符。

### fomart

格式化字符串
`_string_.format(_value1, value2..._)`

占位符可以使用 `{}`，或基于位置的 `{1}` ,或 基于名称的  `{name}`

```python
txt1 = "My name is {fname}, I'm {age}".format(fname = "John", age = 36)  
txt2 = "My name is {0}, I'm {1}".format("John",36)  
txt3 = "My name is {}, I'm {}".format("John",36)
```

占位符内部可以使用一些特殊语法

- `:<`   规定字符长度，多余字符使用空格填充右边，类似 [[#ljust]]
- `:>`  规定字符长度，多余字符使用空格填充左边，类似 `rjust`
- `:b`  二进制表示
- `:d`  十进制
- `:o`  八进制
- `:x`  十六进制小写
- `:X`  十六进制大写

```python
>>> "my name is {:<10},i'm {:>10}" .format('123',123)
"my name is 123       ,i'm        123"
```

格式化字符串运算符，其接受一个tuple，tuple的长度需要和模板的占位符数量一致。

```python
print("%s %s" % ( 1.2))
```

- `%s`  字符串占位
- `%d`  数字占位
- `%f` 浮点数占位
- `%x/%X` 十六进制表示

`json` 格式化输出

```python
import json
str = '{"foo":"bar","name":"he"}'
parsed = json.loads(str)
print(json.dumps(parsed,indent=4,sort_keys=True))
```

### ljust

在右边填充字符，达到指定宽度，默认使用空格填充， `rjust` 与之类似，向左边填充

```python
>>> txt = "banana"
>>> x = txt.ljust(20,'*')
>>> print(x)
banana**************
```

### sub

替换字符串，类似 java 的 replace

```python
import re

origin='/1/2'
re.sub('^/','',origin)
# 1/2
```

## zip

将多个数组打包成元组

```python
a = [1,2,3]
b = [4,5,6,7,8]
zipped =zip(a,b)       # 元素个数与最短的列表一致
zip(*zipped)           # 与 zip 相反，*zipped 可理解为解压，返回二维矩阵式
```



## 示例

### XML解析

```python
import xml.etree.ElementTree as ET

tree = ET.parse("country.xml")
root = tree.getroot()
root.tag
root.attrlib

find(match)    # 查找第一个匹配的子元素， match可以时tag或是xpaht路径
findall(match  # 返回所有匹配的子元素列表
findtext(match, default=None)
iter(tag=None) # 以当前元素为根节点 创建树迭代器,如果tag不为None,则以tag进行过滤
iterfind(match)

```

### 开启一个简单的 http 服务

python2 或者低版本，直接敲

```shell
python -m SimpleHTTPServer <port>
```

python3

```shell
python -m http.server <port>
```

### 截取字符串或数组

w = '1'
当使用 w[1:],会得到一个空串，而不会报错

### python dict 根据 value 找对应的 key

```python
dicxx = {'a':'001', 'b':'002'}
list(dicxx.keys())[list(dicxx.values()).index("001")]
#'a'
```

### 使用守护进程的方式后台启动

```shell
# 后台启动
$ python background_test.py >log.txt 2>&1 &
```

### 监听文件是否有变动

```python
# --coding:utf-8--
import os
import time

filename = '.'  # 当前路径
last = time.localtime(os.stat(filename).st_mtime)
while True:
    new_filemt = time.localtime(os.stat(filename).st_mtime)
    if last != new_filemt:
        last = new_filemt
        print('change')
        #os.system('nginx -s reload')
    time.sleep(1)

```

### 调用shell

```python
import subprocess

try:
  subprocess.call(['/bin/bash','xxx.sh','arg1','arg2'])
except:
  #可以忽略所有错误，比如ctrl c，终止sh运行的错误
  pass
```

### 获取命令行参数

[Python 命令行参数 | 菜鸟教程](https://www.runoob.com/python/python-command-line-arguments.html)

```python
#!/usr/bin/python  
# -*- coding: UTF-8 -*-  
  
import sys  
  
print '参数个数为:', len(sys.argv), '个参数。'  
print '参数列表:', str(sys.argv)  
```

执行以上代码，输出结果为：

```shell
$ python test.py arg1 arg2 arg3 
参数个数为: 4 个参数。 
参数列表: ['test.py', 'arg1', 'arg2', 'arg3']
```

### 获取 python 版本

```python
import sys
if sys.version_info[0] < 3:
    raise Exception("Must be using Python 3")
```
