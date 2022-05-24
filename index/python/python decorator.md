---
tags:
  - python/decorator
date updated: 2022-05-25 01:13
---

## 基础

`python` 装饰器，类似 `java` 反射，用以实现切面。
`python` 是函数式语言，不需要使用反射，可动态的修改函数或者类。当我们需要给一段函数增加打印函数名和参数的功能时我们可以这样做

```python
def hello(name):
    return 'hello '+name


def log(func):
    def wrapper(*args, **kwargs):
        print('-----------before-----------')
        print(func(*args, **kwargs))
        print('-----------after-----------')
    return wrapper


hello = log(hello)

hello('li')

```

执行结果如下

```log
-----------before----------- 
hello li 
-----------after-----------
```

但是当我们 `print(hello)` 时我们发现

```log
<function log.<locals>.wrapper at 0x10db2bc80>
```

我们只需要在 `log` 的内部方法 `wrapper` 加上注解

```python
import functools




def log(func):
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        print('-----------before-----------')
        print(func(*args, **kwargs))
        print('-----------after-----------')
    return wrapper
```

这个时候 `print(hello)`

```log
<function hello at 0x10ef94c80>
```

## 使用注解实现装饰器

`python` 为我们提供了语法糖，来自动实现自动给方法加上装饰器这个过程，只需要使用注解即可

完整代码如下

```python

import functools


def log(func):
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        print('-----------before-----------')
        print(func(*args, **kwargs))
        print('-----------after-----------')
    return wrapper


@log
def hello(name):
    return 'hello '+name


hello('li')

print(hello)

```

输出结果如下

```log
 -----------before-----------  
 hello li  
 -----------after----------- 
 <function hello at 0x102690c80>
```

### 装饰器使用参数

```python
import functools

def log(name=''):  
    def decorator(func):  
        @functools.wraps(func)  
        def wrapper(*args, **kwargs):  
            print('-----------before----------- ' + name)  
            return func(*args, **kwargs)  
  
        return wrapper  
  
    return decorator
    

@log('li')
def hello(name):
    return 'hello '+name

```

### 可选参数

需要注意的是，此种写法，注解的参数只能使用 `k=v` 这种。

```python
def log(_func=None, *, name=''):  
    def decorator(func):  
        @functools.wraps(func)  
        def wrapper(*args, **kwargs):  
            print('-----------before----------- ' + name)  
            return func(*args, **kwargs)  
  
        return wrapper  
  
    if _func is None:  
        return decorator  
    else:  
        return decorator(_func)
```

## 类装饰器

`python` 还提供了类装饰器，会自动实例化类，并在调用方法时调用类的 `__call__` 方法。
需要注意的是，在 `__init__` 方法，使用参数时，若使用位置参数，则装饰器注解不可带参数，且位置参数有且仅有一个，此参数在运行时即为被装饰的函数。若装饰器注解使用参数，则 `__init__` 方法，需使用默认参数

```python
import functools


class Log(object):

    def __init__(self, func):
        print('---init---')
        print(inspect.getfullargspec(a_method))

        self.func = func

    def __call__(self, *args, **kwargs):
        print('-----------before-----------')
        print(self.func(*args, **kwargs))
        print('-----------after-----------')


@Log
def hello(name):
    return 'hello '+name


hello('li')
hello('li')

print(hello)
```

根据输出结果可以看到，类只加载一次，即`__init__`方法只会执行一次

```log
---init--- 
-----------before----------- 
hello li 
-----------after----------- 
-----------before----------- 
hello li 
-----------after----------- 
<**main**.Log object at 0x1048ff668>
```

### 类装饰器使用参数

参数需要指定默认值，

```python
import functools


class Log(object):

    def __init__(self, name='default'):
        print('---init---')
        self.name = name

    def __call__(self, func):
        def wrapper(*args, **kwargs):
            print(self.name)
            print(func(*args, **kwargs))
        return wrapper


@Log('li')
def hello(name):
    return 'hello '+name


@Log()
def default(name):
    return 'hello '+name


hello('hello')
default('default')

```

### 类装饰圈可选参数

主要参考 [[#可选参数]] 来实现的

```python
class Log(object):  
  
    def __init__(self, _func=None, *, name='default'):  
        self.name = name  
        self._func = _func  
  
    def __call__(self, *_args, **_kwargs):  
        def wrapper(*args, **kwargs):  
            print('before ' + self.name)  
            return _args[0](*args, **kwargs)  
  
        # if self._func:  
        #     return self._func        if not callable(self._func):  
            return wrapper  
  
        print('-- before not parameter -- ')  
        return self._func(*_args, **_kwargs)  
  
  
@Log  
def hello(name):  
    return 'hello ' + name  
  
  
@Log(name='li')  
def hello2(name):  
    return 'hello ' + name  
  
  
print(hello('one'))  
print(hello2('two'))
```

参数与位置息息相关

```python
import functools

class Log(object):

    def __init__(self, name="default", filter=0):
        self.name = name
        print(filter)

    def __call__(self, func):
        def wrapper(*args, **kwargs):
            print(self.name)
            print(func(*args, **kwargs))
        return wrapper


@Log('hello', 100)
def hello(name):
    return 'hello '+name


@Log(filter=200)
def default(name):
    return 'hello '+name


hello('hello')
default('default')
```
