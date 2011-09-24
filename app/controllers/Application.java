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

        final User user = requireAuthenticatedUser();
        final BuddyList buddyList = new BuddyList(user);
//
        renderArgs.put("countBuddies", buddyList.countAll());
        renderArgs.put("countOnlineBuddies", 2); // @todo
//        renderArgs.put("requests", buddyList.getRequests());
//        renderArgs.put("buddies", buddyList.getAccepted());
        render();
    }
    
    public static void buddyListJson() {
        if (!isAuth()) {
            renderJSON("{\"error\":\"must login\"}");
        }

        final User user = requireAuthenticatedUser();
        final BuddyList buddyList = new BuddyList(user);
        renderJSON(buddyList.toJsonArray().toString());
    }

    public static void room(Long userId) {
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
    public static void acceptRequest(Long userId) {
//        User currentUser = requireAuthenticatedUser();
//
//        notFoundIfNull(userId);
//        User otherUser = User.findById(userId);
//        notFoundIfNull(otherUser);
//
        // @todo
    }
}
