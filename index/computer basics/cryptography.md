---
aliases: 加密,解密,SM2,DES,encrypt,decrypt
tags:
  - encrypt
  - decrypt
  - base64
  - 计算机基础/加密
date updated: 2022-04-17 14:46
---

### 加密算法的分类

#### 对称加密

对此加密是指加密和解密使用同一个密钥

### 非对称加密

非对称加密是指加密和解密使用不同的密钥，分别叫做 [[#公钥]] , [[#私钥]]。

#### 公钥

可以公开给所有人的密钥。用于加密，[[#验签]]

#### 私钥

需要自己保管的密钥。用于解密，[[#签名]]。

#### 签名

使用 [[#私钥]] 对数据内容计算一个签名，将签名和数据内容一起传输。签名不是用来保证数据的机密性，而是用于验证数据来源。一般情况下，为了节省时间，我们仅对数据进行hash运算后再进行数字签名运算。

#### 验签

使用 [[#公钥]] 对 [[#签名]] 进行验证。

### java中使用

#### SM2

#国密

```xml
<dependency>
  <groupId>org.bouncycastle</groupId>
  <artifactId>bcprov-jdk15on</artifactId>
  <version>1.65</version>
</dependency>
```

```java

import org.bouncycastle.asn1.gm.GMNamedCurves;
import org.bouncycastle.asn1.gm.GMObjectIdentifiers;
import org.bouncycastle.asn1.x9.X9ECParameters;
import org.bouncycastle.jcajce.provider.asymmetric.ec.BCECPrivateKey;
import org.bouncycastle.jcajce.provider.asymmetric.ec.BCECPublicKey;
import org.bouncycastle.jcajce.provider.asymmetric.x509.CertificateFactory;
import org.bouncycastle.jce.provider.BouncyCastleProvider;
import org.bouncycastle.jce.spec.ECParameterSpec;
import org.bouncycastle.jce.spec.ECPrivateKeySpec;
import org.bouncycastle.jce.spec.ECPublicKeySpec;
import org.bouncycastle.math.ec.ECPoint;
import org.bouncycastle.util.encoders.Hex;
import org.springframework.stereotype.Component;

import javax.crypto.BadPaddingException;
import javax.crypto.Cipher;
import javax.crypto.IllegalBlockSizeException;
import javax.crypto.NoSuchPaddingException;
import java.io.ByteArrayInputStream;
import java.math.BigInteger;
import java.security.*;
import java.security.cert.CertificateException;
import java.security.cert.X509Certificate;
import java.security.spec.ECGenParameterSpec;
import java.security.spec.InvalidKeySpecException;
import java.util.Base64;

/**
 * bcprov-jdk15on 版本适用(1.61-1.68)
 */
@Component
public class SM2Util {
    private BouncyCastleProvider provider;
    // 获取SM2相关参数
    private X9ECParameters parameters;
    // 椭圆曲线参数规格
    private ECParameterSpec ecParameterSpec;
    // 获取椭圆曲线KEY生成器
    private KeyFactory keyFactory;

    private SM2Util(){
        try {
            provider = new BouncyCastleProvider();
            parameters = GMNamedCurves.getByName("sm2p256v1");
            ecParameterSpec = new ECParameterSpec(parameters.getCurve(),
                    parameters.getG(), parameters.getN(), parameters.getH());
            keyFactory = KeyFactory.getInstance("EC", provider);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    /**
     * SM2算法生成密钥对
     *
     * @return 密钥对信息
     */
    public KeyPair generateSm2KeyPair() throws InvalidAlgorithmParameterException, NoSuchAlgorithmException {
        final ECGenParameterSpec sm2Spec = new ECGenParameterSpec("sm2p256v1");
        // 获取一个椭圆曲线类型的密钥对生成器
        final KeyPairGenerator kpg = KeyPairGenerator.getInstance("EC", provider);
        SecureRandom random = new SecureRandom();
        // 使用SM2的算法区域初始化密钥生成器
        kpg.initialize(sm2Spec, random);
        // 获取密钥对
        return kpg.generateKeyPair();
    }

    /**
     * 加密
     *
     * @param input  待加密文本
     * @param pubKey 公钥
     */
    public String encode(String input, String pubKey)
            throws NoSuchPaddingException, NoSuchAlgorithmException,
            BadPaddingException, IllegalBlockSizeException,
            InvalidKeySpecException, InvalidKeyException {
        // 获取SM2相关参数
        X9ECParameters parameters = GMNamedCurves.getByName("sm2p256v1");
        // 椭圆曲线参数规格
        ECParameterSpec ecParameterSpec = new ECParameterSpec(parameters.getCurve(), parameters.getG(), parameters.getN(), parameters.getH());
        // 将公钥HEX字符串转换为椭圆曲线对应的点
        ECPoint ecPoint = parameters.getCurve().decodePoint(Hex.decode(pubKey));
        // 获取椭圆曲线KEY生成器
        KeyFactory keyFactory = KeyFactory.getInstance("EC", provider);
        BCECPublicKey key = (BCECPublicKey) keyFactory.generatePublic(new ECPublicKeySpec(ecPoint, ecParameterSpec));
        // 获取SM2加密器
        Cipher cipher = Cipher.getInstance("SM2", provider);
        // 初始化为加密模式
        cipher.init(Cipher.ENCRYPT_MODE, key);
        // 加密并编码为base64格式
        return Base64.getEncoder().encodeToString(cipher.doFinal(input.getBytes()));
    }

    /**
     * 解密
     *
     * @param input  待解密文本
     * @param prvKey 私钥
     */
    public byte[] decoder(String input, String prvKey) throws NoSuchPaddingException, NoSuchAlgorithmException,
            InvalidKeySpecException, InvalidKeyException, BadPaddingException, IllegalBlockSizeException {
        // 获取SM2加密器
        Cipher cipher = Cipher.getInstance("SM2", provider);
        // 将私钥HEX字符串转换为X值
        BigInteger bigInteger = new BigInteger(prvKey, 16);
        BCECPrivateKey privateKey = (BCECPrivateKey) keyFactory.generatePrivate(new ECPrivateKeySpec(bigInteger,
                ecParameterSpec));
        // 初始化为解密模式
        cipher.init(Cipher.DECRYPT_MODE, privateKey);
        // 解密
        return cipher.doFinal(Base64.getDecoder().decode(input));
    }

    /**
     * 签名
     *
     * @param plainText 待签名文本
     * @param prvKey    私钥
     */
    public String sign(String plainText, String prvKey) throws NoSuchAlgorithmException, InvalidKeySpecException,
            InvalidKeyException, SignatureException {
        // 创建签名对象
        Signature signature = Signature.getInstance(GMObjectIdentifiers.sm2sign_with_sm3.toString(), provider);
        // 将私钥HEX字符串转换为X值
        BigInteger bigInteger = new BigInteger(prvKey, 16);
        BCECPrivateKey privateKey = (BCECPrivateKey) keyFactory.generatePrivate(new ECPrivateKeySpec(bigInteger,
                ecParameterSpec));
        // 初始化为签名状态
        signature.initSign(privateKey);
        // 传入签名字节
        signature.update(plainText.getBytes());
        // 签名
        return Base64.getEncoder().encodeToString(signature.sign());
    }

    public boolean verify(String plainText, String signatureValue, String pubKey) throws NoSuchAlgorithmException, InvalidKeySpecException,
            InvalidKeyException, SignatureException {
        // 创建签名对象
        Signature signature = Signature.getInstance(GMObjectIdentifiers.sm2sign_with_sm3.toString(), provider);
        // 将公钥HEX字符串转换为椭圆曲线对应的点
        ECPoint ecPoint = parameters.getCurve().decodePoint(Hex.decode(pubKey));
        BCECPublicKey key = (BCECPublicKey) keyFactory.generatePublic(new ECPublicKeySpec(ecPoint, ecParameterSpec));
        // 初始化为验签状态
        signature.initVerify(key);
        signature.update(plainText.getBytes());
        return signature.verify(Base64.getDecoder().decode(signatureValue));
    }

    /**
     * 证书验签
     *
     * @param certStr      证书串
     * @param plaintext    签名原文
     * @param signValueStr 签名产生签名值 此处的签名值实际上就是 R和S的sequence
     */
    public boolean certVerify(String certStr, String plaintext, String signValueStr)
            throws NoSuchAlgorithmException, InvalidKeyException, SignatureException, CertificateException {

        byte[] signValue = Base64.getDecoder().decode(signValueStr);
        /*
         * 解析证书
         */
        CertificateFactory factory = new CertificateFactory();
        X509Certificate certificate = (X509Certificate) factory
                .engineGenerateCertificate(new ByteArrayInputStream(Base64.getDecoder().decode(certStr)));
        // 验证签名
        Signature signature = Signature.getInstance(certificate.getSigAlgName(), provider);
        signature.initVerify(certificate);
        signature.update(plaintext.getBytes());
        return signature.verify(signValue);
    }

    public static void main(String[] args) throws InvalidAlgorithmParameterException, NoSuchAlgorithmException {
        String str = "看看能不能一次通过";
        SM2Util sm2 = new SM2Util();
        KeyPair keyPair = sm2.generateSm2KeyPair();
        BCECPrivateKey privateKey = (BCECPrivateKey) keyPair.getPrivate();
        BCECPublicKey publicKey = (BCECPublicKey) keyPair.getPublic();

        // 拿到密钥
        String pubKey = new String(Hex.encode(publicKey.getQ().getEncoded(true)));
        String prvKey = privateKey.getD().toString(16);
        System.out.println("Private Key: " + prvKey);
        System.out.println("Public Key: " + pubKey);
        // 加解密测试
        try {
            System.out.println("加密前：" + str);
            String encode = sm2.encode(str, pubKey);
            System.out.println("加密后：" + encode);
            String decoder = new String(sm2.decoder(encode, prvKey));
            System.out.println("解密后：" + decoder);
        } catch (Exception e) {
            System.out.println("加解密测试错误");
        }
        // 签名和验签测试
        try {
            System.out.println("签名源数据：" + str);
            String signStr = sm2.sign(str, prvKey);
            System.out.println("签名后数据：" + signStr);
            boolean verify = sm2.verify(str, signStr, pubKey);
            System.out.println("签名验证结果：" + verify);
        } catch (Exception e) {
            System.out.println("签名和验签测试错误");
        }
    }
}

```

#### des

使用秘钥加密解密

```java
import javax.crypto.Cipher;
import javax.crypto.SecretKey;
import javax.crypto.SecretKeyFactory;
import javax.crypto.spec.DESKeySpec;

public class DesUtil {


    private static SecretKey getSecretKey(String key) throws Exception {
        DESKeySpec dks = new DESKeySpec(key.getBytes());
        SecretKeyFactory skf = SecretKeyFactory.getInstance("DES");
        return skf.generateSecret(dks);
    }

    public static String encrypt(String input, String key) throws Exception {
        Cipher ecipher = Cipher.getInstance("DES");
        ecipher.init(Cipher.ENCRYPT_MODE, getSecretKey(key));
        byte[] utf8 = input.getBytes(Base64Utils.DEFAULT_CHARSET);
        byte[] enc = ecipher.doFinal(utf8);
        return Base64Utils.encodeToString(enc);

    }

    public static String decrypt(String input, String key) throws Exception {
        Cipher dcipher = Cipher.getInstance("DES");
        dcipher.init(Cipher.DECRYPT_MODE, getSecretKey(key));
        byte[] dec = Base64Utils.decodeFromString(input);
        byte[] utf8 = dcipher.doFinal(dec);
        return new String(utf8, Base64Utils.DEFAULT_CHARSET);

    }

}
```

#### Base64

`Base64` 的工具类，参考spring的 `Base64Utils`

```java
import java.nio.charset.Charset;
import java.nio.charset.StandardCharsets;
import java.util.Base64;

public class Base64Utils {

    public static final Charset DEFAULT_CHARSET = StandardCharsets.UTF_8;

    public static byte[] encode(byte[] src) {
        if (src.length == 0) {
            return src;
        }
        return Base64.getEncoder().encode(src);
    }

    public static byte[] decode(byte[] src) {
        if (src.length == 0) {
            return src;
        }
        return Base64.getDecoder().decode(src);
    }

    public static String encodeToString(byte[] src) {
        if (src.length == 0) {
            return "";
        }
        return new String(encode(src), DEFAULT_CHARSET);
    }

    public static byte[] decodeFromString(String src) {
        if (src.isEmpty()) {
            return new byte[0];
        }
        return decode(src.getBytes(DEFAULT_CHARSET));
    }
}
```

### 参考文档

[一文彻底搞懂加密、数字签名和数字证书！ - SegmentFault 思否](https://segmentfault.com/a/1190000024523772)
[国密新标旧标](http://www.4k8k.xyz/article/pridas/86118774)