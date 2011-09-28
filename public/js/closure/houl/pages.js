goog.provide('houl.pages');

goog.require('houl');
goog.require('houl.globals');
goog.require('houl.BuddyList');
goog.require('houl.Options');
goog.require('goog.dom');
goog.require('goog.events');
goog.require('goog.events.EventType');
goog.require('goog.net.XhrIo');
goog.require('goog.string');

houl.pages.index = function() {
    houl.globals.buddyList = new houl.BuddyList(houl.getAndActivatePageContainer('index-page'));
    houl.globals.buddyList.update();
    goog.dom.removeNode(goog.dom.$('loading-page'));
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
                houl.globals.buddyList.update();
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

goog.exportSymbol('houl.pages.index', houl.pages.index);
