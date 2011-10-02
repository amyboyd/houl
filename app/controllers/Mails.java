package controllers;

import chatapp.Bootstrap;
import models.User;
import play.mvc.Mailer;
import static chatapp.Constants.SITE_NAME;

/**
 * All outgoing emails are sent from here. The templates are located in "app/views/Mails/"
 * and there should be a HTML and plain-text template for most user-facing emails.
 */
public class Mails extends Mailer {
    private static final String EMAIL_ADDRESS = String.format("%s <%s>",
            SITE_NAME,
            play.Play.configuration.getProperty("application.emailAddress"));

    /**
     * After registering, send a welcome email, which also has a confirmation link.
     * @param user The new user.
     */
    public static void welcome(final User user) {
        setSubject("Thanks for joining %s. There is an important link inside.", SITE_NAME);
        addRecipient(formatAddress(user));
        setFrom(EMAIL_ADDRESS);
        setReplyTo(EMAIL_ADDRESS);

        send(user);
    }

    public static void forgotPassword(final User user) {
        setSubject("Forgot your password on " + SITE_NAME + "? Create a new password here");
        addRecipient(formatAddress(user));
        setFrom(EMAIL_ADDRESS);
        setReplyTo(EMAIL_ADDRESS);

        send(user);
    }

    public static void confirmEmailChange(final User user) {
        setSubject("Confirm your new email address");
        addRecipient(user.email);
        setFrom(EMAIL_ADDRESS);
        setReplyTo(EMAIL_ADDRESS);

        send(user);
    }

    public static void userFeedback(String message) {
        setSubject("User feedback");
        addRecipient(EMAIL_ADDRESS);
        setFrom(EMAIL_ADDRESS);

        send(message);
    }

    private static String formatAddress(final User user) {
        if (user.email == null) {
            if (Bootstrap.isRunning) {
                return play.Play.configuration.getProperty("application.emailAddress");
            }
            throw new IllegalStateException("User has no email: " + user);
        }
        return String.format("%s <%s>", user.toString(), user.email);
    }
}
