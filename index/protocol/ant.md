---
tags:
  - protocol/ant
date updated: 2022-05-02 10:07
---

Ant风格支持三种匹配符

- `?` 匹配文件名中的一个字符
- `*` 匹配文件名中的任意字符
- `**` 匹配多层路径

例如：

- `com/t?st.jsp` 匹配 `com/test.jsp` ，`com/tast.jsp`  或 `com/txst.jsp`

- `com/*.jsp`  匹配所有在 com 目录下的 jsp 文件

- `com/**/test.jsp`  匹配所有在com目录及其子目录下的 test.jsp 文件

- `com/**/*.jsp` 匹配所有在com目录及其子目录下的 .jsp 文件
