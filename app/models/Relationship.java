package models;

import play.libs.F.IndexedEvent;
import play.libs.F.Promise;
import models.ChatRoom.Message;
import com.google.gson.*;
import java.util.*;
import javax.persistence.*;
import play.data.validation.MaxSize;
import play.db.jpa.Model;
import play.exceptions.UnexpectedException;
import play.mvc.Http.Request;
import static play.templates.JavaExtensions.since;

@Entity
@Table(name = "relationship")
public class Relationship extends Model {
    /**
     * Requester.
     */
    @ManyToOne
    public User user1;

    /**
     * Acceptor.
     */
    @ManyToOne
    public User user2;

    public Date requestedAt;

    @MaxSize(255)
    public String requestMessage;

    public Date acceptedAt;

    public Date lastChatAt;

    public String lastChatMessage;

    @Lob
    public String eventsJson;

    public static Relationship findByUsers(User user1, User user2) {
        return find("(user1 = ?1 and user2 = ?2) or (user1 = ?2 and user2 = ?1)", user1, user2).first();
    }

    public User getOtherUser() {
        User currentUser = (User) Request.current().args.get("currentUser");
        if (currentUser == null) {
            throw new UnexpectedException("User is null");
        } else if (currentUser.equals(user1)) {
            return user2;
        } else if (currentUser.equals(user2)) {
            return user1;
        } else {
            throw new UnexpectedException("User not in this relationship");
        }
    }

    public boolean isAccepted() {
        return acceptedAt != null;
    }

    public boolean isRequest() {
        return acceptedAt == null;
    }

    public boolean isOpenChat() {
        Date oneHourAgo = org.apache.commons.lang.time.DateUtils.addMinutes(new Date(), -30);
        return (lastChatAt != null && lastChatAt.after(oneHourAgo));
    }

    public void say(User user, String text) {
        if (text == null || text.trim().isEmpty()) {
            return;
        }

        ChatRoom room = getChatRoom();

        room.publish(new Message(user.id, text));
        eventsJson = room.toJsonArray().toString();
        lastChatAt = new Date();
        lastChatMessage = text;
        save();
    }

    /**
     * For long polling, as we are sometimes disconnected, we need to pass
     * the last event seen ID, to be sure to not miss any message.
     */
    public Promise<List<IndexedEvent<ChatRoom.Event>>> nextMessages(long lastReceived) {
        return getChatRoom().nextMessages(lastReceived);
    }

    public ChatRoom getChatRoom() {
        return ChatRoom.get(this);
    }

    public JsonObject toJsonObject() {
        JsonObject obj = new JsonObject();

        obj.addProperty("type", isRequest() ? "incoming request" : isOpenChat() ? "open chat" : "other");
        obj.addProperty("lastChatAt", lastChatAt != null ? since(lastChatAt) : null);
        obj.addProperty("lastChatMessage", lastChatMessage);
        obj.addProperty("requestedAt", requestedAt != null ? since(requestedAt) : null);
        obj.addProperty("requestMessage", requestMessage);
        obj.addProperty("acceptedAt", acceptedAt != null ? since(acceptedAt) : null);
        obj.add("otherUser", getOtherUser().toJsonObject());

        JsonObject users = new JsonObject();
        users.add(user1.id.toString(), user1.toJsonObject());
        users.add(user2.id.toString(), user2.toJsonObject());
        obj.add("users", users);

        return obj;
    }
}
