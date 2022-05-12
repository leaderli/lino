---
tags:
  - python/tips
date updated: 2022-05-12 15:57
---

## 注释

### 获取方法文档注释

```python
my_func.__doc__
```

### 获取整个脚本的注释

```python

'''
test doc
'''

print(__doc__)

```

## str

`python`可以使用`''' str '''`,来进行纯字符串赋值，而不需要考虑转译字符。

### ljust

在右边填充字符，达到指定宽度，默认使用空格填充， `rjust` 与之类似，向左边填充

```python
>>> txt = "banana"
>>> x = txt.ljust(20,'*')
>>> print(x)
banana**************
```

### fomart

`_string_.format(_value1, value2..._)`

占位符可以使用 `{}`，或基于位置的 `{1}` ,或 基于名称的  `{name}`

```python
txt1 = "My name is {fname}, I'm {age}".format(fname = "John", age = 36)  
txt2 = "My name is {0}, I'm {1}".format("John",36)  
txt3 = "My name is {}, I'm {}".format("John",36)
```

占位符内部可以使用一些特殊语法

- `:<`   规定字符长度，多余字符使用空格填充，类似 [[#ljust]]
- `:>`  规定字符长度，多余字符使用空格填充，类似 `rjust`
- `:b`  二进制表示
- `:d`  十进制
- `:o`  八进制
- `:x`  十六进制小写
- `:X`  十六进制大写

```python
>>> "my name is {:<10},i'm {:>10}" .format('123',123)
"my name is 123       ,i'm        123"
```

`json`格式化输出

```python
import json
str = '{"foo":"bar","name":"he"}'
parsed = json.loads(str)
print(json.dumps(parsed,indent=4,sort_keys=True))
```
