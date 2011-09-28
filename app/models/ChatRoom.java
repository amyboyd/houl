package models;

import com.google.gson.*;
import java.util.*;
import javax.persistence.*;
import play.data.validation.MaxSize;
import play.db.jpa.GenericModel;
import play.libs.F.*;

@Entity
@Table(name = "chat_room")
public class ChatRoom extends GenericModel {
    @Id
    @GeneratedValue
    @OneToOne
    public Relationship relationship;

    @Lob
    @MaxSize(500000)
    public JsonArray events;

    @Transient
    private final ArchivedEventStream<ChatRoom.Event> chatEvents = new ArchivedEventStream<ChatRoom.Event>(100);

    private ChatRoom(Relationship relationship) {
        this.events = new JsonArray();
        this.relationship = relationship;
    }

    public JsonObject toJsonObject() {
        JsonObject obj = new JsonObject();
        obj.add("relationship", relationship.toJsonObject());

        JsonObject users = new JsonObject();
        for (User user: getUsers()) {
            users.add(user.id.toString(), user.toJsonObject());
        }
        obj.add("users", users);

        return obj;
    }

    public List<User> getUsers() {
        List<User> users = new ArrayList<User>(2);
        users.add(relationship.user1);
        users.add(relationship.user2);
        return users;
    }

    /**
     * A user says something in the room.
     */
    public void say(User user, String text) {
        if (text == null || text.trim().isEmpty()) {
            return;
        }
        publishEvent(new Message(user.id.longValue(), text));
    }

    private void publishEvent(Event event) {
        chatEvents.publish(event);
        events.add(event.toJsonObject());
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

    public static JsonObject toJsonObject(List<IndexedEvent<Event>> events) {
        JsonArray array = new JsonArray();
        Long lastId = null;
        for (IndexedEvent<Event> event: events) {
            array.add(event.data.toJsonObject());
            lastId = event.id;
        }

        JsonObject obj = new JsonObject();
        obj.addProperty("lastId", lastId);
        obj.add("messages", array);

        return obj;
    }

    ///////////// Chat room events //////////////////
    public static abstract class Event {
        public final String type;

        public final long timestamp;

        public final long userId;

        protected static Event reverseFromJson(JsonObject obj) {
            final String type = obj.get("type").getAsString();
            if (type.equals("message")) {
                return new Message(obj.get("userId").getAsLong(), obj.get("text").getAsString());
            } else {
                throw new IllegalArgumentException("Event type is: " + type);
            }
        }

        protected Event(String type, long userId) {
            this.type = type;
            this.timestamp = System.currentTimeMillis();
            this.userId = userId;
        }

        public JsonObject toJsonObject() {
            JsonObject obj = new JsonObject();
            obj.addProperty("type", type);
            obj.addProperty("timestamp", timestamp);
            obj.addProperty("userId", userId);
            return obj;
        }
    }

    public static class Message extends Event {
        public final String text;

        private Message(long userId, String text) {
            super("message", userId);
            this.text = text;
        }

        @Override
        public JsonObject toJsonObject() {
            JsonObject obj = super.toJsonObject();
            obj.addProperty("text", text);
            return obj;
        }
    }

    //////////////// Chat room factory ////////////////
    /**
     * The Map key is a {@link Relationship#id} and the value is the related {@link ChatRoom}.
     */
    private static Map<Long, ChatRoom> INSTANCES = new HashMap<Long, ChatRoom>(10);

    public static ChatRoom get(User user1, User user2) {
        Relationship relationship = Relationship.findByUsers(user1, user2);
        if (relationship == null) {
            throw new IllegalArgumentException();
        }

        if (INSTANCES.containsKey(relationship.id)) {
            return INSTANCES.get(relationship.id);
        } else {
            ChatRoom instance = ChatRoom.find("relationship", relationship).first();
            // Publish all existing events to its event stream.
            if (instance != null) {
                for (JsonElement eventJson: instance.events) {
                    Event event = Event.reverseFromJson(eventJson.getAsJsonObject());
                    instance.publishEvent(event);
                }
            } else {
                instance = new ChatRoom(relationship);
            }
            INSTANCES.put(relationship.id, instance);
            return instance;
        }
    }
}
