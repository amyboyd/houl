package controllers;

import play.libs.optimization.*;
import play.mvc.Controller;

/**
 * Serves CSS styles and JavaScripts, merged and compiled in production to improve performance.
 */
public class Bundles extends Controller
{
    private static final StylesheetsBundle styles = new StylesheetsBundle("chat.css",
        "public/css/main.css"
        );

    private static final JavascriptsBundle scripts = new JavascriptsBundle("chat.js",
        "public/js/jquery-1.5.min.js",
        "public/js/jquery.scrollTo-min.js",
        "public/js/templating.js",
        "public/js/chat.js"
        ).setCompilationLevel(null); // @todo

    public static void styles()
    {
        response.cacheFor("12h");
        styles.applyToResponse(request, response);
    }

    public static void scripts()
    {
        response.cacheFor("12h");
        scripts.applyToResponse(request, response);
    }
}
