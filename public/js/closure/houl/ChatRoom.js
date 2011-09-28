goog.provide('houl.ChatRoom');

goog.require('houl');
goog.require('houl.globals');
goog.require('houl.templates');
goog.require('houl.User');
goog.require('houl.ChatMessageSeries');
goog.require('goog.async.ConditionalDelay');
goog.require('goog.dom');
goog.require('goog.dom.forms');
goog.require('goog.events');
goog.require('goog.events.EventType');
goog.require('goog.events.KeyCodes');
goog.require('goog.net.XhrIo');

/**
 * JSON comes from "models.ChatRoom.toJsonObject()" in Java.
 *
 * @constructor
 * @param {houl.User} otherUser
 */
houl.ChatRoom = function(otherUser) {
    this.otherUser = otherUser;
    this.element = houl.getAndActivatePageContainer('chat-room-page');
    this.chatMessageSeriesArray = [];
    this.receivedJson = false;
    this.lastReceivedId = 0;

    var url = houl.getURL('room-json', {
        'userId': otherUser.id
    });
    var thisChatRoom = this;
    goog.net.XhrIo.send(url, function(event) {
        thisChatRoom.parseJson(event.target.getResponseJson());
    });
}

/**
 * Parse the room's JSON.
 * JSON comes from "models.ChatRoom.toJsonObject()" in Java.
 */
houl.ChatRoom.prototype.parseJson = function(json) {
    this.users = json['users'];
    for (var id in json['users']) {
        this.users[id] = new houl.User(json['users'][id]);
    }
    this.receivedJson = true;
}

houl.ChatRoom.prototype.render = function() {
    var thisChatRoom = this;

    function onReady() {
        // Clear old chat room messages.
        goog.dom.removeChildren(thisChatRoom.element);

        var template = goog.dom.createElement('div');
        template.innerHTML = houl.templates.chatRoom({
            chatMessageSeriesArray: []
        });
        goog.dom.appendChild(thisChatRoom.element, template);

        houl.globals.buddyList.setAutoUpdating(false);
        houl.setTopBarText(thisChatRoom.otherUser.name);
        thisChatRoom.setupNewMessageForm();
        thisChatRoom.waitForMessages();
    }

    function onFailure() {
        alert('Sorry, an error occurred. The chat room couldn\'t open');
    }
    
    function isReady() {
        if (thisChatRoom.receivedJson) {
            return true;
        }
        if (goog.DEBUG) {
            console.log('Waiting for chat room JSON...');
        }
        return false;
    }
    
    // If there is a JSON request in progress, wait until it completes.
    if (isReady()) {
        onReady();
    } else {
        var delay = new goog.async.ConditionalDelay(isReady);
        delay.onSuccess = onReady;
        delay.onFailure = onFailure;
        delay.start(500, 5000);
    }
}

/**
 * When enter is pressed in the message field, send the message.
 * When submit button is clicked or focused and user presses enter, send the message.
 * Focus on the new message field.
 *
 * @private
 */
houl.ChatRoom.prototype.setupNewMessageForm = function() {
    var field = goog.dom.$('chat-room-new-message-field');
    var submit = goog.dom.$('chat-room-new-message-send');
    var thisChatRoom = this;

    function resetField() {
        field.focus();
        goog.dom.forms.setValue(field, null);
    }

    /** @param {goog.events.BrowserEvent} evt */
    function onKeyPress(evt) {
        if (evt.keyCode == goog.events.KeyCodes.ENTER) {
            thisChatRoom.say(goog.dom.forms.getValue(field));
            resetField();
            evt.preventDefault();
        }
    }

    /** @param {goog.events.BrowserEvent} evt */
    function onClick(evt) {
        if (evt.isMouseActionButton) {
            thisChatRoom.say(goog.dom.forms.getValue(field));
            resetField();
            evt.preventDefault();
        }
    }

    resetField();
    goog.events.listen(field, goog.events.EventType.KEYPRESS, onKeyPress);
    goog.events.listen(submit, goog.events.EventType.KEYPRESS, onKeyPress);
    goog.events.listen(submit, goog.events.EventType.CLICK, onClick);
}

/**
 * @private
 * @todo - web socket
 */
houl.ChatRoom.prototype.say = function(message) {
    if (goog.string.isEmptySafe(message)) {
        if (goog.DEBUG) {
            console.log('Submitted form, but nothing to say.')
        }
        return;
    }

    if (goog.DEBUG) {
        console.log('Say: ' + message);
    }

    var sayURL = houl.getURL('say', {
        'userId': this.otherUser.id,
        'message': message
    });
    // We have to use an empty callback function (not null) or Closure Library ignores the HTTP method.
    goog.net.XhrIo.send(sayURL, function() { }, 'POST');
}

/** @private */
houl.ChatRoom.prototype.waitForMessages = function() {
    var url = houl.getURL('wait-for-messages', {
        'userId': this.otherUser.id,
        'lastReceived': this.lastReceivedEventId
    });

    var thisChatRoom = this;

    goog.net.XhrIo.send(url,
        /** @param {goog.events.Event} event */
        function(event) {
            var json = event.target.getResponseJson();
            var lastCms = (thisChatRoom.chatMessageSeriesArray.length > 0
                ? thisChatRoom.chatMessageSeriesArray[thisChatRoom.chatMessageSeriesArray.length - 1]
                : null);
            var messagesCount = json['messages'].length;
            for (var i = 0; i < messagesCount; i++) {
                var message = json['messages'][i];

                if (lastCms == null || lastCms.user.id != message['userId']) {
                    if (lastCms != null) {
                        lastCms.render(thisChatRoom);
                    }

                    lastCms = new houl.ChatMessageSeries(new houl.User(thisChatRoom.users[message['userId']]));
                    thisChatRoom.chatMessageSeriesArray.push(lastCms);
                }

                lastCms.addMessage(message['text'], message['timestamp']);
            }
            lastCms.render(thisChatRoom);
            thisChatRoom.lastReceivedEventId = json['lastId'];
            thisChatRoom.waitForMessages();
        });
}

/** @private @type {houl.User} */
houl.ChatRoom.prototype.otherUser = null;

/** @private @type {obj<number, houl.User>} */
houl.ChatRoom.prototype.users = null;

/** @private @type {HTMLElement} */
houl.ChatRoom.prototype.element = null;

/** @private @type {array<houl.ChatMessageSeries>} */
houl.ChatRoom.prototype.chatMessageSeriesArray = null;

/** @private @type {boolean} */
houl.ChatRoom.prototype.receivedJson = false;

/** @private @type {numnber} */
houl.ChatRoom.prototype.lastReceivedEventId = 0;
