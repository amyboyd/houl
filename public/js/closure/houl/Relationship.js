goog.provide('houl.Relationship');

goog.require('houl');
goog.require('houl.ChatRoom');
goog.require('houl.User');
goog.require('houl.RespondToRequest');
goog.require('houl.templates');
goog.require('goog.dom');
goog.require('goog.events');
goog.require('goog.events.EventType');

/**
 * @constructor
 * @param {obj} json Comes from 'models.Relationship.toJsonObject()' in Java.
 */
houl.Relationship = function(json) {
    this.otherUser = new houl.User(json['otherUser']);
    this.type = json['type'];
    this.lastChatAt = json['lastChatAt'];
    this.lastChatMessage = json['lastChatMessage'];
    this.requestedAt = json['requestedAt'];
    this.requestMessage = json['requestMessage'];
    this.acceptedAt = json['acceptedAt'];

    // Some shortcut properties.
    this.isRequest = (json['type'] === 'incoming request');
    this.isOpenChat = (json['type'] === 'open chat');
    this.isOtherType = (!this.isRequest && !this.isOpenChat);
}

/**
 * @param {houl.BuddyList} buddyList
 */
houl.Relationship.prototype.render = function(buddyList) {
    var el = document.createElement('div');
    el.innerHTML =  houl.templates.relationship({
        relationship: this
    });
    goog.dom.appendChild(buddyList.element, el);
    this.element = goog.dom.$('relationship-with-user-' + this.otherUser.id);

    this.setEventHooks();
}

/** @private */
houl.Relationship.prototype.setEventHooks = function() {
    var link = goog.dom.$$('h2', null, this.element)[0];
    var thisRelationship = this;
    goog.events.listenOnce(link, goog.events.EventType.CLICK,
        function(evt) {
            evt.preventDefault();

            if (thisRelationship.isRequest) {
                var rtr = new houl.RespondToRequest(thisRelationship);
                rtr.render();
            } else {
                var chatRoom = new houl.ChatRoom(thisRelationship.otherUser);
                chatRoom.render();
            }
        });
}

/** @type {HTMLDivElement} */
houl.Relationship.prototype.element = null;

/** @type {houl.User} */
houl.Relationship.prototype.otherUser = null;
