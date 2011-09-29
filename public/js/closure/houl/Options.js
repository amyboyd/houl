goog.provide("houl.Options");

goog.require("houl");
goog.require("houl.globals");
goog.require("goog.dom");
goog.require("goog.events");
goog.require("goog.events.EventType");

/**
 * @constructor
 */
houl.Options = function() {
}

houl.Options.prototype.render = function() {
    houl.globals.buddyList.setAutoUpdating(false);

    var container = houl.getAndActivatePageContainer('options-page');
    houl.setTopBarText('Options');

    var template = goog.dom.createDom('div');
    template.innerHTML = houl.templates.options({
        user: houl.User.currentUser
    });
    goog.dom.appendChild(container, template);
    
    goog.events.listen(goog.dom.$('logout-option'), goog.events.EventType.CLICK,
        function() {
            window.location = houl.getURL('logout');
        });
}
