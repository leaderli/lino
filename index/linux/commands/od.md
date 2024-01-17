---
tags:
  - linux/commands/od
date updated: 2022-04-11 10:34
---

以指定格式查看文件内容。

- `-c` 以ASCII字符或反斜杠序列(如 `\n` ) 显示

```shell
od -c 1.txt
```

 判断文件是否包含CRLF，可以通过[[cat#^392707|cat -v ]] 查看，或者在vi中 [[vim#显示特殊字符]]

```shell
# 两个空格
if [[ `od -c 1.txt` == *"\r  \n"*]]
then
	echo "found"
fi
```
