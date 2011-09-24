package controllers;

import com.google.gson.reflect.*;
import java.util.*;
import models.*;
import play.libs.F.*;

public class LongPolling extends BaseController {
    public static void room(String roomName) {
        final User user = requireAuthenticatedUser();
        ChatRoom.get(roomName);
        render();
    }

    public static void say(String roomName, String message) {
        final User user = requireAuthenticatedUser();
        ChatRoom.get(roomName).say(user, message);
    }

    public static void waitMessages(String roomName, Long lastReceived) {
        final User user = requireAuthenticatedUser();
        // Here we use continuation to suspend 
        // the execution until a new message has been received
        List messages = await(ChatRoom.get(roomName).nextMessages(lastReceived.longValue()));
        renderJSON(messages, new TypeToken<List<IndexedEvent<ChatRoom.Event>>>() {
        }.getType());
    }
}
