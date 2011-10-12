goog.provide("houl.BottomButtons");

goog.require("houl");
goog.require("houl.templates");
goog.require("houl.Options");
goog.require("houl.User");
goog.require("houl.ChatRoom");
goog.require("goog.dom");
goog.require("goog.events");
goog.require("goog.events.EventType");
goog.require("goog.net.XhrIo");
goog.require("goog.string");
goog.require("goog.soy");

houl.BottomButtons.setup = function() {
    common('bottom-buttons-friends', friends);
    common('bottom-buttons-add-friend', addFriend);
    common('bottom-buttons-chat', chat);
//    common('bottom-buttons-houl', sendHoul);
    common('bottom-buttons-profile', editProfile);
    common('bottom-buttons-more', more);

    function common(htmlId, callback) {
        var el = goog.dom.$(htmlId);
        if (el == null) {
            throw 'Element doesn\'t exist: ' + htmlId;
        }

        goog.events.listen(el, goog.events.EventType.CLICK,
            /** @param {goog.events.BrowserEvent} */
            function(evt) {
                evt.preventDefault();
                callback();
            });
    }
}

/** @private */
function friends() {
    houl.getAndActivatePageContainer('index-page');
    houl.globalBuddyList.setAutoUpdating(true);
    houl.globalBuddyList.update();
}

/** @private */
function addFriend() {
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
            // Added the friend successfully.
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
    houl.globalBuddyList.setAutoUpdating(false);

    var container = houl.getAndActivatePageContainer('send-houl-page');
    goog.dom.removeChildren(container);

    container.appendChild(goog.soy.renderAsElement(houl.templates.sendHoul, {
        buddyList: houl.globalBuddyList
    }));

    var buttons = goog.dom.$$('button', null, container);
    for (var i = 0; i < buttons.length; i++) {
        setupSendHoulButton(buttons[i]);
    }
}

/**
 * @private
 * @param {HTMLButtonElement} button
 */
function setupSendHoulButton(button) {
    goog.events.listen(button, goog.events.EventType.CLICK,
        function(evt) {
            var success = goog.dom.createDom('span');
            goog.dom.setTextContent(success, 'Houl sent');
            goog.dom.insertSiblingAfter(success, evt.target);
            goog.dom.removeNode(evt.target);

            var url = houl.getURL('send-houl', {
                'buddyId': evt.target.getAttribute('data-buddy-id')
            });
            goog.net.XhrIo.send(url);
        });
}

/** @private */
function chat() {
    if (houl.ChatRoom.lastOpenUserID != null) {
        houl.User.getByID(houl.ChatRoom.lastOpenUserID, function(user) {
            var chatRoom = new houl.ChatRoom(user);
            chatRoom.render();
        });
    } else {
        alert('Please start a chat with a friend on your friends list');
    }
}

/** @private */
function editProfile() {
    new houl.EditProfile().render();
}

/** @private */
function more() {
    new houl.Options().render();
}
