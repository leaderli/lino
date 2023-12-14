---
date created: 2022-03-22 17:22
aliases: Java——cli
tags:
  - java/框架/picocli
date updated: 2022-03-28 14:59
---


```java
import picocli.CommandLine;
import picocli.CommandLine.Command;
import picocli.CommandLine.Option;
import picocli.CommandLine.Parameters;

import java.io.File;
import java.math.BigInteger;
import java.nio.file.Files;
import java.security.MessageDigest;
import java.util.concurrent.Callable;

@Command(name = "checksum", mixinStandardHelpOptions = true, version = "checksum 4.0",
         description = "Prints the checksum (SHA-256 by default) of a file to STDOUT.")
class CheckSum implements Callable<Integer> {

    @Parameters(index = "0", description = "The file whose checksum to calculate.")
    private File file;

    @Option(names = {"-a", "--algorithm"}, description = "MD5, SHA-1, SHA-256, ...")
    private String algorithm = "SHA-256";

    @Override
    public Integer call() throws Exception { // your business logic goes here...
        byte[] fileContents = Files.readAllBytes(file.toPath());
        byte[] digest = MessageDigest.getInstance(algorithm).digest(fileContents);
        System.out.printf("%0" + (digest.length*2) + "x%n", new BigInteger(1, digest));
        return 0;
    }

    // this example implements Callable, so parsing, error handling and handling user
    // requests for usage help or version help can be done with one line of code.
    public static void main(String... args) {
        int exitCode = new CommandLine(new CheckSum()).execute(args);
        System.exit(exitCode);
    }
}
```


设置默认子命令

```java
import picocli.CommandLine;
import java.util.concurrent.Callable;

@CommandLine.Command
public class PicocliTest {

    public static void main(String... args) {
        new CommandLine(new Foo()).execute(args);
        new CommandLine(new Foo()).execute("bar");
    }

    @CommandLine.Command(name = "foo", subcommands = {Bar.class, CommandLine.HelpCommand.class}
    )
    public static class Foo implements Callable<Integer> {

        @Override
        public Integer call() {
            int exitCode = new CommandLine(new Foo()).execute("help");
            return exitCode;
        }


    }

    @CommandLine.Command(name = "bar", helpCommand = true, description = "I'm a subcommand of `foo`")
    public static class Bar implements Callable<Integer> {
        @CommandLine.Option(names = "-y", required = true)
        int y;

        @Override
        public Integer call() {
            System.out.printf("hi from bar, y=%d%n", y);
            return 23;
        }
    }

}
```

```log
Usage: foo [COMMAND]
Commands:
  bar   I'm a subcommand of `foo`
  help  Display help information about the specified command.
hi from bar, y=0
```
### 参考文档
[picocli](https://picocli.info/)