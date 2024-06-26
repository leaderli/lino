---
tags:
  - linux/commands/man
  - search
date updated: 2024-04-22 19:30
---

在 man 的帮助手册中，将帮助文档分为了 9 个类别，对于有的关键字可能存在多个类别，我们就需要指定特定的类别来查看，一般 bash 命令在 1 类别中。如 `printf` 的三类别，可以使用`man 3 printf`来查看

- `-k` 搜索命令，通常用于在只记得部分命令关键词的场合。


| 按键        | 说明                    |
| --------- | --------------------- |
| 空格键       | 向下翻一页                 |
| PaGe down | 向下翻一页                 |
| PaGe up   | 向上翻一页                 |
| home      | 直接前往首页                |
| end       | 直接前往尾页                |
| /         | 从上至下搜索某个关键词，如“/linux” |
| ?         | 从下至上搜索某个关键词，如“?linux” |
| n         | 定位到下一个搜索到的关键词         |
| N         | 定位到上一个搜索到的关键词         |
| q         | 退出帮助文档                |

### 显示 ASCII 表

```shell
man ascii
```

当提示

> No manual entry for ascii

| 十进制  <br>DEC | 八进制  <br>OCT | 十六进制  <br>HEX | 二进制  <br>BIN | 符号  <br>Symbol | HTML  <br>实体编码 | 中文解释  <br>Description |
| ------------ | ------------ | ------------- | ------------ | -------------- | -------------- | --------------------- |
| 0            | 000          | 00            | 00000000     | NUL            | �              | 空字符 终止符               |
| 1            | 001          | 01            | 00000001     | SOH            | �              | 标题开始                  |
| 2            | 002          | 02            | 00000010     | STX            | �              | 正文开始                  |
| 3            | 003          | 03            | 00000011     | ETX            | �              | 正文结束                  |
| 4            | 004          | 04            | 00000100     | EOT            | �              | 传输结束                  |
| 5            | 005          | 05            | 00000101     | ENQ            | �              | 询问                    |
| 6            | 006          | 06            | 00000110     | ACK            | �              | 收到通知                  |
| 7            | 007          | 07            | 00000111     | BEL            | �              | 铃                     |
| 8            | 010          | 08            | 00001000     | BS             | �              | 退格                    |
| 9            | 011          | 09            | 00001001     | HT             | 	              | 水平制表符                 |
| 10           | 012          | 0A            | 00001010     | LF             | &#xA;          | 换行符 \n                |
| 11           | 013          | 0B            | 00001011     | VT             | �              | 垂直制表符                 |
| 12           | 014          | 0C            | 00001100     | FF             |               | 换页符                   |
| 13           | 015          | 0D            | 00001101     | CR             | &#xD;          | 回车符 \r                |
| 14           | 016          | 0E            | 00001110     | SO             | �              | 移出                    |
| 15           | 017          | 0F            | 00001111     | SI             | �              | 移入                    |
| 16           | 020          | 10            | 00010000     | DLE            | �              | 数据链路转义                |
| 17           | 021          | 11            | 00010001     | DC1            | �              | 设备控制 1                |
| 18           | 022          | 12            | 00010010     | DC2            | �              | 设备控制 2                |
| 19           | 023          | 13            | 00010011     | DC3            | �              | 设备控制 3                |
| 20           | 024          | 14            | 00010100     | DC4            | �              | 设备控制 4                |
| 21           | 025          | 15            | 00010101     | NAK            | �              | 拒绝接收                  |
| 22           | 026          | 16            | 00010110     | SYN            | �              | 同步空闲                  |
| 23           | 027          | 17            | 00010111     | ETB            | �              | 传输块结束                 |
| 24           | 030          | 18            | 00011000     | CAN            | �              | 取消                    |
| 25           | 031          | 19            | 00011001     | EM             | �              | 介质中断                  |
| 26           | 032          | 1A            | 00011010     | SUB            | �              | 替换                    |
| 27           | 033          | 1B            | 00011011     | ESC            | �              | 换码符                   |
| 28           | 034          | 1C            | 00011100     | FS             | �              | 文件分隔符                 |
| 29           | 035          | 1D            | 00011101     | GS             | �              | 组分隔符                  |
| 30           | 036          | 1E            | 00011110     | RS             | �              | 记录分离符                 |
| 31           | 037          | 1F            | 00011111     | US             | �              | 单元分隔符                 |

