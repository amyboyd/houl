goog.provide('houl.pages');

goog.require('houl.globals');
goog.require('houl.templates');
goog.require('houl.BuddyList');
goog.require('goog.dom');
goog.require('goog.events');
goog.require('goog.events.EventType');

houl.pages.index = function() {
    houl.globals.buddyList = new houl.BuddyList(houl.getAndActivatePageContainer('index-page'));
    houl.globals.buddyList.update();
}

/**
 * @param {houl.Buddy} requester
 */
houl.pages.request = function(requester) {
    var buddyEl = goog.dom.$('buddy-' + requester.id);

    // Remove the request message.
    var messageEl = goog.dom.$$('div', 'buddy-message', buddyEl)[0];
    goog.dom.removeNode(messageEl);

    // Show accept/reject buttons.
    var requestEl = goog.dom.createElement('div');
    requestEl.innerHTML =  houl.templates.request({
        requester: requester
    });
    goog.dom.appendChild(buddyEl, requestEl);

    // Set event listeners.
    var acceptButton = goog.dom.$$('button', 'button-green', requestEl)[0];
    var rejectButton = goog.dom.$$('button', 'button-grey', requestEl)[0];
    goog.events.listenOnce(acceptButton, goog.events.EventType.CLICK,
        function(evt) {
            goog.dom.setTextContent(acceptButton, 'One second...');
            goog.dom.removeNode(rejectButton);

            // Make a HTTP request to accept the request.
            var url = houl.getURL('request-handler', {
                requesterId: requester.id,
                response: 'accept'
            }); 
            goog.net.XhrIo.send(url, function(event) {
                requestEl.innerHTML = 'You and ' + requester.name + ' can now chat!';
                houl.globals.buddyList.updateAfterInterval(2000);
            }, 'POST');
            
        });
    goog.events.listenOnce(rejectButton, goog.events.EventType.CLICK,
        function(evt) {
            goog.dom.setTextContent(rejectButton, 'One second...');
            goog.dom.removeNode(acceptButton);

            // Make a HTTP request to reject the request.
            var url = houl.getURL('request-handler', {
                requesterId: requester.id,
                response: 'reject'
            });
            goog.net.XhrIo.send(url, function(event) {
                houl.globals.buddyList.update();
            }, 'POST');
        });
}

/**
 * @param {houl.Buddy} buddy
 */
houl.pages.chatRoom = function(buddy) {
    // @todo
    alert('chat room');
}
