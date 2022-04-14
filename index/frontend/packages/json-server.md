---
tags:
  - frontend/packages/json-server
  - node-module
date updated: 2022-04-14 10:24
---

一个用于方便操作json的轻量级服务端

需要注意的是，对于数组来说，需要一个`id`的属性

```js
{
  "posts": [
    { "id": 1, "title": "json-server", "author": "typicode" }
  ],
  "comments": [
    { "id": 1, "body": "some comment", "postId": 1 }
  ],
  "profile": { "name": "typicode" }
}
```

```js
// 新增一条记录  id 会自增，不可以使用已经存在的id

POST   /posts {"title":"test1"}

// 删除id=1的记录
DELETE /posts/1

//修改id=1的记录
PUT /posts/1 {"title":"test1"}
```

## 参考文档

[📒 github](https://github.com/typicode/json-server)
