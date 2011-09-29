package models;

import chatapp.BCrypt;
import chatapp.Constants;
import com.google.gson.JsonObject;
import java.lang.annotation.*;
import java.util.*;
import java.util.regex.Pattern;
import javax.persistence.*;
import net.sf.oval.Validator;
import net.sf.oval.context.OValContext;
import net.sf.oval.configuration.annotation.AbstractAnnotationCheck;
import net.sf.oval.configuration.annotation.Constraint;
import org.apache.commons.lang.StringUtils;
import play.Logger;
import play.data.binding.NoBinding;
import play.data.validation.*;
import play.db.jpa.Model;
import play.libs.Codec;
import play.mvc.Http.Request;
import play.templates.JavaExtensions;

@Entity
@Table(name = "user")
public class User extends Model {
    @Required
    @MaxSize(21)
    @MinSize(2)
    @Column(unique = true)
    @UserName
    public String name;

    /**
     * Latest status update.
     */
    public String status;

    @Required
    @Email
    @MaxSize(255)
    @Column(unique = true)
    public String email;

    public boolean emailConfirmed;

    @Column(name = "is_admin") // "admin" is a reserved keyword.
    public boolean admin;

    public int loginCount;

    public int loginFailures;

    @Temporal(TemporalType.TIMESTAMP)
    public Date lastLogin;

    @Temporal(TemporalType.TIMESTAMP)
    public Date registeredAt;

    @Temporal(TemporalType.TIMESTAMP)
    public Date lastOnline;

    public String pin;

    public static final String NO_USER_IMAGE_URL = play.mvc.Router.reverse(play.Play.getVirtualFile("public/images/no-user-image-48.png"), true);

    /**
     * Bcrypt'ed password. 60 characters long.
     */
    @Required
    @NoBinding
    public String password;

    public User(final String email, final String password) {
        this.email = email;
        // Try to parse name from email, e.g. "mic.t.boyd@gmail.com" becomes "Mic T Boyd".
        this.name = JavaExtensions.capitalizeWords(email.substring(0, email.indexOf('@')).replaceAll("[.-_]", " ").
                toLowerCase());
        Logger.info("Parsed email %s to name %s", this.email, this.name);
        this.password = password;
    }

    public User(final String email, final String password, final String name) {
        this(email, password);
        this.name = name;
    }

    public static User findByEmail(final String email) {
        return find("email", email).first();
    }

    /**
     * Find a user by email and password. The password is checked to be valid.
     *
     * @param email
     * @return Null if no user with the email and password.
     */
    public static User findByEmailAndPassword(final String email, final String password) {
        final User user = User.find("email", email).first();
        if ((user != null) && user.checkPassword(password)) {
            return user;
        }
        return null;
    }

    public JsonObject toJsonObject() {
        JsonObject obj = new JsonObject();
        obj.addProperty("id", id);
        obj.addProperty("name", name);
        obj.addProperty("imageURL", getImageUrl());
        obj.addProperty("status", status);
        obj.addProperty("pin", pin);

        User currentUser = (Request.current().args.containsKey("currentUser")
                ? (User) Request.current().args.get("currentUser")
                : null);
        obj.addProperty("isCurrentUser", Boolean.valueOf(this.equals(currentUser)));

        return obj;
    }

    /**
     * Hash the password with BCrypt alogrithm.
     */
    public void setPassword(final String newPassword) {
        if (newPassword.equals(password) || newPassword.isEmpty()) {
            return;
        }
        password = BCrypt.hashpw(newPassword, BCrypt.gensalt());
    }

    /**
     * Check if a given password is equal to the one in the database.
     * If the password is incorrect, {@link #loginFailures} is incremented and the user saved.
     *
     * @return True if correct.
     */
    public boolean checkPassword(final String candidate) {
        // On DEV, the password "pass" works for all users.
        if (candidate.equalsIgnoreCase("password") && Constants.IS_DEV) {
            return true;
        }

        // Check that the unencrypted password "candidate" matches one that has previously been hashed.
        final boolean correct = BCrypt.checkpw(candidate, password);
        if (!correct) {
            Logger.info("User %s (id %d) failed password check");
            loginFailures += 1;
            save();
        }
        return correct;
    }

    @Override
    public String toString() {
        return name;
    }

    public String getImageUrl() {
        return User.NO_USER_IMAGE_URL;
    }

    @PrePersist
    protected void prePersist() {
        if (registeredAt == null) {
            registeredAt = new Date();
        }
        if (pin == null) {
            generatePIN();
        }
    }

    private void generatePIN() {
        pin = UUID.randomUUID().toString().substring(0, 4).toUpperCase();
        long userAlreadyUsingPin = User.count("pin", pin);
        if (userAlreadyUsingPin > 0) {
            generatePIN();
        }
    }

    public void onLogin() {
        lastLogin = new Date();
        loginCount += 1;
        save();

        play.Logger.info("User %s (id %d) has logged in", toString(), getId());
    }

    @PostPersist
    protected void postPersist() {
        if (email != null) {
            controllers.Mails.welcome(this);
        }
    }

    /**
     * Returns a code that can be used in cases of validation, e.g. in emailed links.
     * @return String with 12 alpha-numeric characters.
     */
    public String getValidationCode() {
        return StringUtils.reverse(Codec.hexSHA1(id.toString()).
                substring(0, 12)).
                toUpperCase().
                intern();
    }

    /**
     * UserName validator.
     */
    public static class UserNameCheck extends AbstractAnnotationCheck<UserName> {
        private final static Pattern pattern = Pattern.compile("^[a-zA-Z0-9 -_']+$");

        private final static String message = "This name is invalid or is reserved (not allowed to be used)";

        private final static Set<String> reserved = new TreeSet<String>();

        static {
            // One per line so SVN can do better diffs. Alphabetical so easier to scan.
            reserved.addAll(java.util.Arrays.asList(
                    "_",
                    "about",
                    "admin",
                    "api",
                    "app"));
        }

        /**
         * Check that the value is:
         * 1. not null
         * 2. matches the required pattern
         * 3. is not reserved for URLs
         *
         * @param userO The User object.
         * @param name The new name.
         * @param context Basically a pointer to {@link #name}.
         * @param validator Global validator.
         * @return If the name is valid.
         */
        @Override
        public boolean isSatisfied(final Object userO, final Object name, final OValContext context,
                final Validator validator) {
            boolean isSatisfied = (name != null)
                    && pattern.matcher(name.toString()).matches()
                    && !reserved.contains((String) name);
            if (!isSatisfied) {
                Logger.error("Name %failed validation: %s", name);
            }
            return isSatisfied;
        }

        @Override
        public void configure(final UserName name) {
            setMessage(name.message());
        }
    }

    /**
     * Mark a field to be validated by UserNameCheck.
     */
    @Retention(RetentionPolicy.RUNTIME)
    @Target({
        ElementType.FIELD, ElementType.PARAMETER
    })
    @Constraint(checkWith = UserNameCheck.class)
    public @interface UserName {
        String message() default UserNameCheck.message;
    }
}
