---
tags:
  - frontend/packageshighlightjs
date updated: 2022-04-05 16:18
---

高亮代码块

```shell
npm install -D -S highlight.js
```

```javascript
import hljs from "highlight.js";
var obj = { a: 1, b: "2" };
//优化json格式
var json = JSON.stringify(obj, null, 4);

var lang = "json";
//得到高亮后的html文本
var html = hljs.highlight(lang, json).value;

//写入对应的dom元素上
document.getElementById("#id").innerHTML = html;
```

### 参考文档

[官网文档](https://highlightjs.readthedocs.io/en/latest/index.html)
