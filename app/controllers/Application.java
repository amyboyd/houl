package controllers;

import java.util.Date;
import models.Buddy;
import models.BuddyList;
import models.User;

public class Application extends BaseController {
    public static void index() {
        if (!isAuth()) {
            UserAuth.login(null, null);
        }
        render();
    }

    public static void buddyListJson() {
        requireHttpMethod("GET");

        if (!isAuth()) {
            renderJSON("{\"error\":\"must login\"}");
        }

        final User user = requireAuthenticatedUser();
        final BuddyList buddyList = new BuddyList(user);
        renderJSON(buddyList.toJsonArray().toString());
    }

    public static void chatRoom(Long userId) {
        requireHttpMethod("GET");

        User currentUser = requireAuthenticatedUser();

        notFoundIfNull(userId);
        User otherUser = User.findById(userId);
        notFoundIfNull(otherUser);

//        Buddy buddy = new Buddy(currentUser, otherUser);
//        renderArgs.put("buddy", buddy);

//        MessageList messsageList = new MessageList(currentUser, otherUser);
//        renderArgs.put("messsageList", messsageList);

//        render();
    }

    /**
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
        Buddy relationship = Buddy.findByUsers(requester, currentUser);
        if (relationship == null) {
            error("The request does not exist");
        }
        else if (relationship.isAccepted()) {
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
