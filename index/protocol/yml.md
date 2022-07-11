---
aliases: yml
tags:
  - protocol/yml
  - java
date updated: 2022-07-02 01:24
---

所有的 key 或 value 默认都不是 `str` 类型，会根据实际值转换为对应的类型，例如

```yml
no: 021  
yes:   
   - 0b10  
   - 0xFF   
   - OFF
```

```json
{False: 17, True: [2, 255, False]}
```

## 类型

### 集合类型

**`!!map`** [html](https://yaml.org/type/map.html) 

Unordered set of key: value pairs without duplicates.

**`!!omap`** [html](https://yaml.org/type/omap.html)

Ordered sequence of key: value pairs without duplicates.

**`!!pairs`** [html](https://yaml.org/type/pairs.html)

Ordered sequence of key: value pairs allowing duplicates.

**`!!set`** [html](https://yaml.org/type/set.html) 

Unordered set of non-equal values.

**`!!seq`** [html](https://yaml.org/type/seq.html)

Sequence of arbitrary values.

### 基础类型

**`!!binary`** [html](https://yaml.org/type/binary.html)

A sequence of zero or more octets (8 bit values).

**`!!bool`** [html](https://yaml.org/type/bool.html) 

```yaml
   bool:
	 - Y
	 - yes
	 - Yes
	 - YES
	 - n
	 - N
	 - no
	 - No
	 - NO
	 - true
	 - True
	 - TRUE
	 - false
	 - False
	 - FALSE
	 - on
	 - On
	 - ON
	 - off
	 - Off
	 - OFF
```

**`!!float`** [html](https://yaml.org/type/float.html)

Floating-point approximation to real numbers.

**`!!int`** [html](https://yaml.org/type/int.html)

```yml
int:
- 0b10  # 二进制  
- 0110  # 八进制 - 123   # 十进制  
- 0xFFFF # 十六进制  
- 11:59:59 # 六十进制，带冒号
- 110_110_11 # 数字可以添加下划线
```

**`!!merge`** [html](https://yaml.org/type/merge.html)

Specify one or more mappings to be merged with the current one.

**`!!null`** [html](https://yaml.org/type/null.html) 

Devoid of value.

**`!!str`** [html](https://yaml.org/type/str.html) 

A sequence of zero or more Unicode characters.

**`!!timestamp`** [html](https://yaml.org/type/timestamp.html)

A point in time.

**`!!value`** [html](https://yaml.org/type/value.html) 

Specify the default value of a mapping.

**`!!yaml`** [html](https://yaml.org/type/yaml.html)

Keys for encoding YAML in YAML.

##  对应java类型

|YAML tag          |Java type                                        |
|------------------|-------------------------------------------------|
|Standard YAML tags|                                                 |
|!!null            |null                                             |
|!!bool            |Boolean                                          |
|!!int             |Integer, Long, BigInteger                        |
|!!float           |Double                                           |
|!!binary          |byte[], String                                   |
|!!timestamp       |java.util.Date, java.sql.Date, java.sql.Timestamp|
|!!omap, !!pairs   |List of Object[]                                 |
|!!set             |Set                                              |
|!!str             |String                                           |
|!!seq             |List                                             |
|!!map             |Map                                              |

## 注意事项

当配置值以0开头时，会被视为八进制数字，字符串需要显示的声明，一些默认字符会有特殊含义

```yml
code: 021        # 实际值为 17

code: '021'      # 实际值为 021
code: !!str 021  # 实际值为 021
```

## 参考文档

[YAML Ain’t Markup Language (YAML™) Version 1.1](https://yaml.org/spec/1.1/#id891745)
