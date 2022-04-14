---
tags:
  - frontend/packages/pinyin
  - node-module
date updated: 2022-04-14 10:24
---

中文转换为拼音的库

```shell
npm install pinyin --save
```

```js
var pinyin = require("pinyin");

console.log(pinyin("中心"));    // [ [ 'zhōng' ], [ 'xīn' ] ]
console.log(pinyin("中心", {
  heteronym: true               // 启用多音字模式
}));                            // [ [ 'zhōng', 'zhòng' ], [ 'xīn' ] ]
console.log(pinyin("中心", {
  heteronym: true,              // 启用多音字模式
  segment: true                 // 启用分词，以解决多音字问题。
}));                            // [ [ 'zhōng' ], [ 'xīn' ] ]
console.log(pinyin("我喜欢你", {
  segment: true,                // 启用分词
  group: true                   // 启用词组
}));                            // [ [ 'wǒ' ], [ 'xǐhuān' ], [ 'nǐ' ] ]
console.log(pinyin("中心", {
  style: pinyin.STYLE_INITIALS, // 设置拼音风格
  heteronym: true
}));                            // [ [ 'zh' ], [ 'x' ] ]
```

## 参考文档

[📒 github](https://github.com/hotoo/pinyin)
