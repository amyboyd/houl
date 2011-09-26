goog.provide('houl.Relationship');

goog.require('houl');
goog.require('houl.ChatRoom');
goog.require('houl.RespondToRequest');
goog.require('goog.dom');
goog.require('goog.events');
goog.require('goog.events.EventType');

/**
 * See 'models.Relationship.toJsonObject()' (Java).
 *
 * @constructor
 * @param {obj} json
 */
houl.Relationship = function(json) {
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
houl.Relationship.prototype.render = function(buddyList) {
    var el = document.createElement('div');
    el.innerHTML =  houl.templates.relationship({
        relationship: this
    });
    goog.dom.appendChild(buddyList.element, el);
    this.element = goog.dom.$('relationship-' + this.id);

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
                var chatRoom = new houl.ChatRoom(thisRelationship);
                chatRoom.render();
            }
        });
}

/** @private @type {HTMLDivElement} */
houl.Relationship.prototype.element = null;

// Public data.
houl.Relationship.prototype.id = null;
houl.Relationship.prototype.type = null;
houl.Relationship.prototype.status = null;
