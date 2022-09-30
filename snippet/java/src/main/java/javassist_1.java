import javassist.ClassPool;
import javassist.CtClass;
import javassist.CtMethod;

/**
 * @author leaderli
 * @since 2022/9/30
 */

public class javassist_1 {

    public static final String[] value = new String[]{"Hello form javassist", "fuck", "fuck2"};

    static int i = 0;

    public static String value() {
        return value[i++];
    }

    public static void main(String args[]) throws Exception {

        ClassPool classPool = ClassPool.getDefault();


        CtClass ctClass = classPool.get("Welcome");
        CtMethod ctMethod = ctClass.getDeclaredMethod("sayHello");
        ctMethod.setBody("{ return javassist_1.value(); }");

        ctClass.toClass();

        System.out.println(Welcome.sayHello());
        System.out.println(Welcome.sayHello());
        System.out.println(Welcome.sayHello());

    }


}
class Welcome {


    public static String sayHello() {
        return "Hello!!!!";
    }

}
