package models;

import com.google.gson.*;
import java.util.*;
import play.libs.F.*;

public class ChatRoom {
    private ArchivedEventStream<ChatRoom.Event> events;

    private ChatRoom() {
        events = new ArchivedEventStream<ChatRoom.Event>(100);
    }

    private ChatRoom(Relationship relationship) {
        this();

        // Publish all old events to the event stream.
        if (relationship.eventsJson != null && !relationship.eventsJson.isEmpty()) {
            JsonArray array = new JsonParser().parse(relationship.eventsJson).getAsJsonArray();
            for (JsonElement event: array) {
                JsonObject obj = event.getAsJsonObject();
                final String type = obj.get("type").getAsString();
                if (type.equals("message")) {
                    publish(new Message(obj.get("userId").getAsLong(), obj.get("text").getAsString()));
                } else {
                    throw new IllegalArgumentException("Event type is: " + type);
                }
            }
        }
    }

    /**
     * For long polling, as we are sometimes disconnected, we need to pass 
     * the last event seen ID, to be sure to not miss any message.
     */
    Promise<List<IndexedEvent<ChatRoom.Event>>> nextMessages(long lastReceived) {
        return events.nextEvents(lastReceived);
    }

    void publish(Event event) {
        events.publish(event);
    }

    JsonArray toJsonArray() {
        JsonArray array = new JsonArray();
        for (Event event: events.archive()) {
            array.add(event.toJsonObject());
        }
        return array;
    }

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
        private final String text;

        public Message(long userId, String text) {
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

    static ChatRoom get(Relationship relationship) {
        if (!INSTANCES.containsKey(relationship.id)) {
            INSTANCES.put(relationship.id, new ChatRoom(relationship));
        }
        return INSTANCES.get(relationship.id);
    }
}
