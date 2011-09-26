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
        obj.add("messages", events);
        obj.addProperty("messagesCount", events.size());
        obj.add("relationship", relationship.toJsonObject());

        for (User user: getUsers()) {
            obj.add("user" + user.id, user.toJsonObject());
        }

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
        publishEvent(new Message(user, text));
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

    ///////////// Chat room events //////////////////
    public static abstract class Event {
        public final String type;

        public final long timestamp;

        public final long userId;

        protected Event(String type, User user) {
            this.type = type;
            this.timestamp = System.currentTimeMillis();
            this.userId = user.id.longValue();
        }

        public JsonObject toJsonObject() {
            JsonObject obj = new JsonObject();
            obj.addProperty("type", type);
            obj.addProperty("timestamp", timestamp);
            obj.addProperty("userId", userId);
            return obj;
        }

        public static JsonArray toJsonArray(List<IndexedEvent<Event>> events) {
            JsonArray array = new JsonArray();
            for (IndexedEvent<Event> event: events) {
                array.add(event.data.toJsonObject());
            }
            return array;
        }
    }

    public static class Message extends Event {
        public final String text;

        private Message(User user, String text) {
            super("message", user);
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
            if (instance == null) {
                instance = new ChatRoom(relationship);
            }
            INSTANCES.put(relationship.id, instance);
            return instance;
        }
    }
}
