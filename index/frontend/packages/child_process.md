---
tags:
  - frontend/packages/child_process
  - node-module
date updated: 2022-04-14 10:14
---

调用 shell 命令

```shell
npm install --save child_process
```

exec 的回调函数在命令执行后才会返回。

```javascript
const { exec } = require("child_process");
exec("cat *.js missing_file | wc -l", (error, stdout, stderr) => {
  if (error) {
    console.error(`执行出错: ${error}`);
    return;
  }
  console.log(`stdout: ${stdout}`);
  console.log(`stderr: ${stderr}`);
});
```

我们也可以通过`on`监听 shell 命令的管道来实时输出返回结果

```javascript
const { exec } = require("child_process");
let tail = exec("tail -f 1.log");
//data为byte数组
tail.stdout.on("data", (data) => {
  console.log(`${data}`);
});
tail.stderr.on("data", (data) => {
  console.log(`${data}`);
});

tail.on("close", (code) => {
  console.log(`子进程退出码：${code}`);
});
```
