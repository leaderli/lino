---
tags:
  - linux/commands/zip
  - linux/commands/unzip
date updated: 2023-12-24 12:47
---

- `-r` 递归压缩，常用于文件夹
- `-s` 分卷压缩
- `-m` 压缩后删除原始文件，当作用于文件夹时，需要文件夹内内容全部被压缩

```shell
zip -r  test.zip   test_folder1/  test_foler2/
zip -r -s 100m test.zip   test_folder1/  test_foler2/
```

## 分卷压缩

```shell
zip -s 1g -r archivename.zip directory_name

cat archivename.z* > archivename.zip
unzip archivename.zip




# 将压缩文件分卷
zip -s 100m a.zip  --out  b.zip
```

## 解压

```shell
# 解压到某个目录
$ unzip app.zip -d app
```


> bad zipfile offse

```shell
zip -F file.zip --out file-large.zip
```