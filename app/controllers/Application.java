package controllers;

import java.util.Date;
import models.BuddyList;
import models.Relationship;
import models.User;
import models.UserAvatar;
import play.mvc.Http;

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

    public static void currentUser() {
        requireHttpMethod("GET");
        renderJSON(requireAuthenticatedUser().toJsonObject().toString());
    }

    public static void user(Long id) {
        requireHttpMethod("GET");
        renderJSON(User.<User>findById(id).toJsonObject().toString());
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
    }

    public static void addBuddy(String pinOrEmail) {
        requireHttpMethod("POST");
        play.Logger.info(pinOrEmail);

        User user = User.find("email = ?1 OR pin = ?1", pinOrEmail).first();
        if (user == null) {
            response.status = Http.StatusCode.FORBIDDEN; // 403
            renderText("Sorry, there is no user with that PIN/email");
        }

        Relationship relationship = Relationship.findByUsers(requireAuthenticatedUser(), user);
        if (relationship != null) {
            response.status = Http.StatusCode.FORBIDDEN; // 403
            renderText("You have already added or requested to add that user.");
        }

        relationship = new Relationship(requireAuthenticatedUser(), user);
        relationship.save();
    }

    public static void sendFeedback(String message) {
        Mails.userFeedback(message);
    }

    public static void changeName(String name) {
        requireHttpMethod("POST");

        final User user = requireAuthenticatedUser();
        user.name = name;
        user.save();
    }

    public static void postStatusUpdate(String status) {
        requireHttpMethod("POST");

        final User user = requireAuthenticatedUser();
        user.status = status;
        user.save();
    }

    public static void uploadUserAvatar(String filename) {
        requireHttpMethod("POST");

        User user = requireAuthenticatedUser();

        UserAvatar avatar = new UserAvatar();
        avatar.setInputStreamToCopy(filename, request.body);
        avatar.user = user;
        avatar.save();

        user.avatarURL = avatar.getURL(UserAvatar.Variant.SMALL);
        user.save();
    }

    public static void sendHoul(Long buddyId) {
        User buddy = User.findById(buddyId);
        notFoundIfNull(buddy);

        Relationship relationship = Relationship.findByUsers(buddy, requireAuthenticatedUser());
        relationship.houlAtUser(buddy);
        relationship.save();
    }
}
