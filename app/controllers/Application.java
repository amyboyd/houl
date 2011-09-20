package controllers;

import models.ChatRoom;
import play.mvc.*;
import play.data.validation.*;

public class Application extends Controller {

    public static void index() {
        render();
    }

    public static void afterLogout() {
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

    /**
     * Just for showing that cross-domain AJAX works in apps/extensions. Not used on the website.
     */
    public static void numberOfEvents() {
        renderText(ChatRoom.get().archive().size());
    }
}
