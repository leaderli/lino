---
tags:
  - java/spring/autowired
date updated: 2022-04-17 19:57
---


```java
package com.leaderli.demo.bean;  
  
  
import org.springframework.beans.factory.BeanFactory;  
import org.springframework.beans.factory.annotation.Autowired;  
import org.springframework.stereotype.Component;  
  
@Component  
public class BeAutowired {  
    static {  
        System.out.println("-------BeAutowired--------");  
    }  
  
    @Autowired  
    public void set(BeanFactory beanFactory){  
        System.out.println(beanFactory);  
    }  
  
}
```

测试类

```java
package com.leaderli.demo.bean;  
  
import org.junit.jupiter.api.Test;  
import org.springframework.context.annotation.AnnotationConfigApplicationContext;  
  


class BeAutowiredTest {  
  
    @Test  
    public void test() {  
  
  
        AnnotationConfigApplicationContext applicationContext = new AnnotationConfigApplicationContext();  
        applicationContext.scan(BeAutowired.class.getPackage().getName());  
        applicationContext.refresh();  
        System.out.println(applicationContext.getBean(BeAutowired.class));  
  
    }  
}
```

通过断点

![[Pasted image 20220522101328.png]]


```java
protected void populateBean(String beanName, RootBeanDefinition mbd, @Nullable BeanWrapper bw) {  
   if (bw == null) {  
      if (mbd.hasPropertyValues()) {  
         throw new BeanCreationException(  
               mbd.getResourceDescription(), beanName, "Cannot apply property values to null instance");  
      }  
      else {  

         return;  
      }  
   }  
  

   if (!mbd.isSynthetic() && hasInstantiationAwareBeanPostProcessors()) {  
      for (BeanPostProcessor bp : getBeanPostProcessors()) {  
         if (bp instanceof InstantiationAwareBeanPostProcessor) {  
            InstantiationAwareBeanPostProcessor ibp = (InstantiationAwareBeanPostProcessor) bp;  
            if (!ibp.postProcessAfterInstantiation(bw.getWrappedInstance(), beanName)) {  
               continueWithPropertyPopulation = false;  
               break;  
            }  
         }  
      }  
   }  
  
   if (!continueWithPropertyPopulation) {  
      return;  
   }  
  
   PropertyValues pvs = (mbd.hasPropertyValues() ? mbd.getPropertyValues() : null);  
  
   int resolvedAutowireMode = mbd.getResolvedAutowireMode();  
   if (resolvedAutowireMode == AUTOWIRE_BY_NAME || resolvedAutowireMode == AUTOWIRE_BY_TYPE) {  
      MutablePropertyValues newPvs = new MutablePropertyValues(pvs);  

      if (resolvedAutowireMode == AUTOWIRE_BY_NAME) {  
         autowireByName(beanName, mbd, bw, newPvs);  
      }  

      if (resolvedAutowireMode == AUTOWIRE_BY_TYPE) {  
         autowireByType(beanName, mbd, bw, newPvs);  
      }  
      pvs = newPvs;  
   }  
  
   boolean hasInstAwareBpps = hasInstantiationAwareBeanPostProcessors();  
   boolean needsDepCheck = (mbd.getDependencyCheck() != AbstractBeanDefinition.DEPENDENCY_CHECK_NONE);  
  
   PropertyDescriptor[] filteredPds = null;  
   if (hasInstAwareBpps) {  
      if (pvs == null) {  
         pvs = mbd.getPropertyValues();  
      }  
      for (BeanPostProcessor bp : getBeanPostProcessors()) {  
	      // AutowiredAnnotationBeanPostProcessor 在此处被执行
         if (bp instanceof InstantiationAwareBeanPostProcessor) {  
            InstantiationAwareBeanPostProcessor ibp = (InstantiationAwareBeanPostProcessor) bp;  
            PropertyValues pvsToUse = ibp.postProcessProperties(pvs, bw.getWrappedInstance(), beanName);  
            if (pvsToUse == null) {  
               if (filteredPds == null) {  
                  filteredPds = filterPropertyDescriptorsForDependencyCheck(bw, mbd.allowCaching);  
               }  
               pvsToUse = ibp.postProcessPropertyValues(pvs, filteredPds, bw.getWrappedInstance(), beanName);  
               if (pvsToUse == null) {  
                  return;  
               }  
            }  
            pvs = pvsToUse;  
         }  
      }  
   }  
   if (needsDepCheck) {  
      if (filteredPds == null) {  
         filteredPds = filterPropertyDescriptorsForDependencyCheck(bw, mbd.allowCaching);  
      }  
      checkDependencies(beanName, mbd, filteredPds, pvs);  
   }  
  
   if (pvs != null) {  
      applyPropertyValues(beanName, mbd, bw, pvs);  
   }  
}
```

