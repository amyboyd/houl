package chatapp;

import play.Play;

final public class Constants {
    private Constants() {
    }

    public static final String SITE_NAME = play.Play.configuration.getProperty("application.name");

    public static final String FORM_HAD_ERRORS_MESSAGE = "Sorry, that's not quite right - please fix the errors below";

    public static final boolean IS_DEV = Play.id.equals("dev");

    public static final boolean IS_PROD = Play.id.equals("prod");

}
