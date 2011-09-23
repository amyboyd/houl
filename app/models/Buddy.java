package models;

import java.util.Date;

public class Buddy {
    private User user;

    private User buddy;

    private BuddyRelationship relationship;

    /**
     * If the users have chatted in the last 30 minutes.
     */
    private boolean isOpenChat;

    public Buddy(User user, BuddyRelationship relationship) {
        this.user = user;
        this.relationship = relationship;
        this.buddy = (user.equals(relationship.user1) ? relationship.user2 : relationship.user1);

        Date oneHourAgo = org.apache.commons.lang.time.DateUtils.addMinutes(new Date(), -30);
        this.isOpenChat = (relationship.lastChatAt != null
                && relationship.lastChatAt.after(oneHourAgo));
    }

    public User getBuddy() {
        return buddy;
    }

    public boolean isAccepted() {
        return relationship.acceptedAt != null;
    }

    public boolean isRequest() {
        return relationship.acceptedAt == null;
    }

    public boolean isOpenChat() {
        return isOpenChat;
    }
}
