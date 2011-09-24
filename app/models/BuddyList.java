package models;

import com.google.gson.*;
import java.util.*;

public class BuddyList {
    private List<Buddy> buddies;

    public BuddyList(User currentUser) {
        // Exclude requests from this user, but include requests to this user.
        this.buddies = Buddy.find(
                "(user1 = ?1 AND acceptedAt is not null) OR user2 = ?1 "
                + "ORDER BY requestedAt DESC, lastChatAt DESC, acceptedAt DESC",
                currentUser).fetch();
    }

    public JsonArray toJsonArray() {
        JsonArray array = new JsonArray();
        for (Buddy request: getRequests()) {
            array.add(request.toJsonObject());
        }
        for (Buddy accepted: getAccepted()) {
            array.add(accepted.toJsonObject());
        }
        return array;
    }

    public int countAll() {
        return buddies.size();
    }

    public List<Buddy> getRequests() {
        List<Buddy> result = new ArrayList<Buddy>(10);
        for (Buddy buddy: buddies) {
            if (buddy.isRequest()) {
                result.add(buddy);
            }
        }
        return result;
    }

    public List<Buddy> getAccepted() {
        List<Buddy> result = new ArrayList<Buddy>(10);
        for (Buddy buddy: buddies) {
            if (buddy.isAccepted()) {
                result.add(buddy);
            }
        }
        return result;
    }
}