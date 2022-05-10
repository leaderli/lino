---
tags:
  - linux/commands/echo
date updated: 2022-04-14 11:30
---

- `-e` 对输出内容进行格式调整，命令格式 `echo -e "\033[字背景颜色;文字颜色m字符串\033[0m"`
- `-n` 不换行输出

示例

```shell
echo -e "\033[30m 黑色字 \033[0m"
echo -e "\033[31m 红色字 \033[0m"
echo -e "\033[32m 绿色字 \033[0m"
echo -e "\033[33m 黄色字 \033[0m"
echo -e "\033[34m 蓝色字 \033[0m"
echo -e "\033[35m 紫色字 \033[0m"
echo -e "\033[36m 天蓝字 \033[0m"
echo -e "\033[37m 白色字 \033[0m"

echo -e "\033[40;37m 黑底白字 \033[0m"
echo -e "\033[41;37m 红底白字 \033[0m"
echo -e "\033[42;37m 绿底白字 \033[0m"
echo -e "\033[43;37m 黄底白字 \033[0m"
echo -e "\033[44;37m 蓝底白字 \033[0m"
echo -e "\033[45;37m 紫底白字 \033[0m"
echo -e "\033[46;37m 天蓝底白字 \033[0m"
echo -e "\033[47;30m 白底黑字 \033[0m"
```

![[Pasted image 20220407112034.png|100]]

### 查看当前是否 root

```shell
# 0既是root
echo $UID
```

### 显示当前 IP 的 hostname

```shell
# 主机名
echo $HOSTNAME

#显示当前ip
hostname -i
```
