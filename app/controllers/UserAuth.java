package controllers;

import chatapp.Constants;
import models.User;
import play.Logger;
import play.data.validation.*;
import play.libs.Crypto;
import play.mvc.*;

/**
 * {@link User} authentication actions (login, logout, register, etc).
 */
public class UserAuth extends BaseController {
    private static final String LOGIN_SESSION = "login";

    private static final String REMEMBER_COOKIE = "remember";

    /**
     * These params can be put in the query string:
     * - forward - although this exists for all pages, it is most relevant here.
     * - overrideMessage - overrides the "flash" message on the page.
     */
    public static void login(String forward, String overrideMessage) {
        if (isAuth()) {
            redirectToForwardURL();
            renderText("forward not set");
        }
        render("UserAuth/login-or-register.html", forward, overrideMessage);
    }

    @Util
    public static User findLoggedInUser() {
        // Already logged in through the active session?
        if (session.contains(LOGIN_SESSION)) {
            User sessionUser = User.find("email", session.get(LOGIN_SESSION)).first();
            if (sessionUser != null) {
                return sessionUser;
            } else {
                Logger.info("User had email (%s) in session, but doesn't exist in DB", session.get(LOGIN_SESSION));

                // User was deleted from the database?
                session.remove(LOGIN_SESSION);
            }
        }

        // Login using the "remember me" cookie, if there is one.
        Http.Cookie remember = request.cookies.get(REMEMBER_COOKIE);
        if ((remember != null) && (remember.value.indexOf("-") > 0)) {
            // Cookie value is "[sign]-[email]", where [sign] is [email] encrypted with
            // this application's private key.
            String sign = remember.value.substring(0, remember.value.indexOf("-"));
            String email = remember.value.substring(remember.value.indexOf("-") + 1);
            if (Crypto.sign(email).equals(sign)) {
                User cookieUser = User.findByEmail(email);
                if (cookieUser != null) {
                    Logger.info("Login cookie is signed correctly. Logging in as: " + email);
                    session.put(LOGIN_SESSION, email);
                    return cookieUser;
                } else {
                    Logger.info("Failed to login through cookie. User doesn't exist anymore. Email %s", email);
                    response.removeCookie(REMEMBER_COOKIE);
                }
            } else {
                Logger.info("Cookie is not signed correctly. Sign = %s. Email = %s", sign, email);
            }
        }

        return null;
    }

    /**
     * Receive and validate the register form.
     * If an already-registered email address is submitted and the password is correct, user is logged in.
     */
    public static void registerHandler(String forward, String email, String password, String password2) {
        checkAuthenticity();

        String errorMessage = null;

        final User existingUserByEmail = User.findByEmail(email);
        if (existingUserByEmail != null) {
            if (existingUserByEmail.checkPassword(password)) {
                // Login (even though this is the register action).
                session.put(LOGIN_SESSION, email);
                flash.success("You are now logged in, " + email + ".");
                response.setCookie(REMEMBER_COOKIE, Crypto.sign(email) + "-" + email, "30d");
                existingUserByEmail.onLogin();
                redirectToForwardURL();
                redirect("/");
            } else {
                Logger.info("Email (%s) matches a user, password (%s) does not", email, password);
                errorMessage = "That email address is already registered by a user, and you didn't enter the correct password.";
            }
        }

        if (!validation.email(email).ok) {
            errorMessage = "Please enter a valid email address.";
        } else if (!password.equals(password2)) {
            errorMessage = "Passwords must match.";
        }

        if (errorMessage != null) {
            // Errors -- go back to the form.
            Logger.info("At least one error in registration form. Email = %s, password = %s, password2 = %s", email, password, password2);
            flash.error(errorMessage);
            params.flash();
            Validation.keep();

            if (request.headers.containsKey("referer")) {
                redirect(request.headers.get("referer").value());
            } else {
                login(forward, null);
            }
        }

        // Everything is OK, register.
        User user = new User(email, password);
        user.create();
        play.Logger.info("User has registered. ID = %d, email = %s", user.id, user.email);

        // Login.
        session.put(LOGIN_SESSION, email);
        response.setCookie(REMEMBER_COOKIE, Crypto.sign(email) + "-" + email, "30d");
        flash.success("Welcome to %s. Your unique PIN is %s", Constants.SITE_NAME, user.pin);
        redirectToForwardURL();
        redirect("/");
    }

    /**
     * Receive and validate the login form.
     */
    public static void loginHandler(String forward, String email, String password) {
        checkAuthenticity();

        if (email.isEmpty()) {
            flash.error("Please enter your email address first.");
            redirect(request.headers.get("referer").value());
        }

        User user = User.findByEmailAndPassword(email, password);
        if (user instanceof User) {
            // Correct email/password. Set cookie and session data so the user is logged in for 90 days.
            session.put(LOGIN_SESSION, user.email);
            flash.success("You are now logged in, " + user.name + ".");
            response.setCookie(REMEMBER_COOKIE, Crypto.sign(user.email) + "-" + user.email, "90d");
            user.onLogin();
            redirectToForwardURL();
            redirect("/");
        } else {
            flash.error("Incorrect email/password combination.");
            params.flash();
            redirect(request.headers.get("referer").value());
        }
    }

    /**
     * Logout and clear cookie/session.
     */
    public static void logout() {
        session.clear();
        response.setCookie(REMEMBER_COOKIE, "", "1d");
        flash.success("You have been logged out.");
        login(null, null);
    }

    public static void changePasswordHandler(String password) {
        requireHttpMethod("POST");

        final User user = requireAuthenticatedUser();
        user.password = password;
        user.save();
        ok();
    }
}
