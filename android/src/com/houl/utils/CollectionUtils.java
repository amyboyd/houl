package com.houl.utils;

import java.io.*;
import java.net.*;
import java.util.*;

/**
 * Utility class.
 */
final public class CollectionUtils {
    private CollectionUtils() {
    }

    /**
     * Canonicalize the query string as required by Amazon.
     *
     * @param sortedParamMap Parameter name-value pairs in lexicographical order.
     * @return Canonical form of query string.
     */
    public static String mapToQueryString(final SortedMap<String, String> sortedParamMap) {
        if (sortedParamMap.isEmpty()) {
            throw new IllegalArgumentException("Map must not be empty");
        }

        final StringBuffer buffer = new StringBuffer(350); // not using StringBuilder because this must be thread-safe.
        final Iterator<Map.Entry<String, String>> iter = sortedParamMap.entrySet().iterator();

        while (iter.hasNext()) {
            final Map.Entry<String, String> pair = iter.next();
            buffer.append(percentEncodeRfc3986(pair.getKey()));
            buffer.append('=');
            buffer.append(percentEncodeRfc3986(pair.getValue()));
            if (iter.hasNext()) {
                buffer.append('&');
            }
        }

        return buffer.toString();
    }

    /**
     * Takes a query string, separates the constituent name-value pairs and stores them in a
     * hashmap.
     */
    public static Map<String, String> queryStringToMap(final String queryString) {
        final String[] pairs = queryString.split("&");
        final Map<String, String> map = new HashMap<String, String>(pairs.length);

        for (final String pair: pairs) {
            if (pair.length() < 1) {
                continue;
            }

            String[] tokens = pair.split("=", 2);
            for (int j = 0; j < tokens.length; j++) {
                try {
                    tokens[j] = URLDecoder.decode(tokens[j], "UTF-8");
                } catch (final UnsupportedEncodingException ex) {
                    ex.printStackTrace();
                }
            }
            switch (tokens.length) {
                case 1: {
                    if (pair.charAt(0) == '=') {
                        map.put("", tokens[0]);
                    } else {
                        map.put(tokens[0], "");
                    }
                    break;
                }
                case 2: {
                    map.put(tokens[0], tokens[1]);
                    break;
                }
            }
        }
        return map;
    }

    /**
     * Percent-encode values according the RFC 3986. The built-in Java URLEncoder does not encode
     * according to the RFC,
     * so we make the extra replacements.
     *
     * @param string Decoded string.
     * @return Encoded string per RFC 3986.
     */
    public static String percentEncodeRfc3986(final String string) {
        try {
            return URLEncoder.encode(string, "UTF-8").replace("+", "%20").replace("*", "%2A").replace("%7E", "~");
        } catch (final UnsupportedEncodingException e) {
            return string;
        }
    }
}
