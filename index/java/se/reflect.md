---
aliases:  反射
tags:
- java/se/反射
---

## 概述


JAVA反射机制是在运行状态中，对于任意一个类，都能够知道这个类的所有属性和方法；对于任意一个对象，都能够调用它的任意一个方法和属性；这种动态获取的信息以及动态调用对象的方法的功能称为java语言的反射机制

我们通过分析反射的API [[#Class newInstance]] ，最终都会指向`ReflectionData`，当我们找需要的属性或方法时，都会拷贝一份出来，从而实现数据的隔离。

```java
//类的反射的数据都缓存在该属性上，该属性可能会被GC
private volatile transient SoftReference<ReflectionData<T>> reflectionData;

private static class ReflectionData<T> {  
    volatile Field[] declaredFields;  
    volatile Field[] publicFields;  
    volatile Method[] declaredMethods;  
    volatile Method[] publicMethods;  
    volatile Constructor<T>[] declaredConstructors;  
    volatile Constructor<T>[] publicConstructors;  
    volatile Field[] declaredPublicFields;  
    volatile Method[] declaredPublicMethods;  
    volatile Class<?>[] interfaces;  
    final int redefinedCount;  
  
    ReflectionData(int redefinedCount) {  
        this.redefinedCount = redefinedCount;  
    }  
}

//主要通过下述4个native方法进行赋值
private native Field[]       getDeclaredFields0(boolean publicOnly);  
private native Method[]      getDeclaredMethods0(boolean publicOnly);  
private native Constructor<T>[] getDeclaredConstructors0(boolean publicOnly);  
private native Class<?>[]   getDeclaredClasses0();
```

上述四个native方法，我们可以推断其是去解析 [[bytecode|字节码]] 文件，查找出对应的值。


## Class类

每个java类运行时都在JVM里表现为一个class对象，[[basic data type|基础数据类型]] 和关键字 `void` 同样表现为 class 对象

```java
public final class Class<T> implements java.io.Serializable,
                              GenericDeclaration,
                              Type,
                              AnnotatedElement {
    private static final int ANNOTATION= 0x00002000;
    private static final int ENUM      = 0x00004000;
    private static final int SYNTHETIC = 0x00001000;

    private static native void registerNatives();
    static {
        registerNatives();
    }

    /*
     * Private constructor. Only the Java Virtual Machine creates Class objects.   //私有构造器，只有JVM才能调用创建Class对象
     * This constructor is not used and prevents the default constructor being
     * generated.
     */
    private Class(ClassLoader loader) {
        // Initialize final field for classLoader.  The initialization value of non-null
        // prevents future JIT optimizations from assuming this final field is null.
        classLoader = loader;
    }

```

- Class也是类的一种
- 编写的类被编译后产生一个Class对象，其表示创建的类的类型信息，而这个Class对象保存在同名class文件中（字节码文件）
- 每个通过关键字class标识的类，在内存中有且仅有一个与之对应的Class对象来描述其类型信息
- Class类只存在私有构造函数，因此对应Class对象只有JVM创建和加载
- Class类的对象在运行时提供获得某个对象的类型信息，成员变量，方法，构造方法，注解等。

### Class类有关的一些方法

在Class类中很多方法内使用 `Reflection.getCallerClass()`，该代码通过反射返回调用该方法的具体的Class对象

## 类加载
[[classloader|类加载机制]]
[[bytecode|字节码]]
## 反射常用API
### Class

| 方法              | 说明                                     |
| ----------------- | ---------------------------------------- |
| `getName()`       | 取全限定的类名(包括包名)，即类的完整名字 | 
| `getSimpleName()` | 获取类名(不包括包名)|

### Field
| 方法                  | 说明                                                                        |
| --------------------- | --------------------------------------------------------------------------- |
| `getDeclaredFields()` | 获取Class对象所表示的类或接口的所有(包含private修饰的)字段,不包括继承的字段 |
| `getFields()`         | 获取修饰符为public的字段，包含继承字段 |
| `getType()`           | Field 对象所表示字段的声明类型。   |
| `getDeclaringClass()` | Field 对象表示的字段的所在的类    |

```ad-warning
需要特别注意的是被final关键字修饰的Field字段是安全的，在运行时可以接收任何修改，但最终其实际值是不会发生改变的。
```

### Method
| 方法                  | 说明                                                                                                                  |
| --------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `getMethods()`        | 此 Class 对象所表示的类或接口（包括那些由该类或接口声明的以及从超类和超接口继承的那些的类或接口）的公共 member 方法。 |
| `getDeclaredMethod()` | 此 Class 对象所表示的类或接口声明的所有方法，包括公共、保护、默认（包）访问和私有方法，但不包括继承的方法。           |
| `isVarArgs()`         | 判断方法是否带可变参数，如果将此方法声明为带有可变数量的参数，则返回 true；否则，返回 false。                         |
|                       ||




## 源码分析
###  `Class.forName`

```java
@CallerSensitive
public static Class<?> forName(String className) throws ClassNotFoundException {
	// 先通过反射，获取调用进来的类信息，从而获取当前的 classLoader
	Class<?> caller = Reflection.getCallerClass();
	// 调用native方法进行获取class信息
	return forName0(className, true, ClassLoader.getClassLoader(caller), caller);
}

```

`forName()`反射获取类信息，并没有将实现留给了java,而是交给了JVM[[classloader|类加载器]]去加载。

### `Class.newInstance`

```java
@CallerSensitive  
public T newInstance()  throws InstantiationException, IllegalAccessException  {  
	
    if (System.getSecurityManager() != null) {  
        checkMemberAccess(Member.PUBLIC, Reflection.getCallerClass(), false);  
    }  
  
 	//做缓存 
	if (cachedConstructor == null) {	
		//不允许通过这种方式加载Class对象，仅允许ClassLoader加载
		if (this == Class.class) {  
			throw new IllegalAccessException("Can not call newInstance() on the Class for java.lang.Class");  
		}  
		try {  
			Class<?>[] empty = {};  

			final Constructor<T> c = getConstructor0(empty, Member.DECLARED);  
				new java.security.PrivilegedAction<Void>() {  
					public Void run() {  
							c.setAccessible(true);  
							return null;  
						}  
				});  
			cachedConstructor = c;  
		} catch (NoSuchMethodException e) {  
			throw (InstantiationException) new InstantiationException(getName()).initCause(e);  
		}  
    }  
    Constructor<T> tmpConstructor = cachedConstructor;  
    // 校验package的权限
 	int modifiers = tmpConstructor.getModifiers();  
    if (!Reflection.quickCheckMemberAccess(this, modifiers)) {  
        Class<?> caller = Reflection.getCallerClass();  
        if (newInstanceCallerCache != caller) {  
            Reflection.ensureMemberAccess(caller, this, null, modifiers);  
            newInstanceCallerCache = caller;  
        }  
    }  
	//调用构造器对象的newInstance()方法返回Class的实例对象
	try {  
		return tmpConstructor.newInstance((Object[])null);  
	} catch (InvocationTargetException e) {  
		Unsafe.getUnsafe().throwException(e.getTargetException());  
		return null;  
	}  
}
```

			
上述代码调用 `getConstructor0` 传递的参数表面查找一个无参，`Member.DECLARED` 表示声明的成员，不包括继承的成员

```java
private Constructor<T> getConstructor0(Class<?>[] parameterTypes,  int which) throws NoSuchMethodException  
{  
    Constructor<T>[] constructors = privateGetDeclaredConstructors((which == Member.PUBLIC));  
    for (Constructor<T> constructor : constructors) {  
		//遍历所有构造器，找到一个无参构造器，返回一个拷贝
        if (arrayContentsEq(parameterTypes,  constructor.getParameterTypes())) {  
            return getReflectionFactory().copyConstructor(constructor);  
        }  
    }  
    throw new NoSuchMethodException(getName() + ".<init>" + argumentTypesToString(parameterTypes));  
}
```


```java
private Constructor<T>[] privateGetDeclaredConstructors(boolean publicOnly) {  
    checkInitted();  
    Constructor<T>[] res;  
    ReflectionData<T> rd = reflectionData();  
    if (rd != null) {  
		//当反射元数据中存在构造器存在时，直接返回
        res = publicOnly ? rd.publicConstructors : rd.declaredConstructors;  
        if (res != null) return res;  
    }  
	//接口无构造器
	if (isInterface()) {  
		@SuppressWarnings("unchecked")  
		Constructor<T>[] temporaryRes = (Constructor<T>[]) new Constructor<?>[0];  
		res = temporaryRes;  
	} else {  
		//查找Class文件对应的字节码，仅查找当前class文件声明的构造器方法
		//通过javap命令，我们可以与Class同名的方法声明的一段字节码，其必定就是构造器方法
		res = getDeclaredConstructors0(publicOnly);  
	}  
	
	//缓存反射的元数据
	if (rd != null) {  
		if (publicOnly) {  
			rd.publicConstructors = res;  
		} else {  
			rd.declaredConstructors = res;  
		}  
	}  
	
    return res;  
}
```


###  `Method.invoke`

简单分析一下，只关注重要部分

```java
@CallerSensitive  
public Object invoke(Object obj, Object... args)   throws IllegalAccessException, IllegalArgumentException,  InvocationTargetException  
{  
    if (!override) {  
        if (!Reflection.quickCheckMemberAccess(clazz, modifiers)) {  
            Class<?> caller = Reflection.getCallerClass();  
            checkAccess(caller, clazz, obj, modifiers);  
        }  
    }  
    MethodAccessor ma = methodAccessor;
 	if (ma == null) {  
        ma = acquireMethodAccessor();  
    }  
    return ma.invoke(obj, args);  
}
```

执行类 acquireMethodAccessor 的初始化过程

```java
private MethodAccessor acquireMethodAccessor() {  
	
    if (root != null) tmp = root.getMethodAccessor();  
    if (tmp != null) {  
        methodAccessor = tmp;  
    } else {  
		tmp = reflectionFactory.newMethodAccessor(this);  
        setMethodAccessor(tmp);  
    }  
  
    return tmp;  
}
```

```java
public MethodAccessor newMethodAccessor(Method method) {  
	
    checkInitted();  
  
    if (noInflation && !ReflectUtil.isVMAnonymousClass(method.getDeclaringClass())) {  
        return new MethodAccessorGenerator().  
            generateMethod(method.getDeclaringClass(),  
                           method.getName(),  
                           method.getParameterTypes(),  
                           method.getReturnType(),  
                           method.getExceptionTypes(),  
                           method.getModifiers());  
    } else {  
        NativeMethodAccessorImpl acc =  new NativeMethodAccessorImpl(method);  
        DelegatingMethodAccessorImpl res =  new DelegatingMethodAccessorImpl(acc);  
        acc.setParent(res);  
        return res;  
    }  
}
```

那么 `ma.invoke(obj, args)` 中 `ma` 实际即为 `DelegatingMethodAccessorImpl` ，而 `DelegatingMethodAccessorImpl` 为一个代理类，它的invoke方法实际调用 `NativeMethodAccessorImpl` 的invoke方法，如下

```java
public Object invoke(Object obj, Object[] args)  throws IllegalArgumentException, InvocationTargetException  {  
    // We can't inflate methods belonging to vm-anonymous classes because  
	// that kind of class can't be referred to by name, hence can't be // found from the generated bytecode. 
	if (++numInvocations > ReflectionFactory.inflationThreshold()  && !ReflectUtil.isVMAnonymousClass(method.getDeclaringClass())) {  
        MethodAccessorImpl acc = (MethodAccessorImpl)  
            new MethodAccessorGenerator().generateMethod
			(
			   method.getDeclaringClass(),  
			   method.getName(),  
			   method.getParameterTypes(),  
			   method.getReturnType(),  
			   method.getExceptionTypes(),  
			   method.getModifiers()
			);  
        parent.setDelegate(acc);  
    }  
  
	//native方法
    return invoke0(method, obj, args);  
}
```

```java
public MethodAccessor generateMethod(Class<?> declaringClass,  String name,  Class<?>[] parameterTypes,  Class<?>   returnType,  
									 Class<?>[] checkedExceptions,  int modifiers)  {  
    return (MethodAccessor) generate(declaringClass, name,  parameterTypes,  returnType,  
									 checkedExceptions,  modifiers,  false,  false,  null);  
}
```

根据 class，和方法的标识来使用 ASM 技术生成一个可被 invoke0 直接使用的字节码

```java
 private MagicAccessorImpl generate(final Class<?> declaringClass,
                                       String name,
                                       Class<?>[] parameterTypes,
                                       Class<?>   returnType,
                                       Class<?>[] checkedExceptions,
                                       int modifiers,
                                       boolean isConstructor,
                                       boolean forSerialization,
                                       Class<?> serializationTargetClass)
    {
        ByteVector vec = ByteVectorFactory.create();
        asm = new ClassFileAssembler(vec);
        this.declaringClass = declaringClass;
        this.parameterTypes = parameterTypes;
        this.returnType = returnType;
        this.modifiers = modifiers;
        this.isConstructor = isConstructor;
        this.forSerialization = forSerialization;

        asm.emitMagicAndVersion();

        // Constant pool entries:
        // ( * = Boxing information: optional)
        // (+  = Shared entries provided by AccessorGenerator)
        // (^  = Only present if generating SerializationConstructorAccessor)
        //     [UTF-8] [This class's name]
        //     [CONSTANT_Class_info] for above
        //     [UTF-8] "sun/reflect/{MethodAccessorImpl,ConstructorAccessorImpl,SerializationConstructorAccessorImpl}"
        //     [CONSTANT_Class_info] for above
        //     [UTF-8] [Target class's name]
        //     [CONSTANT_Class_info] for above
        // ^   [UTF-8] [Serialization: Class's name in which to invoke constructor]
        // ^   [CONSTANT_Class_info] for above
        //     [UTF-8] target method or constructor name
        //     [UTF-8] target method or constructor signature
        //     [CONSTANT_NameAndType_info] for above
        //     [CONSTANT_Methodref_info or CONSTANT_InterfaceMethodref_info] for target method
        //     [UTF-8] "invoke" or "newInstance"
        //     [UTF-8] invoke or newInstance descriptor
        //     [UTF-8] descriptor for type of non-primitive parameter 1
        //     [CONSTANT_Class_info] for type of non-primitive parameter 1
        //     ...
        //     [UTF-8] descriptor for type of non-primitive parameter n
        //     [CONSTANT_Class_info] for type of non-primitive parameter n
        // +   [UTF-8] "java/lang/Exception"
        // +   [CONSTANT_Class_info] for above
        // +   [UTF-8] "java/lang/ClassCastException"
        // +   [CONSTANT_Class_info] for above
        // +   [UTF-8] "java/lang/NullPointerException"
        // +   [CONSTANT_Class_info] for above
        // +   [UTF-8] "java/lang/IllegalArgumentException"
        // +   [CONSTANT_Class_info] for above
        // +   [UTF-8] "java/lang/InvocationTargetException"
        // +   [CONSTANT_Class_info] for above
        // +   [UTF-8] "<init>"
        // +   [UTF-8] "()V"
        // +   [CONSTANT_NameAndType_info] for above
        // +   [CONSTANT_Methodref_info] for NullPointerException's constructor
        // +   [CONSTANT_Methodref_info] for IllegalArgumentException's constructor
        // +   [UTF-8] "(Ljava/lang/String;)V"
        // +   [CONSTANT_NameAndType_info] for "<init>(Ljava/lang/String;)V"
        // +   [CONSTANT_Methodref_info] for IllegalArgumentException's constructor taking a String
        // +   [UTF-8] "(Ljava/lang/Throwable;)V"
        // +   [CONSTANT_NameAndType_info] for "<init>(Ljava/lang/Throwable;)V"
        // +   [CONSTANT_Methodref_info] for InvocationTargetException's constructor
        // +   [CONSTANT_Methodref_info] for "super()"
        // +   [UTF-8] "java/lang/Object"
        // +   [CONSTANT_Class_info] for above
        // +   [UTF-8] "toString"
        // +   [UTF-8] "()Ljava/lang/String;"
        // +   [CONSTANT_NameAndType_info] for "toString()Ljava/lang/String;"
        // +   [CONSTANT_Methodref_info] for Object's toString method
        // +   [UTF-8] "Code"
        // +   [UTF-8] "Exceptions"
        //  *  [UTF-8] "java/lang/Boolean"
        //  *  [CONSTANT_Class_info] for above
        //  *  [UTF-8] "(Z)V"
        //  *  [CONSTANT_NameAndType_info] for above
        //  *  [CONSTANT_Methodref_info] for above
        //  *  [UTF-8] "booleanValue"
        //  *  [UTF-8] "()Z"
        //  *  [CONSTANT_NameAndType_info] for above
        //  *  [CONSTANT_Methodref_info] for above
        //  *  [UTF-8] "java/lang/Byte"
        //  *  [CONSTANT_Class_info] for above
        //  *  [UTF-8] "(B)V"
        //  *  [CONSTANT_NameAndType_info] for above
        //  *  [CONSTANT_Methodref_info] for above
        //  *  [UTF-8] "byteValue"
        //  *  [UTF-8] "()B"
        //  *  [CONSTANT_NameAndType_info] for above
        //  *  [CONSTANT_Methodref_info] for above
        //  *  [UTF-8] "java/lang/Character"
        //  *  [CONSTANT_Class_info] for above
        //  *  [UTF-8] "(C)V"
        //  *  [CONSTANT_NameAndType_info] for above
        //  *  [CONSTANT_Methodref_info] for above
        //  *  [UTF-8] "charValue"
        //  *  [UTF-8] "()C"
        //  *  [CONSTANT_NameAndType_info] for above
        //  *  [CONSTANT_Methodref_info] for above
        //  *  [UTF-8] "java/lang/Double"
        //  *  [CONSTANT_Class_info] for above
        //  *  [UTF-8] "(D)V"
        //  *  [CONSTANT_NameAndType_info] for above
        //  *  [CONSTANT_Methodref_info] for above
        //  *  [UTF-8] "doubleValue"
        //  *  [UTF-8] "()D"
        //  *  [CONSTANT_NameAndType_info] for above
        //  *  [CONSTANT_Methodref_info] for above
        //  *  [UTF-8] "java/lang/Float"
        //  *  [CONSTANT_Class_info] for above
        //  *  [UTF-8] "(F)V"
        //  *  [CONSTANT_NameAndType_info] for above
        //  *  [CONSTANT_Methodref_info] for above
        //  *  [UTF-8] "floatValue"
        //  *  [UTF-8] "()F"
        //  *  [CONSTANT_NameAndType_info] for above
        //  *  [CONSTANT_Methodref_info] for above
        //  *  [UTF-8] "java/lang/Integer"
        //  *  [CONSTANT_Class_info] for above
        //  *  [UTF-8] "(I)V"
        //  *  [CONSTANT_NameAndType_info] for above
        //  *  [CONSTANT_Methodref_info] for above
        //  *  [UTF-8] "intValue"
        //  *  [UTF-8] "()I"
        //  *  [CONSTANT_NameAndType_info] for above
        //  *  [CONSTANT_Methodref_info] for above
        //  *  [UTF-8] "java/lang/Long"
        //  *  [CONSTANT_Class_info] for above
        //  *  [UTF-8] "(J)V"
        //  *  [CONSTANT_NameAndType_info] for above
        //  *  [CONSTANT_Methodref_info] for above
        //  *  [UTF-8] "longValue"
        //  *  [UTF-8] "()J"
        //  *  [CONSTANT_NameAndType_info] for above
        //  *  [CONSTANT_Methodref_info] for above
        //  *  [UTF-8] "java/lang/Short"
        //  *  [CONSTANT_Class_info] for above
        //  *  [UTF-8] "(S)V"
        //  *  [CONSTANT_NameAndType_info] for above
        //  *  [CONSTANT_Methodref_info] for above
        //  *  [UTF-8] "shortValue"
        //  *  [UTF-8] "()S"
        //  *  [CONSTANT_NameAndType_info] for above
        //  *  [CONSTANT_Methodref_info] for above

        short numCPEntries = NUM_BASE_CPOOL_ENTRIES + NUM_COMMON_CPOOL_ENTRIES;
        boolean usesPrimitives = usesPrimitiveTypes();
        if (usesPrimitives) {
            numCPEntries += NUM_BOXING_CPOOL_ENTRIES;
        }
        if (forSerialization) {
            numCPEntries += NUM_SERIALIZATION_CPOOL_ENTRIES;
        }

        // Add in variable-length number of entries to be able to describe
        // non-primitive parameter types and checked exceptions.
        numCPEntries += (short) (2 * numNonPrimitiveParameterTypes());

        asm.emitShort(add(numCPEntries, S1));

        final String generatedName = generateName(isConstructor, forSerialization);
        asm.emitConstantPoolUTF8(generatedName);
        asm.emitConstantPoolClass(asm.cpi());
        thisClass = asm.cpi();
        if (isConstructor) {
            if (forSerialization) {
                asm.emitConstantPoolUTF8
                    ("sun/reflect/SerializationConstructorAccessorImpl");
            } else {
                asm.emitConstantPoolUTF8("sun/reflect/ConstructorAccessorImpl");
            }
        } else {
            asm.emitConstantPoolUTF8("sun/reflect/MethodAccessorImpl");
        }
        asm.emitConstantPoolClass(asm.cpi());
        superClass = asm.cpi();
        asm.emitConstantPoolUTF8(getClassName(declaringClass, false));
        asm.emitConstantPoolClass(asm.cpi());
        targetClass = asm.cpi();
        short serializationTargetClassIdx = (short) 0;
        if (forSerialization) {
            asm.emitConstantPoolUTF8(getClassName(serializationTargetClass, false));
            asm.emitConstantPoolClass(asm.cpi());
            serializationTargetClassIdx = asm.cpi();
        }
        asm.emitConstantPoolUTF8(name);
        asm.emitConstantPoolUTF8(buildInternalSignature());
        asm.emitConstantPoolNameAndType(sub(asm.cpi(), S1), asm.cpi());
        if (isInterface()) {
            asm.emitConstantPoolInterfaceMethodref(targetClass, asm.cpi());
        } else {
            if (forSerialization) {
                asm.emitConstantPoolMethodref(serializationTargetClassIdx, asm.cpi());
            } else {
                asm.emitConstantPoolMethodref(targetClass, asm.cpi());
            }
        }
        targetMethodRef = asm.cpi();
        if (isConstructor) {
            asm.emitConstantPoolUTF8("newInstance");
        } else {
            asm.emitConstantPoolUTF8("invoke");
        }
        invokeIdx = asm.cpi();
        if (isConstructor) {
            asm.emitConstantPoolUTF8("([Ljava/lang/Object;)Ljava/lang/Object;");
        } else {
            asm.emitConstantPoolUTF8
                ("(Ljava/lang/Object;[Ljava/lang/Object;)Ljava/lang/Object;");
        }
        invokeDescriptorIdx = asm.cpi();

        // Output class information for non-primitive parameter types
        nonPrimitiveParametersBaseIdx = add(asm.cpi(), S2);
        for (int i = 0; i < parameterTypes.length; i++) {
            Class<?> c = parameterTypes[i];
            if (!isPrimitive(c)) {
                asm.emitConstantPoolUTF8(getClassName(c, false));
                asm.emitConstantPoolClass(asm.cpi());
            }
        }

        // Entries common to FieldAccessor, MethodAccessor and ConstructorAccessor
        emitCommonConstantPoolEntries();

        // Boxing entries
        if (usesPrimitives) {
            emitBoxingContantPoolEntries();
        }

        if (asm.cpi() != numCPEntries) {
            throw new InternalError("Adjust this code (cpi = " + asm.cpi() +
                                    ", numCPEntries = " + numCPEntries + ")");
        }

        // Access flags
        asm.emitShort(ACC_PUBLIC);

        // This class
        asm.emitShort(thisClass);

        // Superclass
        asm.emitShort(superClass);

        // Interfaces count and interfaces
        asm.emitShort(S0);

        // Fields count and fields
        asm.emitShort(S0);

        // Methods count and methods
        asm.emitShort(NUM_METHODS);

        emitConstructor();
        emitInvoke();

        // Additional attributes (none)
        asm.emitShort(S0);

        // Load class
        vec.trim();
        final byte[] bytes = vec.getData();
        // Note: the class loader is the only thing that really matters
        // here -- it's important to get the generated code into the
        // same namespace as the target class. Since the generated code
        // is privileged anyway, the protection domain probably doesn't
        // matter.
        return AccessController.doPrivileged(
            new PrivilegedAction<MagicAccessorImpl>() {
                public MagicAccessorImpl run() {
                        try {
                        return (MagicAccessorImpl)
                        ClassDefiner.defineClass
                                (generatedName,
                                 bytes,
                                 0,
                                 bytes.length,
                                 declaringClass.getClassLoader()).newInstance();
                        } catch (InstantiationException | IllegalAccessException e) {
                            throw new InternalError(e);
                        }
                    }
                });
    }

```

在 `ClassDefiner.defineClass` 方法实现中，每被调用一次都会生成一个DelegatingClassLoader类加载器对象 ，这里每次都生成新的类加载器，是为了性能考虑，在某些情况下可以卸载这些生成的类，因为类的卸载是只有在类加载器可以被回收的情况下才会被回收的，如果用了原来的类加载器，那可能导致这些新创建的类一直无法被卸载。

而反射生成的类，有时候可能用了就可以卸载了，所以使用其独立的类加载器，从而使得更容易控制反射类的生命周期。


## 反射有关的示例
### 可变参数方法的反射

```java
public static void me(Object ... objects){
    for (Object object : objects) {
        System.out.println(object);
    }
}
@Test
public void  test() throws Exception {
    Class clazz = this.getClass();
    //Method method = clazz.getMethod("me",(new Object[0]).getClass());
    //Method method = clazz.getMethod("me",Array.newInstance(Object.class,0).getClass());
    Method method = clazz.getMethod("me",Class.forName("[Ljava.lang.Object;"));
    //1
    Object objs = Array.newInstance(object.class,2);
    Array.set(objs,0,1);
    Array.set(objs,1,"test");
    method.invoke(clazz,objs);
    //2
    Object[] obj = {1,"test"}
    method.invoke(clazz,new Object[]{obj});
    

    //例如对于String的可变参数可通过如下方式去调用
    Object[] arr = (Object[])Array.newInstance(String.class, 5);
    Array.set(arr, 0, "5");
    Array.set(arr, 1, "1");
    Array.set(arr, 2, "9");
    Array.set(arr, 3, "3");
    Array.set(arr, 4, "7");
    
    method.invoke(clazz,new Object[]{arr});
}
```

可变参数不可直接显式使用 null 作为参数

```java
public class TestStatic {
    public static void main(String[] args) {
        String s = null;
        m1(s);
        Util.log("begin null");
        m1(null);
    }

    private static void m1(String... strs) {
        System.out.println(strs.length);
    }

}
```

```java
0: aconst_null          //将null压入操作栈
1: astore_1             //弹出栈顶(null)存储到本地变量1
2: iconst_1             //压栈1此时已经到方法m1了，在初始化参数，此值作为数组长度
3: anewarray     #2     //新建数组            // class java/lang/String
6: dup                  //复制数组指针引用
7: iconst_0             //压栈0，作为数组0角标
8: aload_1              //取本地变量1值压栈，作为数组0的值
9: aastore              //根据栈顶的引用型数值（value）、数组下标（index）、数组引用（arrayref）出栈，将数值存入对应的数组元素中
10: invokestatic  #3    //此时实际传递的是一个数组，只是0位置为null的元素 Method m1:([Ljava/lang/String;)V
13: iconst_1
14: anewarray     #4    //class java/lang/Object
17: dup
18: iconst_0
19: ldc           #5    //String begin null
1: aastore
22: invokestatic  #6    //Method li/Util.log:([Ljava/lang/Object;)V
25: aconst_null         //此处并没有新建数组操作，直接压栈null
26: invokestatic  #3    //此处一定会抛出空指针  Method m1:([Ljava/lang/String;)V
29: return
```

### 反射工具类创建数组
```java
int arr[] = (int[])Array.newInstance(int.class, 5);
Array.set(arr, 0, 5);
Array.set(arr, 1, 1);
Array.set(arr, 2, 9);
Array.set(arr, 3, 3);
Array.set(arr, 4, 7);
System.out.print("The array elements are: ");
for(int i: arr) {
    System.out.print(i + " ");
}
```
