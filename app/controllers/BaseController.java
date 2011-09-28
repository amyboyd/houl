package controllers;

import chatapp.Constants;
import models.*;
import play.mvc.*;

/**
 * All controllers should extend from this class (there may be intermediate classes).
 */
abstract public class BaseController extends Controller {
    /**
     * Try to authenticate via session and saved cookie.
     *
     * These keys will be added to the HTTP request and render args:
     * - isAuth - boolean
     * - currentUser - {@link User} or null.
     * - some more depending on the page context
     */
    @Before(priority = 1)
    public static void authenticate() {
        // A convenient way to remember the page to redirect to after login/out or registration.
        // Just set "forward=..." in the link's target URL.
        if (params._contains("forward")) {
            session.put("forward", params.get("forward"));
        }

        // Try to authenticate user.
        User user = UserAuth.findLoggedInUser();
        if (user != null) {
            postSuccessfulAuthenticate(user);
            return;
        }

        postFailedAuthenticate();
    }

    @Before(priority = 10)
    public static void setTemplateVars() {
        renderArgs.put("SITE_NAME", Constants.SITE_NAME);
        renderArgs.put("IS_DEV", Constants.IS_DEV);
        renderArgs.put("IS_PROD", Constants.IS_PROD);
    }

    @Util
    private static void postSuccessfulAuthenticate(User user) {
        request.args.put("isAuth", true);
        renderArgs.put("isAuth", true);

        request.args.put("currentUser", user);
        renderArgs.put("currentUser", user);
    }

    @Util
    private static void postFailedAuthenticate() {
        request.args.put("isAuth", false);
        renderArgs.put("isAuth", false);

        request.args.put("currentUser", null);
        renderArgs.put("currentUser", null);
    }

    /**
     * Returns the authenticated user if there is one.
     * Otherwise redirects to the login page.
     */
    @Util
    protected static User requireAuthenticatedUser() {
        if (isAuth()) {
            return (User) request.args.get("currentUser");
        } else {
            flash.error("You must be logged in to see that page");
            UserAuth.login(request.url, null);
            return null; // for the compiler only.
        }
    }

    /**
     * If the request does not use the method "method", sends an error response.
     * @param method Not case-sensitive. One of the HTTP methods, e.g. "post".
     */
    @Util
    protected static void requireHttpMethod(String method) {
        method = method.toUpperCase();
        if (!request.method.equals(method)) {
            error("Must use HTTP method: " + method);
        }
    }

    /**
     * @return True if logged in.
     */
    @Util
    protected static boolean isAuth() {
        return (Boolean) play.mvc.Http.Request.current().args.get("isAuth");
    }

    /**
     * If the request parameters contain a page number, return that, else 1. If the return
     * value is less than 1, it is changed to equal 1. The page number is also added to
     * the render args as the variable "page".
     * @return A number greater than or equal to 1.
     */
    @Util
    protected static int getPageNumber() {
        int page = (params._contains("page") ? params.get("page", Integer.class).intValue() : 1);
        if (page < 1) {
            page = 1;
        }
        renderArgs.put("page", page);
        return page;
    }

    /**
     * Redirects to previous page if "forward" is in the request params or session, else
     * does nothing. If the request is AJAX, returns status 200.
     *
     * Be sure to have a backup redirect is this method fails.
     */
    @Util
    protected static void redirectToForwardURL() {
        if (request.isAjax()) {
            ok();
        }

        String url = null;

        if ((url == null || url.isEmpty()) && params._contains("forward")) {
            url = params.get("forward");
        }
        if ((url == null || url.isEmpty()) && session.contains("forward")) {
            url = session.get("forward");
            session.remove("forward");
        }
        if (url != null && url.equals(request.path)) {
            // Prevent redirect loop.
            url = null;
        }

        if (url != null && !url.isEmpty()) {
            redirect(url);
        }
    }

    @Util
    static Relationship getRelationshipWithOtherUser(Long otherUserId) {
        User currentUser = requireAuthenticatedUser();
        notFoundIfNull(otherUserId);
        User otherUser = User.findById(otherUserId);
        notFoundIfNull(otherUser);
        
        return Relationship.findByUsers(otherUser, currentUser);
    }
}
