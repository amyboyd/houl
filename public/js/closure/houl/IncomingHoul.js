goog.provide('houl.IncomingHoul');

goog.require('houl');
goog.require('houl.templates');
goog.require('houl.User');
goog.require('houl.ChatRoom');
goog.require('goog.dom');
goog.require('goog.events');
goog.require('goog.events.EventType');
goog.require('goog.net.XhrIo');
goog.require('goog.soy');

/**
 * @constructor
 */
houl.IncomingHoul = function(json) {
    this.user = new houl.User(json);
}

/**
 * @param {houl.BuddyList} buddyList
 */
houl.IncomingHoul.prototype.render = function(buddyList) {
    if (this.element == null) {
        this.element = goog.soy.renderAsElement(houl.templates.incomingHoul, {
            houl: this
        });
        goog.dom.insertChildAt(buddyList.element, this.element, 0);

        var thisHoul = this;
        goog.events.listenOnce(goog.dom.$$(null, 'accept-houl', thisHoul.element)[0], goog.events.EventType.CLICK,
            function(evt) {
                thisHoul.accept(evt)
            });
        goog.events.listenOnce(goog.dom.$$(null, 'ignore-houl', thisHoul.element)[0], goog.events.EventType.CLICK,
            function(evt) {
                thisHoul.ignore(evt)
            });
    }
}

/** @private @type {goog.events.BrowserEvent} */
houl.IncomingHoul.prototype.accept = function(evt) {
    this.ignore(evt);

    var chatRoom = new houl.ChatRoom(this.user);
    chatRoom.render();
}

/** @private @type {goog.events.BrowserEvent} */
houl.IncomingHoul.prototype.ignore = function(evt) {
    evt.preventDefault();
    evt.stopPropagation();

    goog.dom.removeNode(this.element);

    goog.net.XhrIo.send(houl.getURL('mark-houl-as-seen', {
        'buddyId': this.user.id
    }), null, 'POST');
}

/** @type {houl.User} */
houl.IncomingHoul.prototype.user = null;

/** @private @type {HTMLElement} */
houl.IncomingHoul.prototype.element = null;
