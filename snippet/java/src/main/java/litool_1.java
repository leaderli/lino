import io.leaderli.litool.core.meta.Lino;

import java.util.List;
import java.util.Map;

/**
 * @author leaderli
 * @since ${DATE} ${TIME}
 */
public class litool_1 {

    void test() {
        List<Map<String, String>> map = null;
        Object obj = map;

        Lino.of(obj)
                .cast(List.class)
                .filter(l -> l.size() > 1)
                .map(l -> l.get(1))
                .cast(String.class, String.class)
                .map(m -> m.get("a"))
                .ifPresent(e -> System.out.println(e.length()))
                .ifAbsent(() -> System.out.println("null"));
    }
}
