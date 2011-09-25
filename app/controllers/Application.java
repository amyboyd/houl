package controllers;

import models.Buddy;
import models.BuddyList;
//import models.MessageList;
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

    public static void requestHandler(Long requesterId) {
        requireHttpMethod("POST");

        User currentUser = requireAuthenticatedUser();

        notFoundIfNull(requesterId);
        User requester = User.findById(requesterId);
        notFoundIfNull(requester);

        // @todo
    }
}
