goog.provide('houl.ChatRoom');

goog.require('houl');
goog.require('houl.globals');
goog.require('houl.templates');
goog.require('goog.async.Delay');
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

    var url = houl.getURL('room-json', {
        'buddyId': buddy.id
    });
    goog.net.XhrIo.send(url, function(event) {
        var json = event.target.getResponseJson();
        if (goog.DEBUG) {
            console.log("Chat room JSON:", json);
        }

    //        var lastMessageUser = null;
    //        for (var i = 0; i < json.messages.length; i++) {
    //        // @todo
    //        }
    });
}

houl.ChatRoom.prototype.render = function() {
    // Clear old chat room messages.
    goog.dom.removeChildren(this.element);

    var template = goog.dom.createElement('div');
    template.innerHTML =  houl.templates.chatRoom({
        chatMessageSeriesArray: []
    });
    goog.dom.appendChild(this.element, template);

    houl.globals.buddyList.setAutoUpdating(false);
    houl.setTopBarText(this.buddy.name);
    this.setupNewMessageForm();
    this.createWebSocket();
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
            console.log("Submitted form, but nothing to say.")
        }
        return;
    }

    if (goog.DEBUG) {
        console.log("Say: " + message);
    }

    var sayURL = houl.getURL('long-polling-say', {
        'buddyId': this.buddy.id,
        'message': message
    });
    goog.net.XhrIo.send(sayURL,
        /** @param {goog.events.Event} evt */
        function(evt) {
            // @todo
            console.log(evt);
        });
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
        throw "WebSocket exception: " + e;
    }
}

/** @private @type {houl.Buddy} */
houl.ChatRoom.prototype.buddy = null;

/** @private @type {HTMLElement} */
houl.ChatRoom.prototype.element = null;

//function longPollingPage() {
//    console.log("Long polling");
//
//    $('#message').focus();
//
//    var lastReceived = 0;
//    var waitMessages = "@@{LongPolling.waitMessages}";
//    var say = "@@{LongPolling.say}";
//
//    $('#send').click(function(e) {
//        var message = $('#message').val();
//        $('#message').val('').focus();
//        $.post(say, {user: userNickName, message: message});
//    });
//
//    $('#message').keypress(function(e) {
//        if(e.charCode == 13 || e.keyCode == 13) {
//            $('#send').click();
//            e.preventDefault();
//        }
//    })
//
//    // Retrieve new messages.
//    var getMessages = function() {
//        $.ajax({
//            url: waitMessages + "?lastReceived=" + lastReceived,
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
//    console.log("WebSocket");
//
//    $('#message').focus();
//
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
