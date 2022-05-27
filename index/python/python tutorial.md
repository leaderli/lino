---
tags:
  - python/tutorial
date updated: 2022-05-25 00:25
---

## 安装

```shell
# centos7
yum install -y python3
```

## pip

python3现在内置pip

```shell
python3 -m pip 

# 常用命令
python3 -m pip install packageName
python3 -m pip uninstall packageName
python3 -m pip search packageName


# 临时指定镜像
pip3 install xxx -i https://mirrors.163.com/pypi/simple/


# 按照到指定目录
python3  -m pip install PyYAML  --target  myapp
# 依赖比较多的，可以用文件来申明依赖
python3  -m pip install -r requirements.txt  --target  myapp


```

配置 

```python
python3 -m pip config
```

## 打包

使用zipapp来实现打包
- `-o`  打包后的文件名
-  `-m` 指定main方法，即可执行文件的入口
-  `-p` 指定python的解释器，类似 bash 脚本的 头申明，类似 `#!/bin/python` 

```python
python3  -m zipapp python-tips/ -m 'test:main'  -o 'test.zip'
```


## 类

### class 属性

定义在 `class` 方法外的属性, `method` 本身也属于 `class` 属性

### class 实例的方法，第一个参数自动转换为实例的索引

第一个参数不一定非要命名为 `self`

### 类方法

直接使用 `Class.method(instance)`，参数需要显式的传递实例对象

### 父类构造器

`python`不会自动调用父类构造器,需要显式的调用

```python
class SongBird(Bird):

    def __init__(self):

        Bird.__init__(self)

        self.sound = 'Squawk'

    def sing(self):

        print self.sound

```

## 运算符

### 重载运算符

什么是运算符重载
让自定义的类生成的对象(实例)能够使用运算符进行操作
作用:
让自定义的实例像内建对象一样进行运算符操作
让程序简洁易读
对自定义对象将运算符赋予新的规则

#### 算术运算符的重载

方法名                   运算符和表达式       说明

```python
__add__(self,rhs)        self + rhs        加法
__sub__(self,rhs)        self - rhs         减法
__mul__(self,rhs)        self * rhs         乘法
__truediv__(self,rhs)   self / rhs          除法
__floordiv__(self,rhs)  self //rhs          地板除
__mod__(self,rhs)       self % rhs       取模(求余)
__pow__(self,rhs)       self **rhs         幂运算
__or__(self, other)      self | other      或运算
__and__(self, other)      self & other      与运算
```

示例

```python
class Mynumber:
    def __init__(self,v):
        self.data = v
    def __repr__(self): #消除两边的尖括号
        return "Mynumber(%d)"%self.data

    def __add__(self,other):
        '''此方法用来制定self + other的规则'''

        v = self.data + other.data
        return Mynumber(v) #用v创建一个新的对象返回给调用者

    def __sub__(self,other):
        '''此方法用来制定self - other的规则'''
        v = self.data - other.data
        return Mynumber(v)

n1 = Mynumber(100)
n2 = Mynumber(200)
# n3 = n1 + n2
n3 = n1+n2 # n3 = n1.__add__(n2)
print(n3)   #Mynumber(300)
n4 = n3 - n2 #等同于n4 = n3.__sub__(n2)
```

#### 反向运算符的重载

当运算符的左侧为内建类型时,右侧为自定义类型进行算术匀算符运算时会出现 TypeError 错误,因为无法修改内建类型的代码          实现运算符重载,此时需要使用反向运算符的重载

方法名                   运算符和表达式       说明

```python
__radd__(self,lhs)       lhs + self       加法
__rsub__(self,lhs)       lhs - self       减法
__rmul__(self,lhs)       lhs * self       乘法
__rtruediv__(self,lhs)   lhs / self       除法
__rfloordiv__(self,lhs)  lhs // self       地板除
__rmod__(self,lhs)       lhs % self       取模(求余)
__rpow__(self,lhs)       lhs ** self       幂运算
```

#### 比较算术运算符的重载

方法名                   运算符和表达式       说明

```python
__lt__(self,rhs)       self < rhs        小于
__le__(self,rhs)       self <= rhs       小于等于
__gt__(self,rhs)       self > rhs        大于
__ge__(self,rhs)       self >= rhs       大于等于
__eq__(self,rhs)       self == rhs       等于
__ne__(self,rhs)       self != rhs       不等于
```

#### 位运算符重载

方法名               运算符和表达式         说明

