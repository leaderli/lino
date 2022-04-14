---
tags:
  - frontend/packages/nprogress
  - node-module
date updated: 2022-04-14 10:19
---

```shell
npm i nprogress -s
npm i @types/nprogress -d

```

```html
<template>
    <div>
        <pre v-highlightjs='sourcecode'><code class='javascript' /></pre>
    </div>
</template>

<script setup lang="ts">

import { ref ,onMounted } from 'vue';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';

let sourcecode = ref('var hello = 1');

NProgress.configure({
    showSpinner:false
});


onMounted(() => {
    console.log('start');
    NProgress.start();
    console.log('start');
    
    setTimeout(() => {
        
        sourcecode.value = 'var fuck = 2';
        NProgress.done();
        console.log('done',sourcecode.value);
        
    }, 3000);
}
);
</script>
```

可定制进度条的具体形式，下面是默认的

```js
NProgress.configure({
	template: '<div class="bar" role="bar"><div class="peg"></div></div><div class="spinner" role="spinner"><div class="spinner-icon"></div></div>'
});
```

## 参考文档

[github](https://github.com/rstacruz/nprogress)
