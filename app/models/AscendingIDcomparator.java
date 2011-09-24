package models;

import java.util.*;
import play.db.jpa.Model;

/**
 * Compare {@link Model}s by ID.
 * Used with {@link Collections#sort(Comparator)}, the models will be sorted by ID.
 */
public class AscendingIDcomparator<T extends Model> implements Comparator<T> {
    public int compare(T o1, T o2) {
        return o1.id > o2.id ? 1 : o1.id == o2.id ? 0 : -1;
    }
}
