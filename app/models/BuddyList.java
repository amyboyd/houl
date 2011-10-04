package models;

import com.google.gson.*;
import java.util.*;

public class BuddyList {
    private final List<Relationship> relationships;

    private final User currentUser;

    public BuddyList(User currentUser) {
        this.currentUser = currentUser;

        // Exclude requests from this user, but include requests to this user.
        this.relationships = Relationship.find(
                "(user1 = ?1 AND acceptedAt is not null) OR user2 = ?1 "
                + "ORDER BY FIELD(lastChatAt, null) DESC,"
                + "requestedAt DESC,"
                + "lastChatAt DESC,"
                + "acceptedAt DESC",
                currentUser).fetch();
    }

    public JsonObject toJsonObject() {
        JsonObject obj = new JsonObject();

        JsonArray requestsAndAcceptedBuddies = new JsonArray();
        for (Relationship request: getRequests()) {
            requestsAndAcceptedBuddies.add(request.toJsonObject());
        }
        for (Relationship accepted: getAccepted()) {
            requestsAndAcceptedBuddies.add(accepted.toJsonObject());
        }
        obj.add("relationships", requestsAndAcceptedBuddies);

        JsonArray incomingHouls = new JsonArray();
        for (User user: getIncomingHouls()) {
            incomingHouls.add(user.toJsonObject());
        }
        obj.add("incomingHouls", incomingHouls);

        return obj;
    }

    public int countAll() {
        return relationships.size();
    }

    public List<User> getIncomingHouls() {
        List<User> result = new ArrayList<User>(10);
        for (Relationship rel: relationships) {
            if ((rel.user1.equals(currentUser) && rel.user1HasBeenHouledAtByUser2)
                    || (rel.user2.equals(currentUser) && rel.user2HasBeenHouledAtByUser1)) {
                result.add(rel.getOtherUser());
            }
        }
        return result;
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