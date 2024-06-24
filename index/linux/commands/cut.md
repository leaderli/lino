---
tags:
  - linux/commands/cut
date updated: 2023-08-13 15:44
---

cut以每一行为一个处理对象，类似 [[awk]]，cut 主要用来剪切数据

- `-b` 按字节（bytes）定位
	```shell
	who|cut -b 3-5,8 # 每一行的第 3、第 4、第 5 和第 8 个字节
	```
- `-c` 按字符（characters）定位，与 `-b` 基figure.getParent本类似，但适合处理中文等
	```shell
	$ ll|cut -c  1-10
	total 2139
	-rw-rw-r--
	-rw-rw-r--
	```
- `-d` 定义分割符
- `-f` 按域（fields）定位，使用 `-d` 定义分割符，分割符只支持单个字符，不能识别多个空格等，默认分隔符为制表符

	
	```shell
	$ cat file.csv 
	1,2,3,4,5,6,7
	# 使用空格作为分隔符，提取第2个字段
	$ cut -d ',' -f 2 file.csv 
	2
	# 使用逗号作为分隔符，提取第1和3个字段：
	$ cut -d ',' -f 1,3 file.csv 
	1,3
	# 使用逗号作为分隔符，提取第1到3个字段：
	$ cut -d ',' -f 1-3 file.csv 
	1,2,3
	# 截取第二个以及第二个之后的字段
	$ cut -d ',' -f 2- file.csv 
	2,3,4,5,6,7
	```
	
