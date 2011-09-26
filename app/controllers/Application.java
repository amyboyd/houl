package controllers;

import java.util.Date;
import models.BuddyList;
import models.Relationship;
import models.User;

public class Application extends BaseController {
    /**
     * Just the HTML shell for the JS application to run in.
     */
    public static void index() {
        if (!isAuth()) {
            UserAuth.login(null, null);
        }
        render();
    }

    /**
     * Get a JSON array with details of the user's buddies and incoming requests..
     */
    public static void buddyListJson() {
        requireHttpMethod("GET");

        if (!isAuth()) {
            renderJSON("{\"error\":\"must login\"}");
        }

        final User user = requireAuthenticatedUser();
        final BuddyList buddyList = new BuddyList(user);
        renderJSON(buddyList.toJsonArray().toString());
    }

    /**
     * Accept or reject a request.
     *
     * @param requesterId The {@link User#id} of the user who made the request.
     * @param response "accept" or "reject".
     */
    public static void requestHandler(Long requesterId, String response) {
        requireHttpMethod("POST");

        User requester = User.findById(requesterId);
        if (requester == null) {
            error("Requester does not exist (ID " + requesterId + ")");
        }

        User currentUser = requireAuthenticatedUser();
        Relationship relationship = Relationship.findByUsers(requester, currentUser);
        if (relationship == null) {
            error("The request does not exist");
        } else if (relationship.isAccepted()) {
            error("Already accepted");
        }

        if (response.equals("accept")) {
            relationship.acceptedAt = new Date();
            relationship.save();
        } else if (response.equals("reject")) {
            relationship.delete();
        } else {
            error("Response must be 'accept' or 'reject', got '" + response + "'");
        }
        ok();
    }
}
