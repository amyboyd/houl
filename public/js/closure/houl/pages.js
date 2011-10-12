goog.provide('houl.pages');

goog.require('houl');
goog.require('houl.BuddyList');
goog.require('houl.BottomButtons');
goog.require('houl.User');
goog.require('goog.dom');
goog.require('goog.events');
goog.require('goog.events.EventType');
goog.require('goog.net.XhrIo');
goog.require('goog.string');
goog.require('goog.ui.AnimatedZippy');
goog.require('goog.net.XhrIo');

houl.pages.initAuthPage = function() {
    houl.globalBuddyList = new houl.BuddyList(houl.getAndActivatePageContainer('index-page'));
    houl.globalBuddyList.update();

    houl.BottomButtons.setup();

    goog.dom.removeNode(goog.dom.$('loading-page'));

    setCurrentUser();
    removeFlashMessage();
}

houl.pages.initUnauthPage = function() {
    removeFlashMessage();
}

/**
 * @private
 */
function setCurrentUser() {
    goog.net.XhrIo.send(houl.getURL('current-user'), function(evt) {
        var json = evt.target.getResponseJson();
        houl.User.currentUser = new houl.User(json);
        houl.setTopBarRightText('PIN: ' + houl.User.currentUser.pin);
    });
}

/**
 * Give user enough time to see the flash message, then remove it.
 * @private
 */
function removeFlashMessage() {
    setTimeout(function() {
        var flash = goog.dom.$('flash-message');
        if (flash) {
            if (goog.DEBUG) {
                console.log("Removing flash message");
            }
            new goog.ui.AnimatedZippy(flash, flash, true).collapse();
        }
    }, 5000);
}

goog.exportSymbol('houl.pages.initAuthPage', houl.pages.initAuthPage);
goog.exportSymbol('houl.pages.initUnauthPage', houl.pages.initUnauthPage);
