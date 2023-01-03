---
aliases: 泛型
tags:
  - java/se/泛型
date updated: 2023-01-02 22:44
---

## 概述

泛型作为一个语法特性，提供了编译时类型安全。泛型的本质是将类型参数化，用于定义类，接口，方法。

通常一个泛型类的定义如下：

```java
class name<T1, T2, ..., Tn> { /* ... */ }
```

泛型参数 `T1`, `T2` 仅限于在当前类的作用范围内使用，不可用于子类。

在调用或初始化泛型类时，可以申明具体使用的泛型。

```java
public class Box<T>{

}

Box<Integer> box;
```

泛型申明，仅用于编译期，实际运行时，其类型会被擦除。

## 继承关系

`List<Number>` 和 `List<Integer>` 不是父子类，他们共同的父类是 `List<?>`。但是 [[#上边界]]，
[[#下边界]] 具有继承关系

![[generics-wildcardSubtyping.gif|400]]


下述代码是合法的
```java
List<? extends Integer> intList = new ArrayList<>();
List<? extends Number>  numList = intList;
```
## 有界类型

默认情况下，泛型都是 `object` ， 当我们需要限制泛型的实际类型时，可以通过 `extends` 。

```java
public <U extends Number> void inspect(U u){
}
```

### 多边界

可以使用 `&` 来表示继承多个接口，仅允许继承一个非接口，且需要在第一个位置

```java
Class A { /* ... */ }
interface B { /* ... */ }
interface C { /* ... */ }

class D <T extends A & B & C> { /* ... */ }
```

## 通配符

泛型中使用 `?` 作为通配符，代表不确定类型。

```ad-li
不管是extends或是super，只能使用在变量声明上，实际赋值的时候，一定是指定具体实现类的，这就是extend和super的方法会有所限制的原因


### PECS

Remember _PECS_: **"Producer Extends, Consumer Super"**.
```

### 上边界

```java
List<? extends Number> foo1 = new ArrayList<Number>();  // Number "extends" Number (in this context)
List<? extends Number> foo2 = new ArrayList<Integer>(); // Integer extends Number
List<? extends Number> foo3 = new ArrayList<Double>();  // Double extends Number
```

**可读不可写**

1. `<? extends Number>` 其具体实现类的泛型，Number，Integer，Double 都是 Number 的子类，其集合中的元素都为其声明的泛型，因此当我们从集合中取值，一定也是其声明的泛型，是可以向上转型为 Number 类型的。

   2.`<? extends Number>` 其具体实现类的泛型，Number，Integer，Double 都是 Number 的子类，如果以 Number 进行插入时，例如在 foo2 插入一个 Double 泛型的元素，则与实际的泛型 Integer 冲突，所以 `extends` 禁用插入动作。

### 下边界

```java
List<? super Integer> foo1 = new ArrayList<Integer>();  // Integer is a "superclass" of Integer (in this context)
List<? super Integer> foo2 = new ArrayList<Number>();   // Number is a superclass of Integer
List<? super Integer> foo3 = new ArrayList<Object>();   // Object is a superclass of Integer
```

**不可读可写**

1. `<? super Integer>` 其具体实现类的泛型，Integer，Number，Object 都是 Integer 的父类，当我从集合中取值时，只能保证其值是具体声明的泛型，而 Number，Object 是不能保证可以向下转型为 Integer 的。所以 `super` 禁止读取操作

   2.`<? super Integer>` 其具体实现类的泛型，Integer，Number，Object 都是 Integer 的父类，当我以  Interger  进行插入时，都是可以向上转型为  Integer，Number，Object 的

### 无限通配符

可以把 `<?>` 看成 `<? extends object>` 的缩写， `List<?>` 可以接受 `List<String>` , `List<Integer>`。但是 `List<Object>` 是不可以接受 `List<String>` 的。

```java
public static void printList(List<?> list) {
    for (Object elem: list)
        System.out.print(elem + " ");
    System.out.println();
}
```

### 参考文档

[difference-between-super-t-and-extends-t-in-java](https://stackoverflow.com/questions/4343202/difference-between-super-t-and-extends-t-in-java/4343547#4343547)

### 方法参数的泛型通配符

作为方法参数时，对于一个典型的示例来说，一般 mapper 函数是这样声明的

```java
<R> Stream<R> map(Function<? super T, ? extends R> mapper);

 //上述形参的泛型表示实际mapper方法调用时是使用如下泛型的
R apply(T t);
```

当传递mapper时，我们需要指定具体的泛型，此处mapper的实际类型 `<T1,R1>` , `T1` 为 `T` 的父类， `R1` 为 `R` 的子类。

- apply 方法内部，实际传递的参数 `t` 是可以直接强转为 `T1`
- apply 方法的返回值 `r1`，是可以直接强转为 `R`

## 泛型类型

### java.lang.reflect.Type

有多个实现类

### Class

类

### TypeVariable

泛型声明，例如 `List<T>` 中的 `T`， 其可以通过 `getGenericDeclaration` 方法找到泛型声明的类

```java
private static class Li<T> {  
    public T t;  
}

Type t = Li.class.getField("t").getGenericType();
((TypeVariable)t).getGenericDeclaration(); // class Li

```

### WildcardType

通配符泛型声明，例如 `List<? extends T>` 中的 `? extends T`

### GenericArrayType

数组泛型 ，例如 `T[]` 中的 `T`

### ParameterizedType

参数化泛型声明，例如 `List<List<Integet>>` 中的 `List<Intger>`

我们需要明确的是，泛型类型仅使用于声明时使用，实际赋值时泛型肯定是已经确定好了的。


## 桥接

### 桥接方法

当类定义中的类型参数没有任何限制时，在类型擦除中直接被替换为Object，即形如 `<T>` 和 `<?>` 的类型参数都被替换为Object。

```java
public class Node<T> {

    public T data;

    public Node(T data) { this.data = data; }

    public void setData(T data) {
        System.out.println("Node.setData");
        this.data = data;
    }
}

public class MyNode extends Node<Integer> {
    public MyNode(Integer data) { super(data); }

    public void setData(Integer data) {
        System.out.println("MyNode.setData");
        super.setData(data);
    }
}
```

当做如下使用时

```java
Node node = new MyNode(5);
n.setData("Hello");
```

当子类重写了 `setData` 方法时其参数为 `Integer` ，我们的子类中实际是没有  `setData(Object.class)` 的方法的， `java` 编译器在进行类型擦除的时候会自动生成一个 `synthetic` 方法，也叫 `bridge` 方法,我们通过生成的字节码可以看到实际 `bridge` 方法，首先校验类型是否为 `Integer` ，然后在调用 `setData(Integer.class)` 。因此，上述代码会抛出 `ClassCastException`

```java
//通过javap -c 的方法可以显示桥接方法
public void setData(java.lang.Integer);
    descriptor: (Ljava/lang/Integer;)V
    flags: ACC_PUBLIC
    Code:
        stack=2, locals=2, args_size=2
            0: getstatic     #2                  // Field java/lang/System.out:Ljava/io/PrintStream;
            3: ldc           #3                  // String MyNode.setNode
            5: invokevirtual #4                  // Method java/io/PrintStream.println:(Ljava/lang/String;)V
            8: aload_0
            9: aload_1
            10: invokespecial #5                  // Method com/li/springboot/bridge/Node.setData:(Ljava/lang/Object;)V
            13: return
        LineNumberTable:
        line 11: 0
        line 12: 8
        line 13: 13
        LocalVariableTable:
        Start  Length  Slot  Name   Signature
            0      14     0  this   Lcom/li/springboot/bridge/MyNode;
            0      14     1 integer   Ljava/lang/Integer;
    MethodParameters:
        Name                           Flags
        integer


public void setData(java.lang.Object);
    descriptor: (Ljava/lang/Object;)V
    flags: ACC_PUBLIC, ACC_BRIDGE, ACC_SYNTHETIC
    Code:
        stack=2, locals=2, args_size=2
            0: aload_0
            1: aload_1
            2: checkcast     #11                 // class java/lang/Integer
            5: invokevirtual #12                 // Method setData:(Ljava/lang/Integer;)V
            8: return
        LineNumberTable:
        line 3: 0
        LocalVariableTable:
        Start  Length  Slot  Name   Signature
            0       9     0  this   Lcom/li/springboot/bridge/MyNode;
    MethodParameters:
        Name                           Flags
        integer                        synthetic
```

### Spring 注入桥接子类注意

```java
public interface Generic<T,R> {}
@Component
public class G1 implements Generic<Object, Collection> {}
@Component
public class G2 implements Generic<Object, List> {}
@Component
public class G3<T> implements Generic<T, List> {}
@Component
public class G4 implements Generic<String, List> {}
```

```java
@Autowired
List<Generic> generics; //G1 G2 G3 G4
@Autowired
List<Generic<?, ? extends Collection>> generics; //G1 G2 G3 G4
@Autowired
List<Generic<?, Collection>> generics;//G1
@Autowired
List<Generic<Object, ? extends Collection>> generics; //G1 G2 G3
@Autowired
List<Generic<Object, Collection>> generics; //G1 G2
```


## 泛型的应用

```java
class Node<T extends Node<? extends Node<?>>> {

 T parent;
}
class RootNode extends Node<Node<?>>{

}

class Node1 extends Node<RootNode>{

}
class Node2 extends Node<RootNode>{

}

//在指定T类型时，其实R类型已经固定了
class B<T extends Node<R>, R extends Node<?>> {

 T node;
 R parent;

}

//C1 会直接提示错误
class C1 extends B<Node1,Node2>{

}
class C2 extends B<Node1,RootNode>{

}
```

### 任意数组泛型

```java
@Retention(RetentionPolicy.RUNTIME)  
@Target(ElementType.ANNOTATION_TYPE)  
public @interface Valuable {  
  
    Class<? extends Function<? extends Annotation,? extends Object[]>>  value();  
}
```

### 当使用通配符不能直接使用时，可使用强转来实现

```java
   @SuppressWarnings("unchecked")
    public <T extends EventObject> List<ILiEventListener<T>> get(Class<T> cls) {
        //下面这一句无法通过编译
        //List<ILiEventListener<T>>  error= this.eventListenerMap.computeIfAbsent(cls, c -> new ArrayList<>());
        Object iLiEventListeners = this.eventListenerMap.computeIfAbsent(cls, c -> new ArrayList<>());
        return (List<ILiEventListener<T>>) iLiEventListeners;
    }
```

### 获取泛型的类型

可以通过增加一个返回class的泛型方法交由子类去显式声明。

```java
public interface ILiEventListener<T> {

    void listen(T event);

    Class<T> listenType();
}
```

### 泛型在map中的一些使用

```java
//可以保证存储在cache中的key和value一定是同一个泛型的
Map<Class<?>,Object> cache = new HashMap<>();

public <T>void put(Class<T> type,T value){
    cache.put(type,value);
}

public <T>T get(Class<T> type){
    return cache.get(type);
}
```

### 创建泛型数组

```java
java.lang.reflect.Array.newInstance(Class<T> componentType, int length)
```

### 获取类声明的泛型

当继承一个泛型类时指定了具体的泛型，通过反射获取该泛型的具体类型

```java
ParameterizedType  paramterizedType =(ParameterizedType) this.getClass().getGenericSuperclass();
paramterizedType.getActualTypeArguments()
// 对于 public class EditRelateJavaAction extends SelectionContextMenuAction<FlowNode> 来说，其值就为FlowNode
```

对于接口泛型

```java
ParameterizedTypeImpl[] types = (ParameterizedTypeImpl[]) MyNode.class.getGenericInterfaces();
```

### 获取泛型声明的名字

```java
Consumer.class.getTypeParameters();  
Function.class.getTypeParameters();

// T
// T R
```

`getTypeParameters` 返回的是一个 TypeVariable 类型的数组，TypeVariable 继承自 Type，它不是实际的 class 类型

### 强转异常捕获

`java` 运行时无法捕获 `ClassCastException` 的解决办法

```java
 private static <T> T get(Object o, T def) {
   try {
     return (T) def.getClass().cast(o);
   } catch (Throwable e) {
     return (T) def;
   }
 }
```

通过查看字节码就可以了解,直接  `return (T) value` 是在方法外检测 `cast`

### 任意泛型

当一个类不包含任何泛型的成员变量时，其可以安全的转换为任意泛型

```java
public class Some<T>{

	public void test(T t){

	}

	@SuppressWarnings("unchecked")  
	public <R> Some<R> toSome() {  
	 return (Some<R>) this;  
	}
}
```

## 参考文档

[Lesson: Generics (Updated) (The Java™ Tutorials > Learning the Java Language)](https://docs.oracle.com/javase/tutorial/java/generics/index.html)

[Lesson: Generics (The Java™ Tutorials > Bonus)](https://docs.oracle.com/javase/tutorial/extra/generics/index.html)
