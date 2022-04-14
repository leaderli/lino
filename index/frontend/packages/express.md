---
tags:
  - frontend/packages/express
  - node-module
date updated: 2022-04-14 10:11
---

一个web框架



```shell
npm install --save express
npm install --save body-parser
```

```javascript
const express = require("express");
const bodyParser = require("body-parser");
const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// 拦截/请求，并打印请求报文
app.post("/", (req, res) => {
  console.log(req.body);
  res.send("ok");
});
app.listen(5000, () => {
  console.log("start server at 5000");
});
```