通过反射，完成set方法的执行
```java
@Override  
public PropertyValues postProcessProperties(PropertyValues pvs, Object bean, String beanName) {  
   InjectionMetadata metadata = findAutowiringMetadata(beanName, bean.getClass(), pvs);  
   try {  
      metadata.inject(bean, beanName, pvs);  
   }  
   catch (BeanCreationException ex) {  
      throw ex;  
   }  
   catch (Throwable ex) {  
      throw new BeanCreationException(beanName, "Injection of autowired dependencies failed", ex);  
   }  
   return pvs;  
}
```

那么我们找到 `getBeanPostProcessors()` 的加载过程即可


![[Pasted image 20220522103938.png]]

我们可以看到加载 beanPostProcessor  的方法只有一个，通过对其断点我们可以看到实际是在


```java
public static void registerBeanPostProcessors(  
      ConfigurableListableBeanFactory beanFactory, AbstractApplicationContext applicationContext) {  
   //
   String[] postProcessorNames = beanFactory.getBeanNamesForType(BeanPostProcessor.class, true, false);  
  

   beanFactory.addBeanPostProcessor(new BeanPostProcessorChecker(beanFactory, beanProcessorTargetCount));  
  

   List<BeanPostProcessor> internalPostProcessors = new ArrayList<>();  
   List<String> orderedPostProcessorNames = new ArrayList<>();  
   List<String> nonOrderedPostProcessorNames = new ArrayList<>();  
   for (String ppName : postProcessorNames) {  
      if (beanFactory.isTypeMatch(ppName, PriorityOrdered.class)) {  
         // 查找org.springframework.context.annotation.internalConfigurationAnnotationProcessor的实现bean
         BeanPostProcessor pp = beanFactory.getBean(ppName, BeanPostProcessor.class);  
         priorityOrderedPostProcessors.add(pp);  
         if (pp instanceof MergedBeanDefinitionPostProcessor) {  
            internalPostProcessors.add(pp);  
         }  
      }  
      else if (beanFactory.isTypeMatch(ppName, Ordered.class)) {  
         orderedPostProcessorNames.add(ppName);  
      }  
      else {  
         nonOrderedPostProcessorNames.add(ppName);  
      }  
   }  
  

   sortPostProcessors(priorityOrderedPostProcessors, beanFactory);  
   registerBeanPostProcessors(beanFactory, priorityOrderedPostProcessors);  
  

   List<BeanPostProcessor> orderedPostProcessors = new ArrayList<>(orderedPostProcessorNames.size());  
   for (String ppName : orderedPostProcessorNames) {  
      BeanPostProcessor pp = beanFactory.getBean(ppName, BeanPostProcessor.class);  
      orderedPostProcessors.add(pp);  
      if (pp instanceof MergedBeanDefinitionPostProcessor) {  
         internalPostProcessors.add(pp);  
      }  
   }  
   sortPostProcessors(orderedPostProcessors, beanFactory);  
   registerBeanPostProcessors(beanFactory, orderedPostProcessors);  
  

   List<BeanPostProcessor> nonOrderedPostProcessors = new ArrayList<>(nonOrderedPostProcessorNames.size());  
   for (String ppName : nonOrderedPostProcessorNames) {  
      BeanPostProcessor pp = beanFactory.getBean(ppName, BeanPostProcessor.class);  
      nonOrderedPostProcessors.add(pp);  
      if (pp instanceof MergedBeanDefinitionPostProcessor) {  
         internalPostProcessors.add(pp);  
      }  
   }  
   registerBeanPostProcessors(beanFactory, nonOrderedPostProcessors);  
  

   sortPostProcessors(internalPostProcessors, beanFactory);  
   registerBeanPostProcessors(beanFactory, internalPostProcessors);  
  
}
```

上述代码的 `getBeanNamesForType` 通过断点，我们可以看到其实际查找 `this.beanDefinitionNames` 找到 `org.springframework.context.annotation.internalConfigurationAnnotationProcessor` 的
![[Pasted image 20220522105805.png]]

而 `this.beanDefinitionNames`  只有在方法 `DefaultListableBeanFactory#registerBeanDefinition` 中才会被添加

通过断点可以看到其是在 `AnnotationConfigApplicationContext` 的构造器中初始化的。

![[Pasted image 20220522110204.png]]

```java
public AnnotationConfigApplicationContext() {  
   this.reader = new AnnotatedBeanDefinitionReader(this);  
   this.scanner = new ClassPathBeanDefinitionScanner(this);  
}
```