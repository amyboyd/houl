package chatapp;

import java.io.File;
import models.User;
import play.Logger;
import play.Play;
import play.jobs.Job;
import play.jobs.OnApplicationStart;
import play.test.Fixtures;

/**
 * Start the application.
 * In dev mode, fixtures need about 150 MB of heap space (start with -Xmx150m)
 */
@OnApplicationStart
public class Bootstrap extends Job {
    /**
     * If the bootstrap job is currently running (started but not finished).
     */
    public static boolean isRunning = true;

    @Override
    public void doJob() {
        if (!Play.id.equals("dev") && !Play.id.equals("prod")) {
            Logger.info("Play ID must be dev/prod. Got " + Play.id);
            Play.stop();
        } else {
            Logger.info("Bootstrap started. Play ID is '%s'.", Play.id);
        }

        isRunning = true;

        if (Play.mode.isDev() && User.count() == 0L) {
            Fixtures.deleteAllModels();
            Fixtures.loadModels("fixtures.yml");
            Logger.info("Fixtures loaded");
        }

        // Delete old bundle files. In development, files can be deleted manually if they need
        // to be re-compile.
        File bundlesDir = Play.getFile("public/bundles");
        if (!bundlesDir.exists()) {
            bundlesDir.mkdirs();
        }
        File compiledSoyTemplatesDir = Play.getFile("public/js/templates/compiled");
        if (!compiledSoyTemplatesDir.exists()) {
            compiledSoyTemplatesDir.mkdirs();
        }

        Logger.info("Finished bootstrap");
        isRunning = false;
    }
}
