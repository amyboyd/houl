package com.houl.utils;

import android.util.Log;
import java.util.*;
import org.json.*;

/**
 * Utility methods for the {@code org.json} package.
 */
final public class JSONUtils {
    private JSONUtils() {
    }

    public static Map<String, String> jsonObjectToMap(JSONObject json) {
        if (json == null || json.length() == 0) {
            return Collections.emptyMap();
        }

        try {
            Map<String, String> result = new HashMap<String, String>(json.length());
            JSONArray keys = json.names();
            for (int i = 0; i < keys.length(); i++) {
                String key = keys.getString(i);
                String value = json.getString(key);

                result.put(key, value);
            }
            return result;
        } catch (Exception ex) {
            Log.e(JSONUtils.class.getCanonicalName(), ex.getMessage() + ". JSON is: " + json);
            return Collections.emptyMap();
        }
    }

    public static String[] jsonArrayToArray(JSONArray json) {
        if (json == null || json.length() == 0) {
            return new String[0];
        }

        try {
            String[] result = new String[json.length()];
            for (int i = 0; i < json.length(); i++) {
                result[i] = json.getString(i);
            }
            return result;
        } catch (Exception ex) {
            Log.e(JSONUtils.class.getCanonicalName(), ex.getMessage() + ". JSON is: " + json);
            return new String[0];
        }
    }
}
