---
tags:
  - frontend/packages/webpack
  - node-module
date updated: 2022-04-14 10:42
---

# 快速入门

```shell
mkdir webpack-demo
cd webpack-demo
npm init -y
npm install webpack webpack-cli --save-dev
npm install --save lodash
npm i webpack-dev-server -S -D

```

`dist/index.html`

```html
<!DOCTYPE html>
<html>
  <head>
    <title>Getting Started</title>
  </head>

  <body>
    <script src="main.js"></script>
  </body>
</html>
```

`src/index.js`

```javascript
import _ from "lodash";

function component() {
  const element = document.createElement("div");

  // Lodash, now imported by this script
  element.innerHTML = _.join(["Hello", "webpack"], " ");

  return element;
}
document.body.appendChild(component());
```

`package.json`

```json
{  
  "name": "webpack-demo",  
  "version": "1.0.0",  
  "description": "",  
  "private": true,  
  "scripts": {  
    "test": "echo \"Error: no test specified\" && exit 1",  
    "build": "webpack",  
    "dev": "webpack serve"  
 },  
  "keywords": [],  
  "author": "",  
  "license": "ISC",  
  "devDependencies": {  
    "webpack": "^5.61.0",  
    "webpack-cli": "^4.9.1",  
    "webpack-dev-server": "^4.4.0"  
 },  
  "dependencies": {  
    "lodash": "^4.17.21"  
 }  
}
```

那么我们可以直接使用如下命令进行打包

```shell
npm run build
```

执行打包命令，打包后会将`index.js`打包为`/dist/main.js`，我们打开 index.html，如果一切正常的话，我们可以在浏览器上看到`Hello webpack`字样

`webpack.config.js`

```javascript
const path = require("path");  
  
module.exports = {  
  devServer: {  
      static:'./dist'  
 },  
  mode: 'none',  
  entry: "./src/index.js",  
  
  output: {  
    filename: "main.js",  
    path: path.resolve(__dirname, "dist"),  
  },  
  
};
```

我们可以使用`npx webpack serve`启动 web 服务，默认会在 8080 端口上启动，根据webpack.config.js中的devServer配置的路径，默认会打开dist目录下的index.html页面

```shell
npm run dev
```

# 基础概念

本质上来说，webpack是一个用于现代javascript应用程序的静态模块打包工具

### 依赖(dependency graph)

每当一个文件依赖另外一个文件时，webpack都会将文件视为直接存在依赖关系。这使得webpack可以获取非代码资源，如images或web字体等，并将它们作为依赖提供给应用程序。

### 入口（entry）

