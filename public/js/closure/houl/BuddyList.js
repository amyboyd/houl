goog.provide('houl.BuddyList');

goog.require('houl');
goog.require('houl.Buddy');
goog.require('houl.globals');
goog.require('goog.async.Delay');
goog.require('goog.dom');
goog.require('goog.net.XhrIo');

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

    if (thisBuddyList.enableAutoUpdating) {
        thisBuddyList.updateAfterInterval(AUTO_UPDATE_INTERVAL_IN_SECONDS * 1000);
        if (goog.DEBUG) {
            console.log('Auto-updating is on, queued to update in ' + AUTO_UPDATE_INTERVAL_IN_SECONDS + ' seconds');
        }
    }
}

/**
 * @param {number} interval Miliseconds until the buddy list is updated.
 */
houl.BuddyList.prototype.updateAfterInterval = function(interval) {
    // Clear any old delay, because its interval is no longer what we need.
    if (this.autoUpdateDelay != null) {
        this.autoUpdateDelay.stop();
        this.autoUpdateDelay = null;
    }

    this.autoUpdateDelay = new goog.async.Delay(function() {
        houl.globals.buddyList.update();
    }, interval);
    this.autoUpdateDelay.start();
}

/**
 * Enable or disable automatic updating.
 *
 * @param {boolean} enabled
 */
houl.BuddyList.prototype.setAutoUpdating = function(enabled) {
    this.enableAutoUpdating = enabled;
    if (goog.DEBUG) {
        console.log('Set auto updating: ' + (enabled ? 'on' : 'off'));
    }
    if (!enabled && this.autoUpdateDelay != null) {
        this.autoUpdateDelay.stop();
        this.autoUpdateDelay = null;
    }
}

/** @private */
houl.BuddyList.prototype.reset = function() {
    goog.dom.removeChildren(this.element);
    this.totalCount = 0;
    this.totalOnline = 0;
    this.buddies = [];
}

/** @private @type {boolean} */
houl.BuddyList.prototype.enableAutoUpdating = true;

/** @private @type {goog.async.Delay} */
houl.BuddyList.prototype.autoUpdateDelay = null;

/** @type {HTMLDivElement} */
houl.BuddyList.prototype.element = null;

/** @type {number} */
houl.BuddyList.prototype.totalCount = 0;

/** @type {number} */
houl.BuddyList.prototype.totalOnline = 0;

/** @type {array} */
houl.BuddyList.prototype.buddies = [];

/** @constant @private @type {number} */
var AUTO_UPDATE_INTERVAL_IN_SECONDS = 15;
