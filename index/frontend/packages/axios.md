---
tags:
  - frontend/packages/axios
  - ajax
date updated: 2022-03-28 14:59
---

## 安装

```shell
npm install --save axios
```

## 示例

基础示例

```javascript
const axios = require("axios");
axios({
  url: "http://localhost:5000",
  method: "post",
  data: "{}",
  headers: { "Content-type": "application/json" },
}).then((res) => {
  console.log(res);
});
```

其参数值可以为

- data 请求数据
- method 请求访问
- url 请求地址
- headers 请求头

==当请求一直pending时，尝试添加   headers: { "Content-type": "json" }==

post 请求

```javascript
const axios = require("axios");

axios
  .post("http://localhost:5000", {
    name: 1,
  })
  .then((res) => {
    console.log(res);
  });
  .catch((err)=>{
    console.log(err)
  })
```

我们可以为请求设定一个具有指定配置项的实例

```javascript
const instance = axios.create({
  url: "http://localhost:5000",
  timeout: 1000,
  headers: { "Content-tyle": "application/json" },
});
```

然后这个 instance 就可以直接调用下述方法

- `axios#request(config)`
- `axios#get(url[, config])`
- `axios#delete(url[, config])`
- `axios#head(url[, config])`
- `axios#options(url[, config])`
- `axios#post(url[, data[, config]])`
- `axios#put(url[, data[, config]])`
- `axios#patch(url[, data[, config]])`
- `axios#getUri([config])`

## vue-cli2 中 axios 全局配置

```javascript
//axios/index.js
import axios from "axios";

axios.defaults.baseURL =
  env === "development"
    ? "/api"
    : window.location.protocol + "//" + window.location.host; // 配置axios请求的地址
axios.defaults.headers.post["Content-Type"] = "application/json; charset=utf-8";
axios.defaults.crossDomain = true;
axios.defaults.withCredentials = true; //设置cross跨域 并设置访问权限 允许跨域携带cookie信息

//配置发送请求前的拦截器 可以设置token信息
axios.interceptors.request.use(
  (config) => {
    // 这里配置全局loading
    if (!/\.json/.test(config.url)) {
      $("#screen").show(); // 这个div控制loading动画，项目中有对json的请求，所以这里区分是否是json文件
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 配置响应拦截器
axios.interceptors.response.use(
  (res) => {
    $("#screen").hide(); // loading结束
    return Promise.resolve(res.data); // 这里直接返回data, 即接口返回的所有数据
  },
  (error) => {
    $("#screen").hide();
    tooltip("", "连接错误！", "error");
    // 判断是否登录失效，按照实际项目的接口返回状态来判断
    if (error.toString().includes("776")) {
      window.location.href = window.location.origin + "/#/login";
    }
    return Promise.reject(error);
  }
);
export default axios;
```

最后在 main.js 里面引入

```javascript
import VueAxios from "vue-axios"; // 报错的话则npm安装依赖
import axios from "./axios";

Vue.use(VueAxios, axios);
```

## 提交 form 表单数据

```javascript
var bodyFormData = new FormData();
bodyFormData.append("userName", "Fred");
axios({
  method: "post",
  url: "myurl",
  data: bodyFormData,
  headers: { "Content-Type": "multipart/form-data" },
})
  .then(function (response) {
    //handle success
    console.log(response);
  })
  .catch(function (response) {
    //handle error
    console.log(response);
  });
```

## 参考文档

[官方文档](https://github.com/axios/axios)
