---
date created: 2022-03-22 17:22
tags:
  - 话务/avaya
  - ivr
date updated: 2022-07-14 23:11
---

## 一通会话的进线过程

1. 用户拨打电话
2. 电信运营商接入会话，根据被叫号将会话接入卡中心
3. 卡中心硬件板卡将模拟电路信号转换为数字信号
4. SystemManager
5. epm
6. mpp
7. asr
8. tts
9. ivr
10. 座席


```mermaid
graph LR
    1[客户]-->2[运营商]
    2-->|isdn/sip/模拟信号|3[avaya硬件板卡]
    3-->|数字信号|4[SystemManager]
    6-->|CCXML|10[座席]
    subgraph avaya
        4-->5[epm]
        5-->6[mpp]
        5-.->|配置|7[asr]
        5-.->|配置|8[tts]
        5-.->|配置|9[ivr]
        6-->|MRCP|7[asr]
        6-->|MRCP|8[tts]
        6-->|VXML|9[ivr]
    end
```

aaod 开发过程的一些设想

- 多模块的开发，在 maven 运行前将非公共流程的代码，通过 shell 脚本合并到一起，然后将所有模块打包成一个应用。涉及到跨模块的流程调用，统一使用一个虚拟的公共流程做跳板，对流程的出口做预设处理。
- 挂机流程中注册回调流程。指定的流程中触发挂机事件需要跳转到回调流程中。

## epm

