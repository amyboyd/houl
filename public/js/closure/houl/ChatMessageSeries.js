goog.provide('houl.ChatMessageSeries');

/**
 * @constructor
 * @param {houl.User} user
 */
houl.ChatMessageSeries = function(user) {
    this.user = user;
    this.messages = [];
    this.firstTimestamp = null;
}

/**
 * @param {string} message
 * @param {number} timestamp Milliseconds since Epoch.
 */
houl.ChatMessageSeries.prototype.addMessage = function(message, timestamp) {
    this.messages.push([message, timestamp]);
    
    if (this.firstTimestamp == null) {
        this.firstTimestamp = timestamp;
    }
}

houl.ChatMessageSeries.prototype.toString = function() {
    return "CMS: " + this.messages.length + " messsages from " + this.user;
}

/** @type {houl.User} */
houl.ChatMessageSeries.prototype.user = null;

/** @type {array<array>} */
houl.ChatMessageSeries.prototype.messages = null;

/** @type {number} Milliseconds since Epoch, for the first message in this series. */
houl.ChatMessageSeries.prototype.firstTimestamp = null;