```python
__and__(self,rhs)       self & rhs           位与
__or__(self,rhs)        self | rhs              位或
__xor__(self,rhs)       self ^ rhs             位异或
__lshift__(self,rhs)    self <<rhs            左移
__rshift__(self,rhs)    self >>rhs            右移
```

#### 其他运算符重载

`in`  `not in` 运算符重载
注: `in`   `not in` 返回布尔值 `True` `False`
当重载了 `__contains__` 后,`in` 和 `not in` 运算符都可用
`not in`  运算符的返回值与 `in`  相反

```python
__contains__(self,e):
```

## 断言

断言自定义提示信息

```python
assert x >= 0, 'x is less than zero'
```

## 方法

### main

```python
def main():
    print("Hello World!")

if __name__ == "__main__":
    main()
```

### 模块

调用其他 py 文件方法

```python
import other

other.m()

```

### 动态调用方法

在`py`文件中，可以使用

```python
def func(arg1,arg2):
    pass

globals()['func'](1,2)
```

调用`class`方法，可以使用

```python
class Data:
    def func(self,arg1,arg2):
        pass

data = Data()
func = getattr(data,'func')
func(1,2)

```

### 返回多个值

```python
def multi():
    return 1,2

x,y = multi()

```

实际上 python 返回的是一个`tulpe`，在语法上，返回一个 tuple 可以省略括号，而多个变量可以同时接收一个 tuple，按位置赋给对应的值，所以，Python 的函数返回多值其实就是返回一个 tuple，但写起来更方便.

### 获取所有方法

对于类 `Func` 
```python
print([funcName for funcName in dir(Func) if callable(getattr(Func,funcName))])
```

### 打印方法的所有参数

```python
import inspect
print(inspect.getfullargspec(a_method))
```

## 枚举

`python3.4`版本支持

```python
from enum import Enum


class Direction(Enum):
    LEFT = "left"
    RIGHT = "right"
    UP = "up"
    DOWN = "down"


def move(direction):

    # Type checking
    if not isinstance(direction, Direction):
        raise TypeError('direction must be an instance of Direction Enum')

    print(direction.value)

move(Direction.LEFT)#left
move("right")#TypeError: direction must be an instance of Direction Enum
print({d.name: d.value for d in Direction})
print(Direction('up').name)#UP

```

## 参数

### 可变参数

1. 当我们声明一个星号的参数，如`*param`，那么从这一点开始到结束的所有位置的参数都被收集到一个叫`param`的元组中。
2. 同样,当我们声明一个双星参数，如`**param`，那么从那一点开始到结束的所有关键字参数都被收集到一个叫`param`的字典中。
3. 当我们调用方法时显示的使用`*`，即表示将当前数组展开为多个参数。`**` 同理

```python
a = [1, 2, 3]

def m1(*arg):
    print(arg)
    pass

m1(1, 2)
m1(a)
m1(*a)

def m2(arg):
    print(arg)
    pass

m2(a)
m2(*a)
```

执行结果

```log
(1, 2)
([1, 2, 3],)
(1, 2, 3)
[1, 2, 3]
Traceback (most recent call last):
File "/Users/li/Downloads/test.py", line 21, in <module>
m2(*a)
```

调用方法显示使用`**`

```python
para = {'a': 1, 'b': 2}

def m(** para):
    print(para)
    pass

m(**para)
print('-----------------')
m(para)

```

```log
{'a': 1, 'b': 2}
'-----------------
Traceback (most recent call last):
File "/Users/li/Downloads/test.py", line 12, in <module>
m(para)
```

### 默认参数

```python
def log(level='debug'):

    print(level)

log()
log('hello')
log(level='info')
```

```log
debug
hello
info
```

#### 示例

仅允许使用关键字参数

```python
def hello(*, k1='k1'):
	pass

hello(k1=1)
# 下面这种用法会直接报错
hello(1)
```

## 全局变量

全局变量需要在外部声明，在方法内部使用时需要在方法内部使用 global 申声明

```python
name = None
def foo():
    global name
    print(name)

def bar():
    global name
    name ='bar'

foo()
bar()
foo()
```

```log
None
bar
```

## 类型

python中可以声明类型，运行时不对类型做强制性校验，类型声明仅用于第三方工具进行类型校验，以及方便阅读使用

```python
a:int = 1
```

声明数组，元祖的元素类型

```python
from typing import List  

Vector = List[int]  
v: Vector = [1]
```

组合类型

```python
from typing import Union  
  
v: Union[int, str] = 1.00
```
