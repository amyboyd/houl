package models;

import com.alienmegacorp.fileuploads.AbstractUploadedImage;
import javax.persistence.*;

@Entity
@Table(name = "user_avatar")
public class UserAvatar extends AbstractUploadedImage {
    @ManyToOne
    public User user;

    @Override
    protected String getFolder() {
        return "user-avatar";
    }

    @Override
    protected Variant[] getVariants() {
        return Variant.values();
    }

    @Override
    protected Variant getVariantFull() {
        return Variant.FULL;
    }

    public enum Variant implements AbstractUploadedImage.Variant {
        FULL(-1, -1),
        SMALL(48, 48);

        private final int width, height;

        private Variant(int width, int height) {
            this.width = width;
            this.height = height;
        }

        public int getMaxWidth() {
            return width;
        }

        public int getMaxHeight() {
            return height;
        }
    }
}
