goog.provide('houl.pages');

goog.require('houl');
goog.require('houl.BuddyList');
goog.require('houl.BottomButtons');
goog.require('goog.dom');
goog.require('goog.events');
goog.require('goog.events.EventType');
goog.require('goog.net.XhrIo');
goog.require('goog.string');
goog.require('goog.ui.AnimatedZippy');

houl.pages.index = function() {
    houl.globalBuddyList = new houl.BuddyList(houl.getAndActivatePageContainer('index-page'));
    houl.globalBuddyList.update();

    houl.BottomButtons.setup();

    goog.dom.removeNode(goog.dom.$('loading-page'));

    // Give user enough time to see the flash message, then remove it.
    setTimeout(removeFlashMessage, 5000);
}

/** @private */
function removeFlashMessage() {
    var flash = goog.dom.$('flash-message');
    if (flash) {
        if (goog.DEBUG) {
            console.log("Removing flash message");
        }
        new goog.ui.AnimatedZippy(flash, flash, true).collapse();
    }
}

goog.exportSymbol('houl.pages.index', houl.pages.index);
