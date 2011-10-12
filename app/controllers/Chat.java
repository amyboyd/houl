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
        renderJSON(getRelationshipWithOtherUser(userId).toJsonObject().toString());
    }

    public static void say(Long userId, String message) {
        requireHttpMethod("POST");
        getRelationshipWithOtherUser(userId).say(requireAuthenticatedUser(), message);
    }

    public static void waitForMessages(Long userId, long lastReceived) {
        // Suspend the execution until a new message has been received.
        List<IndexedEvent<Event>> messages = await(getRelationshipWithOtherUser(userId).nextMessages(lastReceived));
        renderJSON(ChatRoom.toJsonObject(messages).toString());
    }

    public static void getMessages(Long userId, long lastReceived) {
        List<IndexedEvent<Event>> messages = getRelationshipWithOtherUser(userId).getMessagesSinceLastReceived(lastReceived);
        renderJSON(ChatRoom.toJsonObject(messages).toString());
    }
}
