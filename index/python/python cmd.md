---
tags:
  - python/cmd
date updated: 2022-05-12 15:15
---

一个命令行框架，提供可交互的 `cli`，支持补全，帮助文档。

主要的两个方法。

- `Cmd.onecmd(str)`  一次性命令，执行完后即退出。

- `Cmd.cmdloop(intro=None))`  提供类似bash的terminal，支持历史记录，补全等。



其他方法可通过重写，覆盖默认行为：

- `Cmd.emptyline()`  当输入空行时的行为，默认行为是执行上一次非空行命令

- `Cmd.default(line)`  当输入一个不存在命令的行为，默认为打印 `*** Unknown syntax: `

- `Cmd.completedefault(text,line,begidx,endidx)`  当没有 `complete_*()` 方法时的补全行为，默认返回空集合。



框架通过定义 `do_*()` 来添加新的命令，配套的 `help_*()` ，`complete_*()` 方法分别定义其 帮助文档和自动补全操作。默认情况下 `do_*()` 的帮助文档为 `do_*()` 的方法注释。


```python
from cmd import Cmd  
  
  
class MyPrompt(Cmd):  
  
    def complete_hello(self, text, line, begidx, endidx):  
        return ['stranger']  
  
    def help_hello(self):  
        """Says hello. If you provide a name, it will greet you with it."""  
        print('help_hello', self.help_hello.__doc__)  
  
    def do_hello(self, args):  
        """Says hello. If you provide a name, it will greet you with it."""  
        if len(args) == 0:  
            name = 'stranger'  
        else:  
            name = args  
        print("Hello, %s" % name)  
  
    def do_quit(self, args):  
        """Quits the program."""  
        print("Quitting.")  
        raise SystemExit  
  
  
if __name__ == '__main__':  
    prompt = MyPrompt()  
    prompt.prompt = '> '  
    prompt.cmdloop('Starting prompt...')
```


`Cmd.prompt` 定义其交互模式的提示符，类似 [[configuration#^504e6a|PS1]]

## 参考文档

[24.2. cmd — Support for line-oriented command interpreters — Python 3.6.15 documentation](https://docs.python.org/3.6/library/cmd.html)
