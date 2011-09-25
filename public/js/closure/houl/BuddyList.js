goog.provide('houl.BuddyList');

goog.require('houl');
goog.require('houl.Buddy');
goog.require('goog.dom');
goog.require('goog.net.XhrIo');
goog.require('goog.async.Delay');

/**
 * The buddy list updates automatically regularly.
 * You can force it to update with 'update()' and 'updateAfterInterval()'.
 * An instance of this class is accessible globally as 'houl.globals.buddyList'.
 *
 * @constructor
 * @param {HTMLDivElement} element
 */
houl.BuddyList = function(element) {
    if (element === null || typeof element === 'undefined') {
        throw 'Element must be a HTMLElement';
    }

    this.element = element;
}

/** @private @type {number} */
var AUTO_UPDATE_INTERVAL_IN_SECONDS = 15;

houl.BuddyList.prototype.update = function() {
    var thisBuddyList = this;

    // Get the buddy list JSON from the server.
    goog.net.XhrIo.send(houl.getURL('buddy-list'), function(event) {
        var json = event.target.getResponseJson();

        thisBuddyList.reset();

        // Render each buddy.
        for (var i = 0; i < json.length; i++) {
            var buddy = new houl.Buddy(json[i]);
            buddy.render(thisBuddyList);
            thisBuddyList.buddies.push(buddy);
            thisBuddyList.totalCount++;
            if (buddy.isOpenChat) {
                thisBuddyList.totalOnline++;
            }
        }

        houl.setTopBarText('Online (' + thisBuddyList.totalOnline + '/' + thisBuddyList.totalCount + ')');
    });

    thisBuddyList.updateAfterInterval(AUTO_UPDATE_INTERVAL_IN_SECONDS * 1000);
}

/**
 * @param {number} interval Miliseconds until the buddy list is updated.
 */
houl.BuddyList.prototype.updateAfterInterval = function(interval) {
    if (interval < 10) {
        this.update();
    } else {
        // Wait a few seconds then update the buddy list.
        var delay = new goog.async.Delay(function() {
            houl.globals.buddyList.update();
        }, interval);
        delay.start();
    }
}

/** @private */
houl.BuddyList.prototype.reset = function() {
    goog.dom.removeChildren(this.element);
    this.totalCount = 0;
    this.totalOnline = 0;
    this.buddies = [];
}

/** @type {HTMLDivElement} */
houl.BuddyList.prototype.element = null;

/** @type {number} */
houl.BuddyList.prototype.totalCount = 0;

/** @type {number} */
houl.BuddyList.prototype.totalOnline = 0;

/** @type {array} */
houl.BuddyList.prototype.buddies = [];
