package controllers;

import play.mvc.*;
import play.libs.F.*;
import play.mvc.Http.*;
import models.*;
import static play.libs.F.Matcher.*;

public class WebSocket extends BaseController {
    public static void room(String user) {
        render(user);
    }

    public static class ChatRoomSocket extends WebSocketController {
        public static void join(String name) {
            final User user = requireAuthenticatedUser();
            final ChatRoom room = ChatRoom.get(name);

            // Socket connected, join the chat room.
            EventStream<ChatRoom.Event> roomStream = room.getEventStream();

            while (inbound.isOpen()) {
                // Wait for an event, either something coming on the inbound socket channel, or ChatRoom messages.
                Either<WebSocketEvent, ChatRoom.Event> e = await(
                        Promise.waitEither(inbound.nextEvent(), roomStream.nextEvent()));

                // Case: TextEvent received on the socket
                for (String userMessage: WebSocketEvent.TextFrame.match(e._1)) {
                    room.say(user, userMessage);
                }
                // Case: New message on the chat room
                for (ChatRoom.Message message: ClassOf(ChatRoom.Message.class).match(e._2)) {
                    outbound.send("message:%s:%s", message.user, message.text);
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
