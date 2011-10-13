package com.houl.utils;

import java.io.UnsupportedEncodingException;
import java.net.MalformedURLException;
import java.net.URL;

/**
 * Utility class.
 */
final public class StringUtils {
    final private static String BOM_MARK = getBomMark();

    private StringUtils() {
    }

    public static String getBomMark() {
        try {
            return new String("\uFEFF".getBytes("UTF-8"));
        } catch (final UnsupportedEncodingException ex) {
            throw new RuntimeException(ex.getMessage());
        }
    }

    /**
     * Remove byte-order-mark from the start of a string.
     */
    public static String removeUtfBomMark(final String in) {
        if (in.startsWith(BOM_MARK)) {
            return in.replace(BOM_MARK, "");
        }
        return in;
    }

    public static URL stringToUrl(String in) {
        if (!in.startsWith("http")) {
            in = "http://" + in;
        }

        URL url;
        try {
            url = new URL(in);
        } catch (final MalformedURLException e) {
            throw new RuntimeException(e);
        }
        return url;
    }

    /**
     * Join each item of "inputsToJoin" in a string seperated by "seperator".
     */
    public static String join(Object[] inputsToJoin, char seperator) {
        StringBuilder sb = new StringBuilder(100);
        int i = 0;
        for (Object obj: inputsToJoin) {
            if (i++ > 0) {
                sb.append(seperator);
            }
            sb.append(obj);
        }
        return sb.toString();
    }
}
