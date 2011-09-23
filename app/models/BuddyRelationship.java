package models;

import java.util.*;
import javax.persistence.*;
import play.data.validation.MaxSize;
import play.db.jpa.Model;

@Entity
@Table(name = "buddy_relationship")
public class BuddyRelationship extends Model {
    /**
     * Requestor.
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

}
