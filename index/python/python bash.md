---
tags:
  - python/bash
date updated: 2022-05-24 17:13
---

python 调用 shell

### os.system

`os.system()` 是 os 模块最基础的方法，其他的方法一般在该基础上封装完成。 `os.system()` 的返回值是一个16位的二进制数字，高位（前8位）为 [[bash#状态码|状态码]] ，低位为  [[bash#捕获信号|信号号码]] 。要想获得实际命令的执行结果，可以使用位移运算（右移8位）得到  [[bash#状态码|状态码]]

```python
import os

os.system('echo $PATH')
```

```python
>>>import os
>>>n =  os.system('echo hello  && exit 1')
hello
>>> n
256
>>> n >> 8
1
```

system 函数是将字符串转化为命令在服务器上运行，其原理是每一条 system 函数执行时，其会创建一个子进程在系统上执行命令，子进程的执行结果无法影响主进程。

```python
import os
os.system('cd /usr/local')
os.system('mkdir temp')
```

上述程序执行后，不会在  `/usr/local` 目录下新建 `temp` ，而是在脚本执行的当前目录下。

为了保证 system 执行多条命令成功，多条命令需要在一个子进程中执行。

```python
import os
os.system('cd /usr/local && mkdir temp')

```

### os.popen

`os.popen` 用于从一个命令打开一个管道，语法格式如下：

```python
os.popen(command[, mode [, bufsize]])
```

#### 参数

- command 使用的命令
- mode 模式权限 可以是 `r` （默认）或 `w`
- bufsize  指明了文件的缓冲大小，`0` 意味着无缓冲，`1` 意味着行缓冲，其他正值表示使用参数大小的缓冲（大概值，以字节为单位），负值意味着使用系统的默认值。一般来说，对于 [[tty]] 设备，它是行缓冲，对于其他文件，它是全缓冲。

#### 返回值

返回一个文件描述符为 fd 的打开的文件对象，可以使用 `read`  和 `readlines` 读取文件的执行结果

```shell
#!/bin/bash
echo "hello python"
echo "hello li"
exit 1
```

```python
>>> import os
>>> os.popen('./test.sh').readlines()                                           
['hello python\n', 'hello li\n']
>>> os.popen('./test.sh').read()                                                
'hello python\nhello li\n'
```

#### 注意事项

popen 打开的是一个文件流，使用完需要关闭，推荐的写法是：

```python
with os.popen(command) as p:
	r = p.read()
```

popen 不会阻塞等待命令执行结束，仅在使用 `read` 或 `readlines` 对结果进行读取操作时才等待。

另外如果命令执行无法退出或者进入交互模式，则程序会完全阻塞。

例如

```python
import os
os.popen('ping 127.0.0.1 -t').readlines()
```

该命令会一直执行，除非使用 `ctrl + c` 中断执行，因此 readlines 读取命令输出时会卡住

### subprocess.run

查看其源码，实际也是调用 [[#subprocess Popen]] ，这里不做过多介绍。

```python
def run(*popenargs, input=None, timeout=None, check=False, **kwargs):  
  if input is not None:  
        if 'stdin' in kwargs:  
            raise ValueError('stdin and input arguments may not both be used.')  
        kwargs['stdin'] = PIPE  
  
    with Popen(*popenargs, **kwargs) as process:  
        try:  
            stdout, stderr = process.communicate(input, timeout=timeout)  
        except TimeoutExpired:  
            process.kill()  
            stdout, stderr = process.communicate()  
            raise TimeoutExpired(process.args, timeout, output=stdout,  
                                 stderr=stderr)  
        except:  
            process.kill()  
            process.wait()  
            raise  
        retcode = process.poll()  
        if check and retcode:  
            raise CalledProcessError(retcode, process.args,  
                                     output=stdout, stderr=stderr)  
    return CompletedProcess(process.args, retcode, stdout, stderr)
```

### subprocess.Popen

Popen的参数如下：

```python
def __init__(self, args, bufsize=-1, executable=None,  
             stdin=None, stdout=None, stderr=None,  
             preexec_fn=None, close_fds=_PLATFORM_DEFAULT_CLOSE_FDS,  
             shell=False, cwd=None, env=None, universal_newlines=False,  
             startupinfo=None, creationflags=0,  
             restore_signals=True, start_new_session=False,  
             pass_fds=(), *, encoding=None, errors=None):
```

- shell 是否将参数视为一个 shell语句
  ```python
  import subprocess  

  r = subprocess.Popen('ls -l', shell=True)  
    
  print(r.wait())  
    
  r = subprocess.Popen(['ls', '-l'])  
  print(r.wait())
  ```

- `stdin`, `stdout`, `stder` 指定标准输入、标准输出、标注错误的 [[linux basic#文件描述符|文件描述符]]

	```python
	import subprocess  
    # 输出到文件中
	f = open('test.log', 'w')  
	r = subprocess.Popen(['ls', '-l'], stdout=f)
    # 使用变量接收
	```

## 参考文档

[os.system()、os.popen()和subprocess的区别（一） - 测试开发小白变怪兽 - 博客园](https://www.cnblogs.com/yu97271486/p/12497622.html)

[python-3-subprocess-examples](https://queirozf.com/entries/python-3-subprocess-examples#run-example-run-command-and-get-return-code)
