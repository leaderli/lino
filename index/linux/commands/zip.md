---
tags:
  - linux/commands/zip
date updated: 2022-05-30 16:24
---

- `-r` 递归压缩，常用于文件夹
- `-s` 分卷压缩 
- `-m` 压缩后删除原始文件，当作用于文件夹时，需要文件夹内内容全部被压缩

```shell
zip -r  test.zip   test_folder1/  test_foler2/
zip -r -s 100mb  test.zip   test_folder1/  test_foler2/
```




分卷压缩
```shell
zip -s 1g -r archivename.zip directory_name

cat archivename.z* > archivename.zip
unzip archivename.zip
```