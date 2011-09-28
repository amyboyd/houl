goog.provide("houl.Options");

goog.require("houl");
goog.require("houl.globals");
goog.require("goog.dom");

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
    template.innerHTML = houl.templates.options();
    goog.dom.appendChild(container, template);
}
