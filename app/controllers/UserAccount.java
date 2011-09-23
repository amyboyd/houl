package controllers;

import chatapp.Constants;
import models.User;
import play.Logger;
import play.data.validation.Validation;

public class UserAccount extends BaseController {
    /**
     * Form to editPublicProfile profile.
     * Show subscription information (if Pro), and links to upgrade, downgrade and close shop.
     */
    public static void editPublicProfile(String forward) {
        requireAuthenticatedUser();
        render("UserAccount/profile.html");
    }

    /**
     * Save profile details. Avatar and images are not submitted to this action.
     */
    public static void editPublicProfileHandler(String forward) {
        requireHttpMethod("POST");
        checkAuthenticity();

        final User user = requireAuthenticatedUser();
        user.edit("user", params.all());

        validation.valid(user);
        if (Validation.hasErrors()) {
            Validation.keep();
            params.flash();
            flash.error(Constants.FORM_HAD_ERRORS_MESSAGE);
            editPublicProfile(forward);
        }

        user.save();

        flash.success("Your changes have been saved");
        redirectToForwardURL();
    }

    /**
     * Form to change email.
     */
    public static void changeEmail(String forward) {
        render("users/Profiles/change-email.html");
    }

    /**
     * Save user's new email defaultDeliveryAddress. No confirmation email is sent.
     */
    public static void changeEmailHandler(String newEmail, String forward) {
        checkAuthenticity();
        requireHttpMethod("POST");

        final User user = requireAuthenticatedUser();

        Validation.required("newEmail", newEmail).message("Please enter your new email address");
        Validation.email("newEmail", newEmail).message("That is not a valid format for an email address");
        Validation.isTrue("newEmail", !user.email.equals(newEmail)).message("You are already using that email address!");
        Validation.isTrue("newEmail", User.count("email", newEmail) == 0L).message("Another user is already using that email address. If this is a problem, please contact us.");

        if (Validation.hasErrors()) {
            params.flash();
            Validation.keep();
            changeEmail(params.get("forward"));
        }

        // All is OK.

        // Authentication depends on the email address, so re-authenticate.
        session.put("email", newEmail);
        response.setCookie("remember", play.libs.Crypto.sign(newEmail) + "-" + newEmail, "30d");

        user.email = newEmail;
        user.emailConfirmed = false;
        user.save();

        Mails.confirmEmailChange(user);

        flash.success("Please check your new email address' inbox. We have sent you a confirmation email.");
        redirectToForwardURL();
        Application.index();
    }

    public static void confirmEmail(final Long id, final String code) {
        final User user = User.findById(id);
        if (user == null) {
            error("No user with ID: " + id);
        } else if (user.getValidationCode().equals(code)) {
            user.emailConfirmed = true;
            user.save();
            Logger.info("User (%s) confirmed email address (%s)", user.id, user.email);
            flash.success("Your registration and email address have been confirmed.");
            redirect("/");
        } else {
            error("Wrong code (" + code + ") for ID (" + id + ")");
        }
    }

    public static void resendConfirmationEmail(String forward) {
        final User user = requireAuthenticatedUser();
        if (user.emailConfirmed) {
            flash.error("Your email address is already confirmed");
            redirectToForwardURL();
        } else if (user.email == null) {
            flash.error("You have not set an address address yet. You can do that just now, below.");
            changeEmail(forward);
        } else {
            Logger.info("Resending email address confirmation email to %s", user);
            controllers.Mails.welcome(user);
            flash.success("We have sent another email. Please check your inbox (and spam folder)");
            redirectToForwardURL();
        }
    }

    /**
     * Return plain-text describing the registration status of an email address.
     */
    public static void checkEmail(final String email) {
        if (email == null || email.isEmpty()) {
            renderText("");
        }
        if (!validation.email(email).ok) {
            renderText("This is not a valid email address.");
        }
        final User user = User.find("email = ?", email).first();
        if (user != null) {
            renderText("This email is registered to a user.");
        } else {
            renderText("This email has not been registered before.");
        }
    }
}
