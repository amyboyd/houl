goog.provide('houl.Buddy');

goog.require('houl');
goog.require('goog.dom');
goog.require('goog.events');
goog.require('goog.events.EventType');

/**
 * See 'models.Buddy.toJsonObject()'.
 * @constructor
 */
houl.Buddy = function(json) {
    this.id = json['id'];
    this.name = json['name'];
    this.type = json['type'];
    this.imageURL = json['imageURL'];
    this.lastChatAt = json['lastChatAt'];
    this.lastChatMessage = json['lastChatMessage'];
    this.requestedAt = json['requestedAt'];
    this.requestMessage = json['requestMessage'];
    this.acceptedAt = json['acceptedAt'];
    this.status = json['status'];

    // Some shortcut properties.
    this.isRequest = (json['type'] === 'incoming request');
    this.isOpenChat = (json['type'] === 'open chat');
    this.isOtherType = (!this.isRequest && !this.isOpenChat);
}

/**
 * @param {houl.BuddyList} buddyList
 */
houl.Buddy.prototype.render = function(buddyList) {
    var el = document.createElement('div');
    el.innerHTML =  houl.templates.buddy({
        buddy: this
    });
    goog.dom.appendChild(buddyList.element, el);
    this.element = goog.dom.$('buddy-' + this.id);

    this.setEventHooks();
}

/** @private */
houl.Buddy.prototype.setEventHooks = function() {
    var link = goog.dom.$$('h2', null, this.element)[0];
    var thisBuddy = this;
    goog.events.listenOnce(link, goog.events.EventType.CLICK,
        function(evt) {
            evt.preventDefault();

            if (thisBuddy.isRequest) {
                houl.pages.request(thisBuddy);
            } else {
                houl.pages.chatRoom(thisBuddy);
            }
        });
}

/** @private @type {HTMLDivElement} */
houl.Buddy.prototype.element = null;
houl.Buddy.prototype.id = null;
houl.Buddy.prototype.type = null;
houl.Buddy.prototype.status = null;
