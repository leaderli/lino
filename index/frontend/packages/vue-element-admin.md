---
tags:
  - frontend/packages/vue-element-admin
  - node-module
  - vue
date updated: 2022-04-14 10:40
---

## 安装

```shell
$ git clone git@github.com:PanJiaChen/vue-element-admin.git

$ npm install
```

## 模拟报文

默认情况下本地的请求会被代理到`http://localhost:${port}/mock`下，如果想要调整为自己的mock地址可以修改proxy

`vue.config.js`

```javascript
proxy: {
  // change xxx-api/login => mock/login
  // detail: https://cli.vuejs.org/config/#devserver-proxy
  [process.env.VUE_APP_BASE_API]: {
    target: `http://localhost:${port}/mock`,
    changeOrigin: true,
    pathRewrite: {
      ['^' + process.env.VUE_APP_BASE_API]: ''
    }
  }
},
after: require('./mock/mock-server.js')
```

```ad-warning
当我们设置了proxy代理，但axios请求一直pendding的时候，一般有可能是mock将请求拦截了。我们只要在vue.config.js将before的mock删除，或更改为after
```

## tabs

```javascript
// 当设置 true 的时候该路由不会在侧边栏出现 如401，login等页面，或者如一些编辑页面/edit/1
hidden: true // (默认 false)

//当设置 noRedirect 的时候该路由在面包屑导航中不可被点击
redirect: 'noRedirect'

// 当你一个路由下面的 children 声明的路由大于1个时，自动会变成嵌套的模式--如组件页面
// 只有一个时，会将那个子路由当做根路由显示在侧边栏--如引导页面
// 若你想不管路由下面的 children 声明的个数都显示你的根路由
// 你可以设置 alwaysShow: true，这样它就会忽略之前定义的规则，一直显示根路由
alwaysShow: true

name: 'router-name' // 设定路由的名字，一定要填写不然使用<keep-alive>时会出现各种问题
meta: {
  roles: ['admin', 'editor'] // 设置该路由进入的权限，支持多个权限叠加
  title: 'title' // 设置该路由在侧边栏和面包屑中展示的名字
  icon: 'svg-name' // 设置该路由的图标，支持 svg-class，也支持 el-icon-x element-ui 的 icon
  noCache: true // 如果设置为true，则不会被 <keep-alive> 缓存(默认 false)
  breadcrumb: false //  如果设置为false，则不会在breadcrumb面包屑中显示(默认 true)
  affix: true // 如果设置为true，它则会固定在tags-view中(默认 false)

  // 当路由设置了该属性，则会高亮相对应的侧边栏。
  // 这在某些场景非常有用，比如：一个文章的列表页路由为：/article/list
  // 点击文章进入文章详情页，这时候路由为/article/1，但你想在侧边栏高亮文章列表的路由，就可以进行如下设置
  activeMenu: '/article/list'
}
```

## 参考文档

[官方文档](https://panjiachen.github.io/vue-element-admin-site/zh/guide/)

[mock](https://panjiachen.github.io/vue-element-admin-site/zh/guide/essentials/mock-api.html)
