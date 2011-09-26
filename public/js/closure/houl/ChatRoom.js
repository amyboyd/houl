goog.provide('houl.ChatRoom');

goog.require('houl');
goog.require('houl.globals');
goog.require('houl.templates');
goog.require('goog.async.Delay');
goog.require('goog.dom');
goog.require('goog.events');
goog.require('goog.events.EventType');
goog.require('goog.net.XhrIo');
goog.require('goog.net.WebSocket');

/**
 * @constructor
 * @param {houl.Buddy} buddy
 */
houl.ChatRoom = function(buddy) {
    this.buddy = buddy;
    this.element = houl.getAndActivatePageContainer('chat-room-page');
    goog.dom.removeChildren(this.element);

    var url = houl.getURL('room-json', {
        'buddyId': buddy.id
    });
    goog.net.XhrIo.send(url, function(event) {
        var json = event.target.getResponseJson();
        console.log(json);
        // @todo
    })
}

houl.ChatRoom.prototype.render = function() {
    var template = goog.dom.createElement('div');
    template.innerHTML =  houl.templates.chatRoom({
        chatMessageSeriesArray: []
    });
    goog.dom.appendChild(this.element, template);

    goog.dom.$('chat-room-new-message-field').focus();

    houl.setTopBarText(this.buddy.name);

    this.createWebSocket();
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
