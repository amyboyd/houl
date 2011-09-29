goog.provide("houl.EditProfile");

goog.require("houl");
goog.require("houl.templates");
goog.require("goog.dom");
goog.require("goog.events");
goog.require("goog.events.EventType");

/**
 * @constructor
 */
houl.EditProfile = function() {
}

houl.EditProfile.prototype.render = function() {
    houl.globalBuddyList.setAutoUpdating(false);

    var container = houl.getAndActivatePageContainer('edit-profile-page');
    goog.dom.removeChildren(container);

    var template = goog.dom.createDom('div');
    template.innerHTML = houl.templates.editProfile({
        user: houl.User.currentUser
    });
    goog.dom.appendChild(container, template);

    goog.events.listen(goog.dom.$('password-option'), goog.events.EventType.CLICK, changePassword);
    goog.events.listen(goog.dom.$('facebook-option'), goog.events.EventType.CLICK, linkFacebook);
    goog.events.listen(goog.dom.$('twitter-option'), goog.events.EventType.CLICK, linkTwitter);

    houl.setTopBarText('Profile');
}

/** @private */
function changePassword() {
}

/** @private */
function linkFacebook() {
}

/** @private */
function linkTwitter() {
}
