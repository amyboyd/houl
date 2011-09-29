package controllers;

import chatapp.Constants;
import com.google.javascript.jscomp.CompilationLevel;
import com.google.template.soy.SoyFileSet;
import com.google.template.soy.jssrc.SoyJsSrcOptions;
import com.google.template.soy.msgs.SoyMsgBundle;
import java.util.List;
import play.Play;
import play.libs.optimization.*;
import play.mvc.Controller;

/**
 * Serves CSS styles and JavaScripts, merged and compiled in production to improve performance.
 */
public class Bundles extends Controller {
    private static final Bundle styles = new StylesheetsBundle("style.css",
            "public/css/main.css",
            "public/css/auth.css",
            "public/css/unauth.css");

    private static final Bundle closure = new ClosureBundle(
            "closure.js",
            "closure/closure/bin/build/closurebuilder.py",
            //null,
            //CompilationLevel.WHITESPACE_ONLY,
            //CompilationLevel.SIMPLE_OPTIMIZATIONS,
            CompilationLevel.ADVANCED_OPTIMIZATIONS,
            new String[] {
                "closure/closure/goog",
                "closure/third_party/closure",
                "public/js/templates/compiled",
                "public/js/closure", },
            new String[] {
                "houl.pages", });

    public static void styles() {
        if (Constants.IS_PROD) {
            response.cacheFor("70d");
        } else {
            styles.getBundleFile().delete();
        }
        styles.applyToResponse(request, response);
    }

    public static void closure() {
        if (Constants.IS_PROD) {
            response.cacheFor("70d");
        } else {
            closure.getBundleFile().delete();
        }

        // Compile Soy file into a JS file.
        final SoyFileSet soys = new SoyFileSet.Builder().add(Play.getFile("public/js/templates/houl.soy")).build();
        final SoyJsSrcOptions options = new SoyJsSrcOptions();
        options.setCodeStyle(SoyJsSrcOptions.CodeStyle.CONCAT);
        options.setShouldProvideRequireSoyNamespaces(true);
        options.setIsUsingIjData(false);
        final List<String> jsTemplates = soys.compileToJsSrc(options, SoyMsgBundle.EMPTY);
        play.libs.IO.writeContent(
                jsTemplates.get(0),
                Play.getFile("public/js/templates/compiled/templates.js"));

        closure.applyToResponse(request, response);
    }
}
