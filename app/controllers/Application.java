package controllers;

import java.util.List;
import models.Buddy;
import models.BuddyList;
import models.User;
import play.data.validation.*;

public class Application extends BaseController {
    public static void index() {
        if (!isAuth()) {
            UserAuth.login(null, null);
        }

        final User user = requireAuthenticatedUser();
        final BuddyList buddyList = new BuddyList(user);

        renderArgs.put("countBuddies", buddyList.countAll());
        renderArgs.put("countOnlineBuddies", 2); // @todo
        renderArgs.put("requests", buddyList.getRequests());
        renderArgs.put("buddies", buddyList.getAccepted());

        render();
    }

    public static void enterDemo(@Required String user, @Required String demo) {
        if (Validation.hasErrors()) {
            flash.error("Please choose a nick name and the demonstration type…");
            index();
        }

        // Dispatch to the demonstration        
        if (demo.equals("refresh")) {
            Refresh.index(user);
        }
        if (demo.equals("longpolling")) {
            LongPolling.room(user);
        }
        if (demo.equals("websocket")) {
            WebSocket.room(user);
        }
    }
}
