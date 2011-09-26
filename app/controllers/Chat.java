package controllers;

import java.util.*;
import models.ChatRoom.Event;
import models.*;
import play.mvc.*;
import play.mvc.Http.*;
import play.libs.F.*;
import static play.libs.F.Matcher.*;

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
            final User user = requireAuthenticatedUser();
            Application.getChatRoomByOtherUserId(userId).say(user, message);
        }

        public static void waitMessages(Long userId, Long lastReceived) {
            // Here we use continuation to suspend 
            // the execution until a new message has been received
            final List<IndexedEvent<Event>> messages = await(getChatRoomByOtherUserId(userId).
                    nextMessages(lastReceived.longValue()));
            renderJSON(Event.toJsonArray(messages));
        }
    }

    public static class WebSocket extends WebSocketController {
        public static void join(Long userId) {
            final User user = requireAuthenticatedUser();
            final ChatRoom chatRoom = getChatRoomByOtherUserId(userId);

            // Socket connected, join the chat room.
            final EventStream<ChatRoom.Event> roomStream = chatRoom.getEventStream();

            while (inbound.isOpen()) {
                // Wait for an event, either something coming on the inbound socket channel, or ChatRoom messages.
                Either<WebSocketEvent, ChatRoom.Event> e = await(
                        Promise.waitEither(inbound.nextEvent(), roomStream.nextEvent()));

                // Case: TextEvent received on the socket
                for (String userMessage: WebSocketEvent.TextFrame.match(e._1)) {
                    chatRoom.say(user, userMessage);
                }

                // Case: New message on the chat room
                for (ChatRoom.Message message: ClassOf(ChatRoom.Message.class).match(e._2)) {
                    outbound.sendJson(message.toJsonObject());
                }

                // Case: The socket has been closed
                // A Play bug is causing the compiler to break here.
                for (WebSocketClose close: WebSocketEvent.SocketClosed.match(e._1)) {
                    disconnect();
                }
            }
        }
    }
}
