---
aliases: tif
tags:
  - protocol/tiff
date updated: 2024-08-14 19:56
---

## 示例

```xml
<dependency>  
    <groupId>org.apache.commons</groupId>  
    <artifactId>commons-imaging</artifactId>  
    <version>1.0.0-alpha5</version>  
</dependency>  
<dependency>  
    <groupId>com.twelvemonkeys.imageio</groupId>  
    <artifactId>imageio-tiff</artifactId>  
    <version>3.10.1</version>  
</dependency>
```

```java
package com.leaderli.demo.image;  
  
import org.w3c.dom.Node;  
  
import javax.xml.transform.OutputKeys;  
import javax.xml.transform.Transformer;  
import javax.xml.transform.TransformerException;  
import javax.xml.transform.TransformerFactory;  
import javax.xml.transform.dom.DOMSource;  
import javax.xml.transform.stream.StreamResult;  
  
public class XMLPrinter {  
  
    public static void printNodeAsXML(Node node) {  
        try {  
            // Create a transformer  
            Transformer transformer = TransformerFactory.newInstance().newTransformer();  
            transformer.setOutputProperty(OutputKeys.OMIT_XML_DECLARATION, "no");  
            transformer.setOutputProperty(OutputKeys.INDENT, "yes");  
  
            // Create a DOMSource from the node  
            DOMSource source = new DOMSource(node);  
  
            // Define a StreamResult for the output  
            StreamResult result = new StreamResult(System.out);  
  
            // Transform the node to XML and print to console  
            transformer.transform(source, result);  
        } catch (TransformerException e) {  
            e.printStackTrace();  
        }  
    }  
  
  
}
```

```java
File output = new File("generated_image.tiff");  
ImageInputStream iis = ImageIO.createImageInputStream(output);  
TIFFImageReader reader = (TIFFImageReader) ImageIO.getImageReaders(iis).next();  
reader.setInput(iis);  
IIOMetadata metadata = reader.getImageMetadata(0);  
XMLPrinter.printNodeAsXML( metadata.getAsTree("com_sun_media_imageio_plugins_tiff_image_1.0"));
```

