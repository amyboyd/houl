package models;

import com.google.gson.*;
import java.util.*;
import javax.persistence.*;
import org.apache.commons.lang.StringUtils;
import play.data.validation.MaxSize;
import play.db.jpa.Model;
import play.libs.F.*;

@Entity
@Table(name = "chat_room")
public class ChatRoom extends Model {
    @Transient
    private final ArchivedEventStream<ChatRoom.Event> chatEvents = new ArchivedEventStream<ChatRoom.Event>(100);

    /**
     * The IDs of the users in this room, concatenated.
     */
    private String name;

    @Lob
    @MaxSize(500000)
    private JsonArray json;

    private ChatRoom(String name) {
        this.name = name;
        this.json = new JsonArray();
    }

    /**
     * A user says something in the room.
     */
    public void say(User user, String text) {
        if (text == null || text.trim().isEmpty()) {
            return;
        }
        publishEvent(new Message(user, text));
    }

    private void publishEvent(Event event) {
        chatEvents.publish(event);
        json.add(event.toJsonObject());
    }

    /**
     * For long polling, as we are sometimes disconnected, we need to pass 
     * the last event seen id, to be sure to not miss any message
     */
    public Promise<List<IndexedEvent<ChatRoom.Event>>> nextMessages(long lastReceived) {
        return chatEvents.nextEvents(lastReceived);
    }

    public EventStream<Event> getEventStream() {
        return chatEvents.eventStream();
    }
//
//    /**
//     * For active refresh, we need to retrieve the whole message archive at
//     * each refresh
//     */
//    public List<ChatRoom.Event> archive() {
//        return chatEvents.archive();
//    }

    ///////////// Chat room events //////////////////
    public static abstract class Event {
        public final String type;

        public final long timestamp;

        public final long user;

        protected Event(String type, User user) {
            this.type = type;
            this.timestamp = System.currentTimeMillis();
            this.user = user.id.longValue();
        }

        protected JsonObject toJsonObject() {
            JsonObject obj = new JsonObject();
            obj.addProperty("type", type);
            obj.addProperty("timestamp", timestamp);
            obj.addProperty("user", user);
            return obj;
        }
    }

    public static class Message extends Event {
        public final String text;

        private Message(User user, String text) {
            super("message", user);
            this.text = text;
        }

        @Override
        protected JsonObject toJsonObject() {
            JsonObject obj = super.toJsonObject();
            obj.addProperty("text", text);
            return obj;
        }
    }

    //////////////// Chat room factory ////////////////
    private static Map<String, ChatRoom> INSTANCES = new HashMap<String, ChatRoom>(10);

    public static ChatRoom get(User... users) {
        return get(Arrays.asList(users));
    }

    public static ChatRoom get(List<User> users) {
        Collections.sort(users, new AscendingIDcomparator<User>());
        String name = StringUtils.join(users.iterator(), '-');
        return get(name);
    }

    public static ChatRoom get(String roomName) {
        if (INSTANCES.containsKey(roomName)) {
            return INSTANCES.get(roomName);
        } else {
            ChatRoom instance = new ChatRoom(roomName);
            INSTANCES.put(roomName, instance);
            return instance;
        }
    }
}