入口指示webpack应使用哪个模块，作为构建其内部[[#依赖 dependency graph|依赖]]的开始。webpack会找出有哪些模块和库是入口起点（直接或间接）依赖的。

![[#entry]]

### 输出（output）

output属性告诉webpack在哪里输出它所创建的bundle，以及如何命名这些文件。

![[#output]]

### loader

loader用于对模块的源代码进行转换，即在`import`或者`load`模块时预处理文件。

![[#module#loader]]

[更多细节](https://webpack.docschina.org/concepts/loaders/)

### 插件

[参考](https://webpack.docschina.org/concepts/plugins/)
[内置插件](https://webpack.docschina.org/plugins/)

# 配置

webpack可以开箱即用，可以无需指定任何配置文件。你可以在项目根目录下创建一个 webpack.config.js 文件，然后 webpack 会自动使用它，也可以指定不同的配置文件

`package.json`

```json
"scripts": {
  "build": "webpack --config prod.config.js"
}
```

可通过如下命令生成一个标准规范的配置文件。

```
npx webpack-cli init
```

## entry

默认值是`./src/index.js`，指定一个或多个不同的[[#入口（entry）|入口]]，更多[细节参考](https://webpack.docschina.org/concepts/entry-points/)

```javascript
module.exports = {
  entry: './path/to/my/entry/file.js',
};
```

## output

默认值是`./dist/main.js`，其他生成文件默认方法`./dist/`文件夹中。

```javascript
const path = require('path');

module.exports = {
  entry: './path/to/my/entry/file.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'my-first-webpack.bundle.js',
  },
};
```

## module

#### loader

loader有两个属性

- test 识别哪些文件需要被转换
- use 使用哪个loader进行转换，其值可以是数组，其转换顺序是从后向前的

![[#导入 css 文件]]

## mode

默认值为 `production`，通过选择 `development`, `production` 或 `none` 之中的一个

```javascript
module.exports = {
  mode: 'production',
};
```

## resolve

设置模块如何被解析，[细节参考](https://webpack.docschina.org/configuration/resolve/)

#### alias

创建import或require的别名，来确保模块引入变得更简单，例如一些位于src文件夹下的常用模块

```javascript
const path = require('path');

module.exports = {
  //...
  resolve: {
    alias: {
      Utilities: path.resolve(__dirname, 'src/utilities/'),
      Templates: path.resolve(__dirname, 'src/templates/'),
    },
  },
};
```

那么当我们在导入使用相对路径时

```javascript
import Utility from '../../utilities/utility';
```

可以使用别名的方式

```javascript
import Utility from 'Utilities/utility';
```

可以给key的末尾加上`$`表示完全匹配

```javascript
const path = require('path');

module.exports = {
  //...
  resolve: {
    alias: {
      xyz$: path.resolve(__dirname, 'path/to/file.js'),
    },
  },
};
```

```javascript
import Test1 from 'xyz'; // 精确匹配，所以 path/to/file.js 被解析和导入
import Test2 from 'xyz/file.js'; // 非精确匹配，触发普通解析
```

## devServer

作为[webpack-dev-server](https://webpack.js.org/api/webpack-dev-server/)的[配置](https://www.webpackjs.com/configuration/dev-server/#devserver)

### before

前置网关

### proxy

使用[http-proxy-middleware](https://github.com/chimurai/http-proxy-middleware)，请查阅其[文档](https://github.com/chimurai/http-proxy-middleware#options)。

- 最简单的用法示例

  ```javascript
  mmodule.exports = {
    devServer: {
    	proxy: {
    	  "/api": {
    		target: "http://localhost:3000",
    	  }
    	}
    },
  };
  ```

  请求到`/api/xxx`现在会被代理到请求`http://localhost:3000/api/xxx`

- 如果想要代理多个路径到同一个地址，可以使用一个或多个具有 context 属性的对象构成的数组

  ```javascript
  mmodule.exports = {
    devServer: {
      proxy: [
        {
          context: ["/api", "/auth"],
          target: "http://localhost:3000",
        },
      ],
    },
  };
  ```

- 如果你不想传递`/api`，可以重写路径

  ```javascript
  mmodule.exports = {
  devServer: {
      proxy: [
      '/api':{
          target: "http://localhost:3000",
          pathRewrite:{'^/api',''},//原请求路径将被正则替换后加入到target地址后
          secure:false,//默认情况下，不接受https，设置为false即可
      },
      ],
  },
  };
  ```

  请求到`/api/xxx`现在会被代理到请求`http://localhost:3000/xxx`

- 使用 bypass 选项通过函数判断是否需要绕过代理，返回 false 或路径来跳过代理。

  ```javascript
  mmodule.exports = {
  devServer: {
      proxy: [
      '/api':{
          target: "http://localhost:3000",
          bypass:function(req,res,proxyOptions){

            if(req.header.accept.indexOfI('html')!== -1){
                console.log('skipping proxy from browser request.')
                return '/index.html';//return false
            }
          }
      },
      ],
  },
  };
  ```

代理过程可能遇到的一些问题，对于有些 target 地址，可能需要登录，从而将页面重定向（302）到登录页面，那么我们就需要保证请求时带上对应的 token

### after

后置网关

# 模块解析

[细节参考](https://webpack.docschina.org/concepts/module-resolution/)

resolver是一个帮助寻找模块绝对路径的库，一个模块可以作为另一个模块的依赖模块，然后被后者引用

如

```javascript
import foo from 'path/to/module';
// 或者
require('path/to/module');
```

resolver帮助webpack从`require/import`语句中，找到需要引入到bundle中的模块代码。当打包模块时，webpack使用enhanced-resolve来解析文件路径。

- 绝对路径
  ```javascript
  import '/home/me/file';
  ```
- 相对路径
  ```javascript
  import '../src/file1';
  import './file2';
  ```
- 模块路径 在 [`resolve.modules`] 中指定的所有目录检索模块。
  ```javascript
  import 'module';
  import 'module/lib/file';
  ```

# 示例

## 加载其他资源文件

修改`dist/index.html`

```diff
<!doctype html>
  <html>
    <head>
    <title>Asset Management</title>
    </head>
    <body>
-    <script src="main.js"></script>
+    <script src="bundle.js"></script>
    </body>
  </html>

```

修改`webpack.config.js`

```diff
 const path = require('path');

  module.exports = {
    entry: './src/index.js',
    output: {
-     filename: 'main.js',
+     filename: 'bundle.js',
      path: path.resolve(__dirname, 'dist'),
    },
  };
```

## 导入 css 文件

```shell
npm install --save-dev style-loader css-loader

```

修改`webpack.config.js`

```diff
 const path = require('path');

  module.exports = {
    entry: './src/index.js',
    output: {
      filename: 'bundle.js',
      path: path.resolve(__dirname, 'dist'),
    },
+  module: {
+    rules: [
+      {
+        test: /\.css$/,
+        use: [
+          'style-loader',
+          'css-loader',
+        ],
+      },
+    ],
+  },
  };
```

新增`src/style`文件

```css
.hello {
  color: red;
}
```

修改`src/index.js`

```diff
  import _ from 'lodash';
+ import './style.css';

  function component() {
    const element = document.createElement('div');

    // Lodash, now imported by this script
    element.innerHTML = _.join(['Hello', 'webpack'], ' ');
+   element.classList.add('hello');

    return element;
  }

  document.body.appendChild(component());

```

## 导入图片

```shell
npm install --save-dev file-loader
```

```diff
const path = require('path')

module.exports = {
    entry: './src/index.js',
    output: {
        filename: 'main.js',
        path: path.resolve(__dirname, 'dist'),
    },
    module: {
        rules: [
            {
                test: /\.css$/,
                use: [
                    'style-loader',
                    'css-loader',
                ]
            },
+           {
+               test: /\.(png|svg|jpg|gif)$/,
+               use: [
+                   'file-loader',
+               ],
+           },
        ]
    }
}

```

新增图片`src/icon.png`
修改`src/index.js`

```diff
  import _ from "lodash";
  import "./style.css";
+ import Icon from "./icon.png";

  function component() {
    const element = document.createElement("div");

    // Lodash, now imported by this script
    element.innerHTML = _.join(["Hello", "webpack"], " ");
    element.classList.add("hello");

+   // Add the image to our existing div.
+   const myIcon = new Image();
+   myIcon.src = Icon;

+   element.appendChild(myIcon);

    return element;
  }

  document.body.appendChild(component());
```

修改`src/style.css`

```diff
  .hello {
    color: red;
+   background: url('./icon.png');
  }
```

## 导入数据

```shell
npm install --save-dev csv-loader xml-loader
```

`webpack.config.js`

```diff
 const path = require('path');

  module.exports = {
    entry: './src/index.js',
    output: {
      filename: 'bundle.js',
      path: path.resolve(__dirname, 'dist'),
    },
    module: {
      rules: [
        {
          test: /\.css$/,
          use: [
            'style-loader',
            'css-loader'
          ],
        },
        {
          test: /\.(png|svg|jpg|gif)$/,
          use: [
            'file-loader',
          ],
        },
+      {
+        test: /\.(csv|tsv)$/,
+        use: [
+          'csv-loader',
+        ],
+      },
+      {
+        test: /\.xml$/,
+        use: [
+          'xml-loader',
+        ],
+      },
+     ],
     },
  };
```

增加一些数据

`src/data.xml`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<note>
  <to>Mary</to>
  <from>John</from>
  <heading>Reminder</heading>
  <body>Call Cindy on Tuesday</body>
</note>
```

`src/data.csv`

```csv
to,from,heading,body
Mary,John,Reminder,Call Cindy on Tuesday
Zoe,Bill,Reminder,Buy orange juice
Autumn,Lindsey,Letter,I miss you
```

`src/index.js`

```diff
  import _ from 'lodash';
  import './style.css';
  import Icon from './icon.png';
+ import Data from './data.xml';
+ import Notes from './data.csv';

  function component() {
    const element = document.createElement('div');

    // Lodash, now imported by this script
    element.innerHTML = _.join(['Hello', 'webpack'], ' ');
    element.classList.add('hello');

    // Add the image to our existing div.
    const myIcon = new Image();
    myIcon.src = Icon;

    element.appendChild(myIcon);

+   console.log(Data);
+   console.log(Notes);

    return element;
  }

  document.body.appendChild(component());
```

类似的数据文件还可以使用

`src/data.toml`

```toml
title = "TOML Example"

[owner]
name = "Tom Preston-Werner"
organization = "GitHub"
bio = "GitHub Cofounder & CEO\nLikes tater tots and beer."
dob = 1979-05-27T07:32:00Z
```

`src/data.yaml`

```yaml
title: YAML Example
owner:
  name: Tom Preston-Werner
  organization: GitHub
  bio: |-
    GitHub Cofounder & CEO
    Likes tater tots and beer.
  dob: 1979-05-27T07:32:00.000Z
```

`src/data.json5`

```json
{
  // comment
  "title": "JSON5 Example",
  "owner": {
    "name": "Tom Preston-Werner",
    "organization": "GitHub",
    "bio": "GitHub Cofounder & CEO\n\
Likes tater tots and beer.",
    "dob": "1979-05-27T07:32:00.000Z"
  }
}
```

需要安装相关插件

```shell
npm install toml yamljs json5 --save-dev
```

## 输出管理

通过 `html-webpack-plugin`自动生成 index.html，并引入相关资源
通过 `clean-webpack-plugin` 自动清理 dist 目录

```shell
npm install --save-dev html-webpack-plugin
npm install --save-dev clean-webpack-plugin
```

示例

`src/print.js`

```javascript
export default function printMe() {
  console.log("I get called from print.js!");
}
```

`src/index.js`

```diff
  import _ from 'lodash';
+ import printMe from './print.js';

  function component() {
    const element = document.createElement('div');
+   const btn = document.createElement('button');

    element.innerHTML = _.join(['Hello', 'webpack'], ' ');

+   btn.innerHTML = 'Click me and check the console!';
+   btn.onclick = printMe;
+
+   element.appendChild(btn);

    return element;
  }

  document.body.appendChild(component());
```

`webpack.config.js`

```diff
  const path = require('path');
+ const HtmlWebpackPlugin = require('html-webpack-plugin');
+ const { CleanWebpackPlugin } = require('clean-webpack-plugin');



  module.exports = {
-  entry: './src/index.js',
+  entry: {
+    app: './src/index.js',
+    print: './src/print.js',
+  },
+  plugins: [
+    new CleanWebpackPlugin(),
+    new HtmlWebpackPlugin({
+      title: 'Output Management',
+    }),
+  ],
    output: {
-    filename: 'bundle.js',
+    filename: '[name].bundle.js',
      path: path.resolve(__dirname, 'dist'),
    },
  };

```

## 统一输出 css 文件

使用插件[mini-css-extract-plugin](https://github.com/webpack-contrib/mini-css-extract-plugin)

```shell
npm install --save-dev mini-css-extract-plugin
```

`webpack.config.js`

```diff
  const { CleanWebpackPlugin } = require('clean-webpack-plugin')
  const HtmlWebpackPlugin = require('html-webpack-plugin')
+ const MiniCssExtractPlugin = require('mini-css-extract-plugin')
  const path = require('path')

  module.exports = {
      entry: {
          app: './src/index.js',
          print: './src/print.js',
      },
      output: {
          filename: '[name].bundle.js',
          path: path.resolve(__dirname, 'dist'),
      },
      plugins: [
          new CleanWebpackPlugin(),
+         new MiniCssExtractPlugin({
+             filename: 'main.css'
+         }),
          new HtmlWebpackPlugin({
              title: 'the output management'
          }
          )
      ],
      module: {
          rules: [
              {
                  test: /\.css$/,
+                 use: [MiniCssExtractPlugin.loader, 'css-loader']

              }
          ]
      }
  }

```

重新编译后在 dist 目录下生成了 main.css，且 index.html 中引入了 main.css

```shell
npm run build
```

# 参考文档

[官方入门文档](https://webpack.js.org/guides/getting-started/)
