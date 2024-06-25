---
tags:
  - 软件/zookeeper
date updated: 2024-06-25 10:18
---
[下载链接](https://zookeeper.apache.org/releases.html)


```shell
sh zkCli.sh -server 127.0.0.1:2181
```

查看节点下的子节点:`ls path [watch]`

```shell
# 查看根目录/下的子节点，zookeeper为自带节点 [zk: 127.0.0.1:2181(CONNECTED) 31] ls / [zookeeper]
```

获取节点值以及属性：`get path [watch]`

```shell
[zk: 127.0.0.1:2181(CONNECTED) 12] get /testnode
testvalue
cZxid = 0x1a3
ctime = Sun Sep 25 17:30:16 CST 2016
mZxid = 0x1a3
mtime = Sun Sep 25 17:30:16 CST 2016
pZxid = 0x1a5
cversion = 2
dataVersion = 0
aclVersion = 0
ephemeralOwner = 0x0
dataLength = 9
numChildren = 2
```


查看节点的属性stat：`stat path [watch]`

```shell
[zk: 127.0.0.1:2181(CONNECTED) 16] stat /testnode
cZxid = 0x1a3
ctime = Sun Sep 25 17:30:16 CST 2016
mZxid = 0x1a6
mtime = Sun Sep 25 21:22:21 CST 2016
pZxid = 0x1a5
cversion = 2
dataVersion = 1
aclVersion = 0
ephemeralOwner = 0x0
dataLength = 13
numChildren = 2
```