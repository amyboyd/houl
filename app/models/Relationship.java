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

    public boolean user1HasBeenHouledAtByUser2, user2HasBeenHouledAtByUser1;

    public Date requestedAt;

    @Lob
    public String requestMessage;

    public Date acceptedAt;

    public Date lastChatAt;

    @Lob
    public String lastChatMessage;

    @Lob
    public String eventsJson;

    public static Relationship findByUsers(User user1, User user2) {
        return find("(user1 = ?1 and user2 = ?2) or (user1 = ?2 and user2 = ?1)", user1, user2).first();
    }

    public Relationship(User requester, User otherUser) {
        this.user1 = requester;
        this.user2 = otherUser;
        this.requestedAt = new Date();
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

    public List<IndexedEvent<ChatRoom.Event>> getMessagesSinceLastReceived(long lastReceived) {
        return getChatRoom().getMessagesSinceLastReceived(lastReceived);
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
        obj.addProperty("user1HasBeenHouledAtByUser2", user1HasBeenHouledAtByUser2);
        obj.addProperty("user2HasBeenHouledAtByUser1", user2HasBeenHouledAtByUser1);
        obj.add("otherUser", getOtherUser().toJsonObject());

        JsonObject users = new JsonObject();
        users.add(user1.id.toString(), user1.toJsonObject());
        users.add(user2.id.toString(), user2.toJsonObject());
        obj.add("users", users);

        return obj;
    }

    public void houlAtUser(User userToBeHouledAt) {
        if (userToBeHouledAt.equals(user1)) {
            user1HasBeenHouledAtByUser2 = true;
        } else if (userToBeHouledAt.equals(user2)) {
            user2HasBeenHouledAtByUser1 = true;
        }
    }

    public void markHoulFromBuddyAsSeen(User buddy) {
        if (buddy.equals(user1)) {
            user2HasBeenHouledAtByUser1 = false;
        } else if (buddy.equals(user2)) {
            user1HasBeenHouledAtByUser2 = false;
        }
    }
}
