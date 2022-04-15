---
tags:
  - java/框架/okhttp
date updated: 2022-04-15 14:53
---

一个方便的HTTP工具库，类似 [[restTemplate]]

```xml
<dependency>  
   <groupId>com.squareup.okhttp3</groupId>  
   <artifactId>okhttp</artifactId>  
   <version>3.5.0</version>  
</dependency>
```

```java

OkHttpClient client = new OkHttpClient();

Request request = new Request.Builder()
			.get()
			.url("https:www.baidu.com")
			.build();

Call call = client.newCall(request);
//同步调用
response response = call.execute();

//http返回码
system.out.println(response.message());

//返回报文
system.out.println(new string(response.body().bytes()));


//异步调用
call.enqueue(new Callback() {  
    @Override  
 public void onFailure(Call call, IOException e) {  
  
    }  
  
    @Override  
 public void onResponse(Call call, Response response) throws IOException {  
  
    }  
});




//提交表单
FormBody formBody = new FormBody.Builder()
                .add("username", "admin")
                .add("password", "admin")
                .build();

final Request request = new Request.Builder()
			    .url("https:www.baidu.com")
                .post(formBody)
                .build();


//提交json
String json = "{}";  
Request request = new Request.Builder()  
        .url("https:www.baidu.com")  
        .addHeader("content-type","application.json")  
        .post(RequestBody.create(MediaType.parse("application/json;charset=utf-8"),json))  
        .build();
```
