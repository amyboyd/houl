package controllers;

import chatapp.Constants;
import com.google.javascript.jscomp.CompilationLevel;
import play.libs.optimization.*;
import play.mvc.Controller;

/**
 * Serves CSS styles and JavaScripts, merged and compiled in production to improve performance.
 */
public class Bundles extends Controller {
    private static final Bundle styles = new StylesheetsBundle("style.css",
            "public/css/main.css",
            "public/css/messaging.css",
            "public/css/auth.css",
            "public/css/unauth.css");

    private static final Bundle scripts = new JavascriptsBundle("scripts.js",
            "public/js/jquery-1.5.min.js",
            "public/js/jquery.scrollTo-min.js",
            "public/js/templating.js",
            "public/js/chat.js").setCompilationLevel(CompilationLevel.SIMPLE_OPTIMIZATIONS);

    public static void styles() {
        if (Constants.IS_PROD) {
            response.cacheFor("70d");
        } else {
            styles.getBundleFile().delete();
        }
        styles.applyToResponse(request, response);
    }

    public static void scripts() {
        if (Constants.IS_PROD) {
            response.cacheFor("70d");
        }
        scripts.applyToResponse(request, response);
    }
}
