---
tags:
  - frontend/packages/fuse
  - node-module
date updated: 2022-04-14 10:17
---

模糊搜索 [Live Demo | Fuse.js](https://fusejs.io/demo.html)

```shell
npm install --save fuse.js
```

fusejs搜索的list不支持响应式，list数据变化时需要重新new

```js
const arr = [
    {
        title: 'Old Man\'s War',
        author: {
            firstName: 'John',
            lastName: 'Scalzi'
        }
    },
    {
        title: 'The Lock Artist',
        author: {
            firstName: 'Steve',
            lastName: 'Hamilton'
        }
    }
]
const options = {
    // isCaseSensitive: false,
    // includeScore: false,
    // shouldSort: true,
    // includeMatches: false,
    // findAllMatches: false,
    // minMatchCharLength: 1,
    // location: 0,
    // threshold: 0.6,
    // distance: 100,
    // useExtendedSearch: false,
    // ignoreLocation: false,
    // ignoreFieldNorm: false,
    keys: [
        'title',
        'author.firstName'
    ]
};

const fuse = new Fuse(myList);
const pattern = 'a';
console.log(fuse.search(pattern as string));
```