输出结果如下，可以看到[[#DE]]标签内容

```xml
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>  
<com_sun_media_imageio_plugins_tiff_image_1.0>  
    <TIFFIFD>  
        <TIFFField number="256" name="ImageWidth">  
            <TIFFShorts>  
                <TIFFShort value="500"/>  
            </TIFFShorts>  
        </TIFFField>  
        <TIFFField number="257" name="ImageHeight">  
            <TIFFShorts>  
                <TIFFShort value="500"/>  
            </TIFFShorts>  
        </TIFFField>  
        <TIFFField number="258" name="BitsPerSample">  
            <TIFFShorts>  
                <TIFFShort value="1"/>  
            </TIFFShorts>  
        </TIFFField>  
        <TIFFField number="259" name="Compression">  
            <TIFFShorts>  
                <TIFFShort value="3"/>  
            </TIFFShorts>  
        </TIFFField>  
        <TIFFField number="262" name="PhotometricInterpretation">  
            <TIFFShorts>  
                <TIFFShort value="1"/>  
            </TIFFShorts>  
        </TIFFField>  
        <TIFFField number="273" name="StripOffsets">  
            <TIFFLongs>  
                <TIFFLong value="8"/>  
            </TIFFLongs>  
        </TIFFField>  
        <TIFFField number="274" name="Orientation">  
            <TIFFShorts>  
                <TIFFShort value="1"/>  
            </TIFFShorts>  
        </TIFFField>  
        <TIFFField number="277" name="SamplesPerPixel">  
            <TIFFShorts>  
                <TIFFShort value="1"/>  
            </TIFFShorts>  
        </TIFFField>  
        <TIFFField number="278" name="RowsPerStrip">  
            <TIFFShorts>  
                <TIFFShort value="500"/>  
            </TIFFShorts>  
        </TIFFField>  
        <TIFFField number="279" name="StripByteCounts">  
            <TIFFLongs>  
                <TIFFLong value="1005"/>  
            </TIFFLongs>  
        </TIFFField>  
        <TIFFField number="292">  
            <TIFFLongs>  
                <TIFFLong value="1"/>  
            </TIFFLongs>  
        </TIFFField>  
        <TIFFField number="305" name="Software">  
            <TIFFAsciis>  
                <TIFFAscii value="TwelveMonkeys ImageIO TIFF writer 3.10.1"/>  
            </TIFFAsciis>  
        </TIFFField>  
    </TIFFIFD>  
</com_sun_media_imageio_plugins_tiff_image_1.0>
```

使用 [[Tiff file check.rar]] 中的 tiffdump.exe

```sh
PS D:\download\Tiff file check\Tiff file check> .\tiffdump.exe   D:\work\workspace\idea\JavaDemoAndSnippet\generated_image.tiff
D:\work\workspace\idea\JavaDemoAndSnippet\generated_image.tiff:
Magic: 0x4d4d <big-endian> Version: 0x2a
Directory 0: offset 1058 (0x422) next 0 (0)
ImageWidth (256) SHORT (3) 1<500>
ImageLength (257) SHORT (3) 1<500>
BitsPerSample (258) SHORT (3) 1<1>
Compression (259) SHORT (3) 1<3>
Photometric (262) SHORT (3) 1<1>
StripOffsets (273) LONG (4) 1<8>
Orientation (274) SHORT (3) 1<1>
SamplesPerPixel (277) SHORT (3) 1<1>
RowsPerStrip (278) SHORT (3) 1<500>
StripByteCounts (279) LONG (4) 1<1005>
Group3Options (292) LONG (4) 1<1>
Software (305) ASCII (2) 41<TwelveMonkeys ImageIO TI ...>
```

当我们使用 [[vim#查看字节|vi]] 打开，并使用16进制显示时

```txt
00000000: 4d4d 002a 0000 0422 0019 a81a 8120 00a4  MM.*..."..... ..
00000010: 28e4 1073 8f00 17f8 00b9 4e5c 79a2 002d  (..s......N\y..-
00000020: 9c74 0810 2f40 8c3c 005a fffe 002f c7ff  .t../@.<.Z.../..
00000030: 0017 e472 ff00 17f0 40bf e002 fb5e d400  ...r....@....^..
00000040: 5111 1118 00b0 0160 02c0 0580 0b00 1600  Q......`........
00000050: 2c00 5800 b001 6002 c005 800b 0016 002c  ,.X...`........,
00000060: 0058 00b0 0160 02c0 0580 0b00 1600 2c00  .X...`........,.
00000070: 5800 b001 6002 c005 800b 0016 002c 0058  X...`........,.X
00000080: 00b0 0160 02c0 0580 0b00 1600 2c00 520a  ...`........,.R.
00000090: 4bce 002f 0017 800b c005 e002 f001 7800  K../..........x.
000000a0: bc00 5e00 2f00 1780 0bc0 05e0 02f0 0178  ..^./..........x
000000b0: 00bc 005e 002f 0017 800b c005 e002 f001  ...^./..........
000000c0: 7800 bc00 5e00 2f00 1780 0bc0 05e0 02f0  x...^./.........
000000d0: 0178 00bc 005e 002f 0017 800b c005 e002  .x...^./........
000000e0: f001 7800 bc00 5e00 2f00 1780 0bc0 05e0  ..x...^./.......
000000f0: 02f0 0178 00bc 005e 002f 0017 800b c005  ...x...^./......
00000100: e002 f001 7800 bc00 5e00 2f00 1780 0bc0  ....x...^./.....
00000110: 05e0 02f0 0178 00bc 005e 002f 0017 800b  .....x...^./....
00000120: c005 e002 f001 7800 bc00 5e00 2f00 1780  ......x...^./...
00000130: 0bc0 05e0 02f0 0178 00bc 005e 002f 0017  .......x...^./..
00000140: 800b c005 e002 f001 7800 bc00 5e00 2f00  ........x...^./.
00000150: 1780 0bc0 05e0 02f0 0178 00bc 005e 002f  .........x...^./

```

其中 最开始的`MM` 表示大端， 如果 `II` 表示小端

`0422`对应十进制的1058，表示相对于头文件的IFD的偏移量，IFD通常位于图形数据后面。

## 文件格式

TIFF文件由三部分构成：

1. 文件头（TIFF Header），简称IFH
2. 目录项（Directory Entry），包含图像数据
3. 文件目录IFD（Image File Directory），简称IFD

TIF图像文件的一般组织形式是：IFH——图像数据——IFD

### IFH

TIFF格式中前8个字节是 TIFF 头

1. 前2个字节定义了 TIFF 数据的字节序

   - 0x4949=`II`的话, 就表示按照 "Intel" 的字节序(Little Endian)
   - 0x4d4d=`MM`, 则说明按照 "Motorola" 的字节序(Big Endian)

2. 随后的两个字节是一个2字节长度的固定值 0x002A，表示版本号

3. 最后的 4个字节是到第一个 [[#IFD]]的偏移量.

### IFD

IFD是TIFF图像文件中重要的数据结构，它包含了三个成员：DE count、DE、next IFD offset。由于一个TIFF文件中可以有多个图像，而一个IFD只标识一个图像的所有属性（或称之为“标签”），所以，一个TIFF文件中有几个图像，就会有几个IFD。

![[Pasted image 20240814195217.png]]

| 名称                    | 字节数 | 数据类型    | 说明                                                           |
| --------------------- | --- | ------- | ------------------------------------------------------------ |
| Directory Entry Count | 2   | Integer | 该IFD中DE的数量                                                   |
| Directory Entry(1)    | 12  | Integer | DE，“目录项”                                                     |
| Directory Entry(2)    | 12  | Integer | DE的个数是不定的，因为每个DE只标识了图像的一个属性，那么这幅图像有N个属性就会有N个DE；              |
| ……                    |     |         | 用户甚至可添加自定义的标记属性，这就是为什么称TIF格式文件为“可扩充标记的文件”的原因。                |
| Directory Entry(N)    | 12  | Integer |                                                              |
| Offset to next IFD    | 4   | Long    | 如果该数字为0，表示已经是最后一个IFD。如果该TIF文件只包含了一幅图像，那么就只有一个IFD，这个偏移量也会等于0。 |

### DE

一个DE就是一幅图像的某一个属性。例如图像的大小、分辨率、是否压缩、像素的行列数、颜色深度（单色、16色、256色、真彩色）等等。

DE结构：

| 名称          | 字节数 | 数据类型    | 说明                                                                                                 |
| ----------- | --- | ------- | -------------------------------------------------------------------------------------------------- |
| tag         | 2   | Integer | 本属性的标签编号。在图像文件目录中，它是按照升序排列的（但不一定是连续的）                                                              |
| type        | 2   | Integer | 本属性值的数据类型                                                                                          |
| length      | 4   | Long    | 该类型数据的个数                                                                                           |
| valueOffset | 4   | Long    | tagID代表的变量值相对文件开始处的偏移量，但如果变量值占用的空间不多于4个字节（例如只有1个Integer类型的值），那么该值就直接存放在valueOffset中，没必要再另外指向一个地方了。 |

## 参考文档

[JPEG/Exif/TIFF格式解读(3):TIFF与JPEG里面EXIF信息存储原理解读-腾讯云开发者社区-腾讯云](https://cloud.tencent.com/developer/article/2270874)

[RFC 3949: File Format for Internet Fax](https://www.rfc-editor.org/rfc/rfc3949.html)

dtd约束文件

[TIFF Metadata Format Specification and Usage Notes](https://docs.oracle.com/javase%2F9%2Fdocs%2Fapi%2F%2F/javax/imageio/metadata/doc-files/tiff_metadata.html)
