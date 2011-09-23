package chatapp;

import play.templates.JavaExtensions;

/**
 * These methods are accessible in Play views.
 *
 * The first parameter of each method is the previous value in the method chain.
 */
final public class TemplateExtensions extends JavaExtensions {
    private TemplateExtensions() {
        // Prevent this class from being instantiated.
    }

    /**
     * Return a string with a maximum length of "length" characters.
     * If there are more than "length" characters, then string ends with an ellipsis ("...").
     */
    public static String ellipsis(final String text, int length) {
        // The letters [iIl1] are slim enough to only count as half a character.
        length += (int) Math.floor(text.replaceAll("[^iIl.,:;]", "").length() / 2.0d);

        try {
            return (text.length() > length
                    ? text.substring(0, length - 3) + "..."
                    : text);
        } catch (StringIndexOutOfBoundsException e) {
            return "";
        }
    }
}
