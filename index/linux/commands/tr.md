---
tags:
  - linux/commands/tr
date updated: 2023-08-12 21:34
---

`tr` 是一个用于字符转换或删除字符的命令行工具。它的名称是“translate”的缩写，可以在 Unix/Linux 系统上使用。

```shell
tr [-cdst][--help][--version][第一字符集][第二字符集]  
tr [OPTION]…SET1[SET2] 
```

### 参数

- `d` 删除指令字符

  ```shell
  $ echo "Hello" | tr -d 'l'
  Heo
  ```

- `c` 反选设定字符。也就是符合 SET1 的部份不做处理，不符合的剩余部份才进行转换
  ```shell
  # 换行符也被忽略了
  $ echo "Hello" | tr -cd 'l'
  ll$
  ```

- `t`  --truncate-set1：削减 SET1 指定范围，使之与 SET2 设定长度相等

  ```shell
  $ echo hello |tr 'llo' 'bb'
  hebbb
  $ echo hello |tr  -t 'llo' 'bb'
  hebbo
  ```

- `s` --squeeze-repeats：缩减连续重复的字符成指定的单个字符

	```shell
	$ echo helloo|tr -s 'l'
	heloo
	```

### 支持字符集和字符范围的转换

- `a-z`
- `A-Z`
- `0-9`
- `\n`
- `\t`

```shell
$ echo "hello" | tr 'a-z' 'A-Z'
HELLO

$ echo "hello" | tr '[:lower:]' '[:upper:]'
HELLO
```

### 一些常用用法

删除Windows文件“造成”的`^M`字符：

```shell
cat file | tr -s "\r" "\n" > new_file
cat file | tr -d "\r" > new_file
```
