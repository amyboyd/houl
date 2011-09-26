package models;

import com.google.gson.*;
import java.util.*;

public class BuddyList {
    private List<Relationship> relationships;

    public BuddyList(User currentUser) {
        // Exclude requests from this user, but include requests to this user.
        this.relationships = Relationship.find(
                "(user1 = ?1 AND acceptedAt is not null) OR user2 = ?1 "
                + "ORDER BY requestedAt DESC, lastChatAt DESC, acceptedAt DESC",
                currentUser).fetch();
    }

    public JsonArray toJsonArray() {
        JsonArray array = new JsonArray();
        for (Relationship request: getRequests()) {
            array.add(request.toJsonObject());
        }
        for (Relationship accepted: getAccepted()) {
            array.add(accepted.toJsonObject());
        }
        return array;
    }

    public int countAll() {
        return relationships.size();
    }

    public List<Relationship> getRequests() {
        List<Relationship> result = new ArrayList<Relationship>(10);
        for (Relationship relationship: relationships) {
            if (relationship.isRequest()) {
                result.add(relationship);
            }
        }
        return result;
    }

    public List<Relationship> getAccepted() {
        List<Relationship> result = new ArrayList<Relationship>(10);
        for (Relationship relationship: relationships) {
            if (relationship.isAccepted()) {
                result.add(relationship);
            }
        }
        return result;
    }
}