goog.provide('houl.pages');

goog.require('houl');
goog.require('houl.BuddyList');
goog.require('houl.Options');
goog.require('goog.dom');
goog.require('goog.events');
goog.require('goog.events.EventType');
goog.require('goog.net.XhrIo');
goog.require('goog.string');
goog.require('goog.ui.AnimatedZippy');

houl.pages.index = function() {
    houl.globalBuddyList = new houl.BuddyList(houl.getAndActivatePageContainer('index-page'));
    houl.globalBuddyList.update();

    goog.dom.removeNode(goog.dom.$('loading-page'));

    // Give user enough time to see the flash message, then remove it.
    setTimeout(removeFlashMessage, 5000);

    setupBottomButtons();
}

/** @private */
function setupBottomButtons() {
    common('bottom-buttons-add-buddy', function() {
        var pinOrEmail = window.prompt("What is the other user's PIN or email address?", null);
        if (goog.string.isEmptySafe(pinOrEmail)) {
            return;
        }

        var url = houl.getURL('add-buddy', {
            'pinOrEmail': pinOrEmail
        });
        goog.net.XhrIo.send(url, function(evt) {
            /** @type {goog.net.XhrIo} */
            var xhr = evt.target;

            if (xhr.getStatus() == 200) {
                // Added the buddy successfully.
                alert('Your request has been sent');
                houl.globalBuddyList.update();
            } else if (xhr.getStatus() === 403) {
                alert(xhr.getResponseText());
            } else {
                throw "Unexpected status: " + xhr.getStatus();
            }
        }, "POST");
    });

    common('bottom-buttons-options', function() {
        new houl.Options().render();
    });

    function common(htmlId, callback) {
        goog.events.listen(goog.dom.$(htmlId), goog.events.EventType.CLICK,
            /** @param {goog.events.BrowserEvent} */
            function(evt) {
                evt.preventDefault();
                callback();
            });
    }
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
