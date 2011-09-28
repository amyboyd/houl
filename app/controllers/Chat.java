package controllers;

import java.util.*;
import models.ChatRoom.Event;
import models.*;
import play.mvc.Http.*;
import play.libs.F.*;

public class Chat extends BaseController {
    /**
     * Get a JSON array of all {@link ChatRoom.Event}s in a {@link ChatRoom}, and meta data.
     */
    public static void roomJson(Long userId) {
        requireHttpMethod("GET");
        ChatRoom chatRoom = getChatRoomByOtherUserId(userId);
        renderJSON(chatRoom.toJsonObject().toString());
    }

    public static class LongPolling extends BaseController {
        public static void say(Long userId, String message) {
            requireHttpMethod("POST");
            final User user = requireAuthenticatedUser();
            Application.getChatRoomByOtherUserId(userId).say(user, message);
        }

        public static void waitMessages(Long userId, Long lastReceived) {
            // Here we use continuation to suspend 
            // the execution until a new message has been received
            final List<IndexedEvent<Event>> messages = await(getChatRoomByOtherUserId(userId).
                    nextMessages(lastReceived.longValue()));
            renderJSON(ChatRoom.toJsonObject(messages).toString());
        }
    }
}