可通过[官网](https://support.avaya.com/documents/)下载
![[ExperiencePortal7.0.1DocumentationLibrary.zip]]

epm一般使用postgres数据库

一般情况下切换到postgres用户

```shell
psql -U postgres -d VoicePortal

# \dt 查找所有表
VoiceProtal# \dt

```

### 一些设置

![[epm_settings_vxml_timeout.png]]

```ad-info
IVR应用如果使用F5地址需要做session保持
```

## 计算UUI

当通过sip传递数据时，sip会默认转为hex格式
![[Pasted image 20211122180136.png]]
一般情况想，UUI根据非ASCII标准字符作为分隔符
例如:

`PD,00,FA,03E80E34619B2A50,C8,03E80E34619B2A50`

一般情况下

- FA表示当前callid
- C8表示自定义字段，一般是sip消息里的user-to-user

> 00C8143031303030313139303231363330333138363239FA0803E82E7E612CB025

00表示起始符号

```java
public void decode(String hex) {

    for (int i = 0; i < hex.length(); i = i + 2) {
        String tag = hex.substring(i, i + 2);

        int mark = Integer.valueOf(tag, 16);

        if (mark > 0X7F) {// 非标准ASCII

            int start = i + 2;
            int len = Integer.valueOf(hex.substring(start, start + 2), 16) * 2;

            i = start + len;

            if ((i + 2) < hex.length()) {
                String value = hex.substring(start + 2, i + 2);
                System.out.println(tag + " " + len + " " + value +" "+decodeHex(value) );
            }

        }
    }
}

private String decodeHex(String hex) {
    BigInteger big = new BigInteger(hex,16);
    return new String(big.toByteArray());
}
```

## TTS ASR

- `/opt/Tomcat/apache-tomcat-6.0.41/lib/config/languages.properties`
- `/opt/Tomcat/apache-tomcat-6.0.41/lib/messeages/languages.properties`

语音服务器中的配置音色需要全选所有音色

语音服务器中同一个引擎类型的，可以配置多个不同IP的语音服务器，这样可以实现负载的功能。

配置文件大小写敏感

```ad-info
title:只有首通电话首次TTS播报成功，其他都不播报，过一分钟后再次拨打，只有首次成功

长连接问题，avaya平台在一次长连接中进行多次合成操作，在第一次播报tts播报以后会发送一个rtcp的`goodbye`消息。需要将科大`mrs.cfg`文件中的`discard ob bye`的参数设置为`false`
```

```ad-info
title: tts 播报40s超时

1. 抓包tts，ep平台在40s后发送`end`命令
2. ep平台报错`PSESM00070`和`PTTS_00019`
3. `/opt/Avaya/ExperiencePortal/MPP/config`修改`mppconfig.xml`，将参数`mpp.mrcpsessionrefresh.timer`设置为合适的值
```

tts可以使用ssml的语法编写

## IVR

在End节点中，增加返回参数`AAI`，向其中赋值参数，avaya平台会自动将其拼接到`C8`后面

```xml
<form>
	<property name="fetchaudiodelay" value="1s"/>
	<property name="fetchaudio" value="music.wav"/>
	<block>
		<submit next="next?id='123'"/>
	</block>
</form>
```


avaya返回vxml时也会将sessionID放入到cookie中，从而F5等可以实现session保持。

```c
JESSIONID=03E80E97619B5627;Path=/Hello;HttpOnly
__DDESSIONID=03E80E97619B5627;Path=/Hello;HttpOnly
```


### fetchaudio

异步播音

## ccxml

一些方便使用的script脚本，因为ccxml中的js引擎版本较低，有些方法是不支持的

```js
# 转换json为obj
function parseJson(String json){
	return eval("("+json+")");
}

function keys(obj){
	
	var result = "\n";
	
	if(typeof obj === "object"){
	
		for(key in obj){
			result += key + "\n";
		}
	}
}

function objToString(obj){
	
	var result = "[\n";
	result += extractprops("",obj);
	result += "]";
	return result;
}


function extractprops(parent, obj, skip) {

    if (obj === undefined || typeof obj !== 'object') {
        return obj + ""
    }
    var name, result = "";

    var count = 0;

    for (key in obj) {

		//小于号需要使用HTML转义符
        if (skip &lt; count) {
            continue
        }
        count++;
        name = parent + key
        var value = obj[key]

        if (typeof value === "object") {

            result += extractprops(name, value);
        } else {
            result += name + ":" + value + "\n"
        }
    }
    return result;
}

```

### redirect

指定AAI

AAI必须严格按照格式，必须为类型加16进制的表现形式

```xml
<var name="dialog_values" expr="parseJson('{}')"/>  
<assign name="dialog_values.AAI" expr="event$.connection.aai+'C8,03E80E34619B2A50'"/>  
<redirect connectionid="main_connectionid" dest="event$.uri" hints="dialog_values"/>
```

### 日志

一般在
在`/opt/Avaya/ExperienceProtal/MPP/logs/records/2021/09/23`下
也有可能在`/opt/Avaya/ExperienceProtal/MPP/logs/process/CXI`下，通过`tail -f CCXML-SessionSlot-*`追踪

### event$

ccxml中可以使用的变量

```yml
connection:
	connectionid: 301994428
	state: CONNECTED 
	local:  10086 #被叫
	remote: 123456 # 主叫
	protocol:
		name: sip # 下面一般跟着具体协议名的请求报文详情
		sip: 
			callid: 
			contact:
			extension:
			from:
			historyinfo:
			media:
			passertedid:
			request:
			requestmethod:
			requesturi:
			requestversion:
			requrie:
			support:
			unkonwnhdr:
			useragent:
			via:
			
		version: 1
	aai: PD,00,FA,03E80E97619B5627,C8,03E80E97619B5627
	originator: remote
	input: undeined
	outputs:
	avaya:
		ucid: 01000037351637570087 # callid
		uui:
			shared:  #表现形式为 uui.shared.0.id.PD，一般等同于aai
				 '0':
					id: PD
					value: 00
				 '1':
					id: FA # 一般为UCID
					value: 03E80E97619B5627
				 '2': 
					id: C8 # 扩展字段
					value: 03E80E97619B5627
connectionid: 301994428
eventid: 369103926
eventsource: shaep-2021326095244-8
eventsourcetype: AvayaVoicePortal
info: 
name: name.connection.connected
protocol: sip

```

### 打印所有事件

```xml
<transition event="">
	<log expr="'------missed : ' + event$.name">
	<log expr="' eventData\n ' + objectToString(event$)">
</transition>
```

## 常见问题

```ad-error
title: 按键无效，播音卡顿

一般是由于中继线的问题
```

