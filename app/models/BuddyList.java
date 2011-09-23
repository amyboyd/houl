package models;

import java.util.*;

public class BuddyList {
    private User user;

    private List<Buddy> buddies;

    public BuddyList(User user) {
        this.user = user;
        this.buddies = new ArrayList<Buddy>(10);

        // Exclude requests from this user, but include requests to this user.
        List<BuddyRelationship> brList = BuddyRelationship.find(
                "(user1 = ?1 AND acceptedAt is not null) OR user2 = ?1 " +
                "ORDER BY requestedAt DESC, lastChatAt DESC, acceptedAt DESC",
                user).fetch();
        for (BuddyRelationship br: brList) {
            this.buddies.add(new Buddy(user, br));
        }
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