十进制 32~127 区间一共 **127-32+1=96** 个ASCII码表示的符号，在我们的键盘上都可以被找到。其中：32表示空格，127表示删除命令。

| 十进制  <br>DEC | 八进制  <br>OCT | 十六进制  <br>HEX | 二进制  <br>BIN | 符号  <br>Symbol | HTML  <br>实体编码 | 中文解释  <br>Description |
| ------------ | ------------ | ------------- | ------------ | -------------- | -------------- | --------------------- |
| 32           | 040          | 20            | 00100000     |                | 空格             |                       |
| 33           | 041          | 21            | 00100001     | !              | !              | 感叹号                   |
| 34           | 042          | 22            | 00100010     | "              | "              | 双引号                   |
| 35           | 043          | 23            | 00100011     | #              | #              | 井号                    |
| 36           | 044          | 24            | 00100100     | $              | $              | 美元符                   |
| 37           | 045          | 25            | 00100101     | %              | %              | 百分号                   |
| 38           | 046          | 26            | 00100110     | &              | &              | 与                     |
| 39           | 047          | 27            | 00100111     | '              | '              | 单引号                   |
| 40           | 050          | 28            | 00101000     | (              | (              | 左括号                   |
| 41           | 051          | 29            | 00101001     | )              | )              | 右括号                   |
| 42           | 052          | 2A            | 00101010     | *              | *              | 星号                    |
| 43           | 053          | 2B            | 00101011     | +              | +              | 加号                    |
| 44           | 054          | 2C            | 00101100     | ,              | ,              | 逗号                    |
| 45           | 055          | 2D            | 00101101     | -              | -              | 连字号或减号                |
| 46           | 056          | 2E            | 00101110     | .              | .              | 句点或小数点                |
| 47           | 057          | 2F            | 00101111     | /              | /              | 斜杠                    |
| 48           | 060          | 30            | 00110000     | 0              | 0              | 0                     |
| 49           | 061          | 31            | 00110001     | 1              | 1              | 1                     |
| 50           | 062          | 32            | 00110010     | 2              | 2              | 2                     |
| 51           | 063          | 33            | 00110011     | 3              | 3              | 3                     |
| 52           | 064          | 34            | 00110100     | 4              | 4              | 4                     |
| 53           | 065          | 35            | 00110101     | 5              | 5              | 5                     |
| 54           | 066          | 36            | 00110110     | 6              | 6              | 6                     |
| 55           | 067          | 37            | 00110111     | 7              | 7              | 7                     |
| 56           | 070          | 38            | 00111000     | 8              | 8              | 8                     |
| 57           | 071          | 39            | 00111001     | 9              | 9              | 9                     |
| 58           | 072          | 3A            | 00111010     | :              | :              | 冒号                    |
| 59           | 073          | 3B            | 00111011     | ;              | ;              | 分号                    |
| 60           | 074          | 3C            | 00111100     | <              | <              | 小于                    |
| 61           | 075          | 3D            | 00111101     | =              | =              | 等号                    |
| 62           | 076          | 3E            | 00111110     | >              | >              | 大于                    |
| 63           | 077          | 3F            | 00111111     | ?              | ?              | 问号                    |
| 64           | 100          | 40            | 01000000     | @              | @              | 电子邮件符号                |
| 65           | 101          | 41            | 01000001     | A              | A              | 大写字母 A                |
| 66           | 102          | 42            | 01000010     | B              | B              | 大写字母 B                |
| 67           | 103          | 43            | 01000011     | C              | C              | 大写字母 C                |
| 68           | 104          | 44            | 01000100     | D              | D              | 大写字母 D                |
| 69           | 105          | 45            | 01000101     | E              | E              | 大写字母 E                |
| 70           | 106          | 46            | 01000110     | F              | F              | 大写字母 F                |
| 71           | 107          | 47            | 01000111     | G              | G              | 大写字母 G                |
| 72           | 110          | 48            | 01001000     | H              | H              | 大写字母 H                |
| 73           | 111          | 49            | 01001001     | I              | I              | 大写字母 I                |
| 74           | 112          | 4A            | 01001010     | J              | J              | 大写字母 J                |
| 75           | 113          | 4B            | 01001011     | K              | K              | 大写字母 K                |
| 76           | 114          | 4C            | 01001100     | L              | L              | 大写字母 L                |
| 77           | 115          | 4D            | 01001101     | M              | M              | 大写字母 M                |
| 78           | 116          | 4E            | 01001110     | N              | N              | 大写字母 N                |
| 79           | 117          | 4F            | 01001111     | O              | O              | 大写字母 O                |
| 80           | 120          | 50            | 01010000     | P              | P              | 大写字母 P                |
| 81           | 121          | 51            | 01010001     | Q              | Q              | 大写字母 Q                |
| 82           | 122          | 52            | 01010010     | R              | R              | 大写字母 R                |
| 83           | 123          | 53            | 01010011     | S              | S              | 大写字母 S                |
| 84           | 124          | 54            | 01010100     | T              | T              | 大写字母 T                |
| 85           | 125          | 55            | 01010101     | U              | U              | 大写字母 U                |
| 86           | 126          | 56            | 01010110     | V              | V              | 大写字母 V                |
| 87           | 127          | 57            | 01010111     | W              | &#087          | 大写字母 W                |
| 88           | 130          | 58            | 01011000     | X              | X              | 大写字母 X                |
| 89           | 131          | 59            | 01011001     | Y              | Y              | 大写字母 Y                |
| 90           | 132          | 5A            | 01011010     | Z              | Z              | 大写字母 Z                |
| 91           | 133          | 5B            | 01011011     | [              | [              | 左中括号                  |
| 92           | 134          | 5C            | 01011100     | |\\            | 反斜杠            |                       |
| 93           | 135          | 5D            | 01011101     | ]              | ]              | 右中括号                  |
| 94           | 136          | 5E            | 01011110     | ^              | ^              | 音调符号                  |
| 95           | 137          | 5F            | 01011111     | _              | _              | 下划线                   |
| 96           | 140          | 60            | 01100000     | `              | `              | 重音符                   |
| 97           | 141          | 61            | 01100001     | a              | a              | 小写字母 a                |
| 98           | 142          | 62            | 01100010     | b              | b              | 小写字母 b                |
| 99           | 143          | 63            | 01100011     | c              | c              | 小写字母 c                |
| 100          | 144          | 64            | 01100100     | d              | d              | 小写字母 d                |
| 101          | 145          | 65            | 01100101     | e              | e              | 小写字母 e                |
| 102          | 146          | 66            | 01100110     | f              | f              | 小写字母 f                |
| 103          | 147          | 67            | 01100111     | g              | g              | 小写字母 g                |
| 104          | 150          | 68            | 01101000     | h              | h              | 小写字母 h                |
| 105          | 151          | 69            | 01101001     | i              | i              | 小写字母 i                |
| 106          | 152          | 6A            | 01101010     | j              | j              | 小写字母 j                |
| 107          | 153          | 6B            | 01101011     | k              | k              | 小写字母 k                |
| 108          | 154          | 6C            | 01101100     | l              | l              | 小写字母 l                |
| 109          | 155          | 6D            | 01101101     | m              | m              | 小写字母 m                |
| 110          | 156          | 6E            | 01101110     | n              | n              | 小写字母 n                |
| 111          | 157          | 6F            | 01101111     | o              | o              | 小写字母 o                |
| 112          | 160          | 70            | 01110000     | p              | p              | 小写字母 p                |
| 113          | 161          | 71            | 01110001     | q              | q              | 小写字母 q                |
| 114          | 162          | 72            | 01110010     | r              | r              | 小写字母 r                |
| 115          | 163          | 73            | 01110011     | s              | s              | 小写字母 s                |
| 116          | 164          | 74            | 01110100     | t              | t              | 小写字母 t                |
| 117          | 165          | 75            | 01110101     | u              | u              | 小写字母 u                |
| 118          | 166          | 76            | 01110110     | v              | v              | 小写字母 v                |
| 119          | 167          | 77            | 01110111     | w              | w              | 小写字母 w                |
| 120          | 170          | 78            | 01111000     | x              | x              | 小写字母 x                |
| 121          | 171          | 79            | 01111001     | y              | y              | 小写字母 y                |
| 122          | 172          | 7A            | 01111010     | z              | z              | 小写字母 z                |
| 123          | 173          | 7B            | 01111011     | {              | {              | 左大括号                  |
| 124          | 174          | 7C            | 01111100     | |              | |              | 垂直线                   |
| 125          | 175          | 7D            | 01111101     | }              | }              | 右大括号                  |
| 126          | 176          | 7E            | 01111110     | ~              | ~              | 波浪号                   |
| 127          | 177          | 7F            | 01111111     | �              | 删除             |                       |

