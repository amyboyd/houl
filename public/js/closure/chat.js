//// The var `userNickName` should be defined externally.
//var userNickName = userNickName || "";
//
//if (document.body.id === "long-polling") {
//    longPollingPage();
//}
//else if (document.body.id === "web-socket") {
//    webSocketPage();
//}
//
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
