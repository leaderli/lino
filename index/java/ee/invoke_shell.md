---
aliases: 使用 shell
tags:
  - java/ee/invoke_shell
date updated: 2022-04-15 15:19
---

```ad-info
脚本中如果有使用环境变量的地方，需要先执行source 命令
```

```java
//获取当前系统名称，可根据不同系统调用不同的命令
String os = System.getProperty("os.name");
//命令行的参数
String [] para = new String[]{"-l"}
//执行命令
Process ls = Runtime.getRuntime().exec("ls",para, new File("/Users/li/Downloads"));



//获取命令执行结果的inputstream流
String getLs = new BufferedReader(new InputStreamReader(ls.getInputStream())).lines().collect(Collectors.joining(System.lineSeparator()));

//在目录下执行具体的命令
//因为java执行shell无法进行连续性的交互命令，通过封装的bash或者python脚本执行一系列命令是比较好的选择
Process process = Runtime.getRuntime().exec("python test.py", null, new File("/Users/li/Downloads"));
// 部分os需要先输出outputStream流，才能正确取得shell执行结果
Outputstream out = process.getOutputStream();
out.flush();
out.close();

//使用构造器模式
ProcessBuilder builder = new ProcessBuilder();
builder.command("more","test.py");
builder.directory(new File("/Users/li/Downloads"));
//重定向错误流，即System.Err
builder.redirectErrorStream(true);
Process process = builder.start();





// 设定一些环境变量
builder.environment().put("some_variable","uat")
	
// source
builder.command("source","~/.bash_profile")	
```