## **扩展ASCII码**

后128个称为扩展**ASCII码**。许多基于x86的系统都支持使用扩展（或“高”）**ASCII**。扩展**ASCII码**允许将每个字符的第8 位用于确定附加的128 个特殊符号字符、外来语字母和图形符号。

| 十进制  <br>DEC | 八进制  <br>OCT | 十六进制  <br>HEX | 二进制  <br>BIN | 符号  <br>Symbol | HTML  <br>实体编码 | 中文解释  <br>Description           |
| ------------ | ------------ | ------------- | ------------ | -------------- | -------------- | ------------------------------- |
| 128          | 200          | 80            | 10000000     | €              | �              | 欧盟符号                            |
| 129          | 201          | 81            | 10000001     |                |                |                                 |
| 130          | 202          | 82            | 10000010     | ‚              | �              | 单低 9 引号                         |
| 131          | 203          | 83            | 10000011     | ƒ              | �              | 带钩的  <br>拉丁小写字母f                |
| 132          | 204          | 84            | 10000100     | „              | �              | 双低 9 引号                         |
| 133          | 205          | 85            | 10000101     | …              | �              | 水平省略号                           |
| 134          | 206          | 86            | 10000110     | †              | �              | 剑号                              |
| 135          | 207          | 87            | 10000111     | ‡              | �              | 双剑号                             |
| 136          | 210          | 88            | 10001000     | ˆ              | �              | 修正字符  <br>抑扬音符号                 |
| 137          | 211          | 89            | 10001001     | ‰              | �              | 千分号                             |
| 138          | 212          | 8A            | 10001010     | Š              | �              | 带弯音号的  <br>拉丁大写字母 S             |
| 139          | 213          | 8B            | 10001011     | ‹              | �              | 左单书名号                           |
| 140          | 214          | 8C            | 10001100     | Œ              | �              | 拉丁大写组合 OE                       |
| 141          | 215          | 8D            | 10001101     |                |                |                                 |
| 142          | 216          | 8E            | 10001110     | Ž              | �              | 带弯音号的  <br>拉丁大写字母 z             |
| 143          | 217          | 8F            | 10001111     |                |                |                                 |
| 144          | 220          | 90            | 10010000     |                |                |                                 |
| 145          | 221          | 91            | 10010001     | ‘              | �              | 左单引号                            |
| 146          | 222          | 92            | 10010010     | ’              | �              | 右单引号                            |
| 147          | 223          | 93            | 10010011     | “              | �              | 左双引号                            |
| 148          | 224          | 94            | 10010100     | ”              | �              | 右双引号                            |
| 149          | 225          | 95            | 10010101     | •              | �              |                                 |
| 150          | 226          | 96            | 10010110     | –              | �              | 半长破折号                           |
| 151          | 227          | 97            | 10010111     | —              | �              | 全长破折号                           |
| 152          | 230          | 98            | 10011000     | ˜              | �              | 小波浪线                            |
| 153          | 231          | 99            | 10011001     | ™              | �              |                                 |
| 154          | 232          | 9A            | 10011010     | š              | �              | 带弯音号的  <br>拉丁小写字母 s             |
| 155          | 233          | 9B            | 10011011     | ›              | �              | 右单书名号                           |
| 156          | 234          | 9C            | 10011100     | œ              | �              | 拉丁小写组合 oe                       |
| 157          | 235          | 9D            | 10011101     |                |                |                                 |
| 158          | 236          | 9E            | 10011110     | ž              | �              | 带弯音号的  <br>拉丁小写字母 z             |
| 159          | 237          | 9F            | 10011111     | Ÿ              | �              | 带弯音号的  <br>拉丁大写字母 Y             |
| 160          | 240          | A0            | 10100000     |                |                |                                 |
| 161          | 241          | A1            | 10100001     | ¡              | ¡              | 反向感叹号                           |
| 162          | 242          | A2            | 10100010     | ¢              | ¢              | 分币符号                            |
| 163          | 243          | A3            | 10100011     | £              | £              | 英磅符号                            |
| 164          | 244          | A4            | 10100100     | ¤              | ¤              |                                 |
| 165          | 245          | A5            | 10100101     | ¥              | ¥              | 人民币符号                           |
| 166          | 246          | A6            | 10100110     | ¦              | ¦              |                                 |
| 167          | 247          | A7            | 10100111     | §              | §              | 章节符号                            |
| 168          | 250          | A8            | 10101000     | ¨              | ¨              | 通用货币符号                          |
| 169          | 251          | A9            | 10101001     | ©              | ©              | 版权符号                            |
| 170          | 252          | AA            | 10101010     | ª              | ª              | 阴性顺序  <br>指示符号                  |
| 171          | 253          | AB            | 10101011     | «              | «              | 左角引号                            |
| 172          | 254          | AC            | 10101100     | ¬              | ¬              |                                 |
| 173          | 255          | AD            | 10101101     | ­              | ­              |                                 |
| 174          | 256          | AE            | 10101110     | ®              | ®              |                                 |
| 175          | 257          | AF            | 10101111     | ¯              | ¯              |                                 |
| 176          | 260          | B0            | 10110000     | °              | °              | 温度符号                            |
| 177          | 261          | B1            | 10110001     | ±              | ±              | 加/减号                            |
| 178          | 262          | B2            | 10110010     | ²              | ²              | 上标 2                            |
| 179          | 263          | B3            | 10110011     | ³              | ³              | 上标 3                            |
| 180          | 264          | B4            | 10110100     | ´              | ´              |                                 |
| 181          | 265          | B5            | 10110101     | µ              | µ              | 微符号                             |
| 182          | 266          | B6            | 10110110     | ¶              | ¶              | 段落符号，  <br>pilcrow              |
| 183          | 267          | B7            | 10110111     | ·              | ·              | 中点                              |
| 184          | 270          | B8            | 10111000     | ¸              | ¸              |                                 |
| 185          | 271          | B9            | 10111001     | ¹              | ¹              | 上标 1                            |
| 186          | 272          | BA            | 10111010     | º              | º              | 阳性顺序  <br>指示符                   |
| 187          | 273          | BB            | 10111011     | »              | »              | 右角引号                            |
| 188          | 274          | BC            | 10111100     | ¼              | ¼              | 分数四分之一                          |
| 189          | 275          | BD            | 10111101     | ½              | ½              | 分数二分之一                          |
| 190          | 276          | BE            | 10111110     | ¾              | ¾              |                                 |
| 191          | 277          | BF            | 10111111     | ¿              | ¿              | 反向问号                            |
| 192          | 300          | C0            | 11000000     | À              | À              | 带重音符  <br>的大写字母 A               |
| 193          | 301          | C1            | 11000001     | Á              | Á              | 带尖锐重音  <br>的大写字母 A              |
| 194          | 302          | C2            | 11000010     | Â              | Â              | 带音调符号  <br>的大写字母 A              |
| 195          | 303          | C3            | 11000011     | Ã              | Ã              | 带代字号  <br>的大写字母 A               |
| 196          | 304          | C4            | 11000100     | Ä              | Ä              | 带元音变音  <br>(分音符号)  <br>的大写字母 A  |
| 197          | 305          | C5            | 11000101     | Å              | Å              | 带铃声  <br>的大写字母 A                |
| 198          | 306          | C6            | 11000110     | Æ              | Æ              | 大写字母 AE  <br>双重元音               |
| 199          | 307          | C7            | 11000111     | Ç              | Ç              | 带变音符号  <br>的大写字母 C              |
| 200          | 310          | C8            | 11001000     | È              | È              | 带重音符  <br>的大写字母 E               |
| 201          | 311          | C9            | 11001001     | É              | É              | 带尖锐重音  <br>的大写字母 E              |
| 202          | 312          | CA            | 11001010     | Ê              | Ê              | 带音调符号  <br>的大写字母 E              |
| 203          | 313          | CB            | 11001011     | Ë              | Ë              | 带元音变音  <br>(分音符号)  <br>的大写字母 E  |
| 204          | 314          | CC            | 11001100     | Ì              | Ì              | 带重音符  <br>的大写字母 I               |
| 205          | 315          | CD            | 11001101     | Í              | Í              | 带尖锐重音  <br>的大写字母 I              |
| 206          | 316          | CE            | 11001110     | Î              | Î              | 带音调符号  <br>的大写字母 I              |
| 207          | 317          | CF            | 11001111     | Ï              | Ï              | 带元音变音  <br>(分音符号)  <br>的大写字母 I  |
| 208          | 320          | D0            | 11010000     | Ð              | Ð              |                                 |
| 209          | 321          | D1            | 11010001     | Ñ              | Ñ              | 带代字号  <br>的大写字母 N               |
| 210          | 322          | D2            | 11010010     | Ò              | Ò              | 带重音符  <br>的大写字母 O               |
| 211          | 323          | D3            | 11010011     | Ó              | Ó              | 带尖锐重音  <br>的大写字母 O              |
| 212          | 324          | D4            | 11010100     | Ô              | Ô              | 带音调符号  <br>的大写字母 O              |
| 213          | 325          | D5            | 11010101     | Õ              | Õ              | 带代字号  <br>的大写字母 O               |
| 214          | 326          | D6            | 11010110     | Ö              | Ö              | 带元音变音  <br>(分音符号)  <br>的大写字母 O  |
| 215          | 327          | D7            | 11010111     | ×              | ×              | 大写字母  <br>OE 连字                 |
| 216          | 330          | D8            | 11011000     | Ø              | Ø              | 带斜杠  <br>的大写字母 O                |
| 217          | 331          | D9            | 11011001     | Ù              | Ù              | 带重音符  <br>的大写字母 U               |
| 218          | 332          | DA            | 11011010     | Ú              | Ú              | 带尖锐重音  <br>的大写字母 U              |
| 219          | 333          | DB            | 11011011     | Û              | Û              | 带音调符号  <br>的大写字母 U              |
| 220          | 334          | DC            | 11011100     | Ü              | Ü              | 带元音变音  <br>(分音符号)  <br>的大写字母 U  |
| 221          | 335          | DD            | 11011101     | Ý              | Ý              | 带元音变音  <br>(分音符号)  <br>的大写字母 Y  |
| 222          | 336          | DE            | 11011110     | Þ              | Þ              |                                 |
| 223          | 337          | DF            | 11011111     | ß              | ß              | 德语高调  <br>小写字母 s                |
| 224          | 340          | E0            | 11100000     | à              | à              | 带重音符  <br>的小写字母 a               |
| 225          | 341          | E1            | 11100001     | á              | á              | 带尖锐重音  <br>的小写字母 a              |
| 226          | 342          | E2            | 11100010     | â              | â              | 带音调符号  <br>的小写字母 a              |
| 227          | 343          | E3            | 11100011     | ã              | ã              | 带代字号  <br>的小写字母 a               |
| 228          | 344          | E4            | 11100100     | ä              | ä              | 带元音变音  <br>(分音符号)  <br>的小写字母 a  |
| 229          | 345          | E5            | 11100101     | å              | å              | 带铃声的  <br>小写字母 a                |
| 230          | 346          | E6            | 11100110     | æ              | æ              | 小写字母 ae  <br>双重元音               |
| 231          | 347          | E7            | 11100111     | ç              | ç              | 带变音符号  <br>的小写字母 c              |
| 232          | 350          | E8            | 11101000     | è              | è              | 带重音符  <br>的小写字母 e               |
| 233          | 351          | E9            | 11101001     | é              | é              | 带尖锐重音  <br>的小写字母 e              |
| 234          | 352          | EA            | 11101010     | ê              | ê              | 带音调符号  <br>的小写字母 e              |
| 235          | 353          | EB            | 11101011     | ë              | ë              | 带元音变音  <br>(分音符号)  <br>的小写字母 e  |
| 236          | 354          | EC            | 11101100     | ì              | ì              | 带重音符  <br>的小写字母 i               |
| 237          | 355          | ED            | 11101101     | í              | í              | 带尖锐重音  <br>的小写字母 i              |
| 238          | 356          | EE            | 11101110     | î              | î              | 带音调符号  <br>的小写字母 i              |
| 239          | 357          | EF            | 11101111     | ï              | ï              | 带元音变音  <br>(分音符号)  <br>的小写字母 i  |
| 240          | 360          | F0            | 11110000     | ð              | ð              |                                 |
| 241          | 361          | F1            | 11110001     | ñ              | ñ              | 带代字号  <br>的小写字母 n               |
| 242          | 362          | F2            | 11110010     | ò              | ò              | 带重音符  <br>的小写字母 o               |
| 243          | 363          | F3            | 11110011     | ó              | ó              | 带尖锐重音  <br>的小写字母 o              |
| 244          | 364          | F4            | 11110100     | ô              | ô              | 带音调符号  <br>的小写字母 o              |
| 245          | 365          | F5            | 11110101     | õ              | õ              | 带代字号  <br>的小写字母 o               |
| 246          | 366          | F6            | 11110110     | ö              | ö              | 带元音变音  <br>(分音符号)  <br>的小写字母 o  |
| 247          | 367          | F7            | 11110111     | ÷              | ÷              | 小写字母 oe  <br>连字                 |
| 248          | 370          | F8            | 11111000     | ø              | ø              | 带斜杠  <br>的小写字母 o                |
| 249          | 371          | F9            | 11111001     | ù              | ù              | 带重音符  <br>的小写字母 u               |
| 250          | 372          | FA            | 11111010     | ú              | ú              | 带尖锐重音  <br>的小写字母 u              |
| 251          | 373          | FB            | 11111011     | û              | û              | 带音调符号  <br>的小写字母 u              |
| 252          | 374          | FC            | 11111100     | ü              | ü              | 带元音变音  <br>(分音符号)  <br>的小写字母 u  |
| 253          | 375          | FD            | 11111101     | ý              | ý              | 带元音变音  <br>(分音符号)  <br>的小写字母 y2 |
| 254          | 376          | FE            | 11111110     | þ              | þ              |                                 |
| 255          | 377          | FF            | 11111111     | ÿ              | ÿ              |                                 |
