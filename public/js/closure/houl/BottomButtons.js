goog.provide("houl.BottomButtons");

goog.require("houl");
goog.require("houl.Options");
goog.require("goog.dom");
goog.require("goog.string");
goog.require("goog.events");
goog.require("goog.events.EventType");
goog.require("goog.net.XhrIo");

houl.BottomButtons.setup = function() {
    common('bottom-buttons-home', home);
    common('bottom-buttons-add-buddy', addBuddy);
    common('bottom-buttons-houl', sendHoul);
    common('bottom-buttons-options', options);

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
function home() {
    houl.getAndActivatePageContainer('index-page');
    houl.globalBuddyList.setAutoUpdating(true);
    houl.globalBuddyList.update();
}

/** @private */
function addBuddy() {
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
}

/** @private */
function sendHoul() {
    // @todo
    alert("send a houl");
}

/** @private */
function options() {
    new houl.Options().render();
}
