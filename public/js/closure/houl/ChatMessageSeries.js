goog.provide('houl.ChatMessageSeries');

goog.require('houl');
goog.require('houl.templates');
goog.require('houl.Emoticons');
goog.require('goog.dom');
goog.require('goog.date.relative');
goog.require('goog.string');

/**
 * @constructor
 * @param {houl.User} user
 */
houl.ChatMessageSeries = function(user) {
    this.user = user;
    this.messages = [];
    this.firstTimestamp = null;
    this.firstTimestampRelative = null;
}

/**
 * @param {string} message
 * @param {number} timestamp Milliseconds since Epoch.
 */
houl.ChatMessageSeries.prototype.addMessage = function(message, timestamp) {
    message = goog.string.htmlEscape(message);
    message = houl.Emoticons.insertEmoticonImages(message);

    this.messages.push([message, timestamp]);

    if (this.firstTimestamp == null) {
        this.firstTimestamp = timestamp;
        this.firstTimestampRelative = goog.date.relative.formatPast(timestamp);
        this.htmlId = 'cms-' + this.user.id + "-" + this.firstTimestamp;
    }
}

/**
 * @param {houl.ChatRoom} chatRoom
 */
houl.ChatMessageSeries.prototype.render = function(chatRoom) {
    var html = houl.templates.chatMessageSeries({
        chatMessageSeries: this
    });

    var existing = goog.dom.$(this.htmlId);
    if (existing != null) {
        // If this has already been rendered, just update the existing element.
        existing.innerHTML = html;
    } else {
        // Not already rendered.
        var template = goog.dom.createElement('div');
        template.id = this.htmlId;
        template.innerHTML = html;
        goog.dom.appendChild(goog.dom.$$(null, 'chat-room-cms-list', chatRoom.element)[0], template);
    }
}

houl.ChatMessageSeries.prototype.toString = function() {
    return 'CMS: ' + this.messages.length + ' messsages from ' + this.user;
}

/** @type {number} */
houl.ChatMessageSeries.prototype.id = null;

/** @type {houl.User} */
houl.ChatMessageSeries.prototype.user = null;

/** @type {array<array>} */
houl.ChatMessageSeries.prototype.messages = null;

/** @type {number} Milliseconds since Epoch, for the first message in this series. */
houl.ChatMessageSeries.prototype.firstTimestamp = null;

/** @type {string} "2 minutes ago", etc */
houl.ChatMessageSeries.prototype.firstTimestampRelative = null;
