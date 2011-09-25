goog.provide('houl.RespondToRequest');

goog.require('houl');
goog.require('houl.globals');
goog.require('houl.templates');
goog.require('goog.async.Delay');
goog.require('goog.dom');
goog.require('goog.events');
goog.require('goog.events.EventType');
goog.require('goog.net.XhrIo');

/**
 * @constructor
 * @param {houl.Buddy} buddy
 */
houl.RespondToRequest = function(buddy) {
    this.buddy = buddy;
}

/** @private */
houl.RespondToRequest.prototype.render = function() {
    // Disable the buddy list from auto-updating so the buttons don't disappear.
    houl.globals.buddyList.setAutoUpdating(false);

    // Remove the request message.
    var messageEl = goog.dom.$$('div', 'buddy-message', this.buddy.element)[0];
    goog.dom.removeNode(messageEl);

    // Show site's question ('do you want to accept?') and accept/reject buttons.
    this.element = goog.dom.createElement('div');
    this.element.innerHTML =  houl.templates.request({
        requester: this.buddy
    });
    goog.dom.appendChild(this.buddy.element, this.element);

    this.acceptButton = goog.dom.$$('button', 'button-green', this.element)[0];
    this.rejectButton = goog.dom.$$('button', 'button-grey', this.element)[0];

    this.setupAcceptButton();
    this.setupRejectButton();
}

/** @private */
houl.RespondToRequest.prototype.setupAcceptButton = function() {
    var thisRTR = this;
    
    goog.events.listenOnce(thisRTR.acceptButton, goog.events.EventType.CLICK,
        function(evt) {
            goog.dom.setTextContent(thisRTR.acceptButton, 'One second...');
            goog.dom.removeNode(thisRTR.rejectButton);

            // Make a HTTP request to accept the request.
            var url = houl.getURL('request-handler', {
                'requesterId': thisRTR.buddy.id,
                'response': 'accept'
            }); 
            goog.net.XhrIo.send(url, function(event) {
                thisRTR.element.innerHTML = 'You and ' + thisRTR.buddy.name + ' can now chat!';
                houl.globals.buddyList.setAutoUpdating(true);
                houl.globals.buddyList.updateAfterInterval(2000);
            }, 'POST');
            
        });
}

/** @private */
houl.RespondToRequest.prototype.setupRejectButton = function() {
    var thisRTR = this;
    
    goog.events.listenOnce(this.rejectButton, goog.events.EventType.CLICK,
        function(evt) {
            goog.dom.setTextContent(thisRTR.rejectButton, 'One second...');
            goog.dom.removeNode(thisRTR.acceptButton);

            // Make a HTTP request to reject the request.
            var url = houl.getURL('request-handler', {
                'requesterId': thisRTR.buddy.id,
                'response': 'reject'
            });
            goog.net.XhrIo.send(url, function(event) {
                houl.globals.buddyList.setAutoUpdating(true);
                houl.globals.buddyList.update();
            }, 'POST');
        });
}

/** @private @type {HTMLButtonElement} */
houl.RespondToRequest.prototype.acceptButton = null;

/** @private @type {HTMLButtonElement} */
houl.RespondToRequest.prototype.rejectButton = null;

/** @private @type {HTMLElement} */
houl.RespondToRequest.prototype.element = null;
