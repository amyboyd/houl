goog.provide("houl.Options");

goog.require("houl");
goog.require("houl.BuddyList");
goog.require("goog.dom");
goog.require("goog.events");
goog.require("goog.events.EventType");

/**
 * @constructor
 */
houl.Options = function() {
}

houl.Options.prototype.render = function() {
    houl.BuddyList.instance.setAutoUpdating(false);

    var container = houl.getAndActivatePageContainer('options-page');
    goog.dom.removeChildren(container);

    var template = goog.dom.createDom('div');
    template.innerHTML = houl.templates.options({
        user: houl.User.currentUser
    });
    goog.dom.appendChild(container, template);

    goog.events.listen(goog.dom.$('logout-option'), goog.events.EventType.CLICK, logout);

    houl.setTopBarText('Options');
}

/** @private */
function logout() {
    window.location = houl.getURL('logout');
}
