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
goog.require('goog.net.WebSocket');

/**
 * @constructor
 * @param {houl.Buddy} buddy
 */
houl.ChatRoom = function(buddy) {
    this.buddy = buddy;
    this.element = houl.getAndActivatePageContainer('chat-room-page');
    this.chatMessageSeriesArray = [];
    this.receivedJson = false;

    var url = houl.getURL('room-json', {
        'buddyId': buddy.id
    });
    var thisChatRoom = this;
    goog.net.XhrIo.send(url, function(event) {
        thisChatRoom.parseJson(event.target.getResponseJson());
    });
}

/**
 * Parse the room's JSON.
 */
houl.ChatRoom.prototype.parseJson = function(json) {
    if (goog.DEBUG) {
        console.log('Chat room JSON:', json);
    }

    var cms = null;
    for (var i = 0; i < json['messagesCount']; i++) {
        var message = json['messages'][i];
        
        if (cms == null || cms.user.id != message['userId']) {
            cms = new houl.ChatMessageSeries(new houl.User(json['user' + message['userId']]));
            this.chatMessageSeriesArray.push(cms);
        }

        cms.addMessage(message['text'], message['timestamp']);
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
            chatMessageSeriesArray: thisChatRoom.chatMessageSeriesArray
        });
        goog.dom.appendChild(thisChatRoom.element, template);

        houl.globals.buddyList.setAutoUpdating(false);
        houl.setTopBarText(thisChatRoom.buddy.name);
        thisChatRoom.setupNewMessageForm();
//        thisChatRoom.createWebSocket();
    }

    function onFailure() {
        alert('Sorry, an error occurred. The chat room couldn\'t open');
    }
    
    function isReady() {
        if (thisChatRoom.receivedJson) {
            return true;
        }
        console.log('Waiting for chat room JSON...');
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

    var sayURL = houl.getURL('long-polling-say', {
        'buddyId': this.buddy.id,
        'message': message
    });
    goog.net.XhrIo.send(sayURL);
}

/** @private @return {boolean} */
houl.ChatRoom.prototype.createWebSocket = function() {
    var ws = new goog.net.WebSocket();

    //    var handler = new goog.events.EventHandler();
    //    handler.listen(ws, goog.net.WebSocket.EventType.OPENED, onOpen);
    //    handler.listen(ws, goog.net.WebSocket.EventType.MESSAGE, onMessage);

    try {
        var url = houl.getURL('web-socket', {
            'buddyId': this.buddy.id
        });
        ws.open(url);
    // @todo
    } catch (e) {
        throw 'WebSocket exception: ' + e;
    }
}

/** @private @type {houl.Buddy} */
houl.ChatRoom.prototype.buddy = null;

/** @private @type {HTMLElement} */
houl.ChatRoom.prototype.element = null;

/** @private @type {array<houl.ChatMessageSeries>} */
houl.ChatRoom.prototype.chatMessageSeriesArray = null;

/** @private @type {boolean} */
houl.ChatRoom.prototype.receivedJson = false;

//function longPollingPage() {
//    var lastReceived = 0;
//    var waitMessages = '@@{LongPolling.waitMessages}';
//
//    // Retrieve new messages.
//    var getMessages = function() {
//        $.ajax({
//            url: waitMessages + '?lastReceived=' + lastReceived,
//            success: function(events) {
//                $(events).each(function() {
//                    display(this.data);
//                    lastReceived = this.id;
//                });
//                getMessages();
//            },
//            dataType: 'json'
//        });
//    }
//
//    getMessages();
//
//    // Display a message.
//    var display = function(event) {
//        $('#thread').append(tmpl('message_tmpl', {event: event}));
//        $('#thread').scrollTo('max');
//    }
//}
//
//function webSocketPage() {
//    // Create a socket.
//    var socket = new WebSocket('@@{WebSocket.ChatRoomSocket.join}?user=' + userNickName);
//
//    // Display a message.
//    var display = function(event) {
//        $('#thread').append(tmpl('message_tmpl', {event: event}));
//        $('#thread').scrollTo('max');
//    }
//
//    // Message received on the socket.
//    socket.onmessage = function(event) {
//        var parts = /^([^:]+):([^:]+)(:(.*))?$/.exec(event.data)
//        display({
//            type: parts[1],
//            user: parts[2],
//            text: parts[4]
//        });
//    }
//
//    $('#send').click(function(e) {
//        var message = $('#message').val();
//        $('#message').val('');
//        socket.send(message);
//    });
//
//    $('#message').keypress(function(e) {
//        if(e.charCode == 13 || e.keyCode == 13) {
//            $('#send').click();
//            e.preventDefault();
//        }
//    });
//}
