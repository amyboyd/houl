goog.provide("houl");
goog.provide("houl.index");

goog.require("houl.templates");
goog.require("goog.dom");
goog.require("goog.net.XhrIo");

houl.index = function() {
    var buddyList = new houl.BuddyList(goog.dom.$('buddy-list'));
    buddyList.update();
}

houl.setTopBarText = function(text) {
    goog.dom.$('top-bar-inner').innerHTML = text;
}

/**
 * @constructor
 * @param {HTMLDivElement} element
 */
houl.BuddyList = function(element) {
    if (element == null || typeof element === "undefined") {
        throw "Element must be a HTMLElement";
    }

    this.element = element;
    this.src = element.getAttribute('data-src');
}

houl.BuddyList.prototype.update = function() {
    var self = this;

    // Get the buddy list JSON from the server...
    goog.net.XhrIo.send(this.src, function(event, xhr) {
        var json = event.target.getResponseJson();
        for (var i = 0; i < json.length; i++) {
            // Render each buddy and count them.
            var buddy = new houl.Buddy(json[i]);
            buddy.render(self);

            self.buddies.push(buddy);
            self.totalCount++;
            if (buddy.isOpenChat) {
                self.totalOnline++;
            }
        }

        houl.setTopBarText('Online (' + self.totalOnline + '/' + self.totalCount + ')');
    });
}

/** @type {HTMLDivElement} */
houl.BuddyList.prototype.element = null;

/** @type {HTMLDivElement} */
houl.BuddyList.prototype.totalCount = 0;

/** @type {HTMLDivElement} */
houl.BuddyList.prototype.totalOnline = 0;

/** @private @type {string} URL to get the buddy list JSON */
houl.BuddyList.prototype.src = null;

/** @private @type {array} */
houl.BuddyList.prototype.buddies = [];


/**
 * See "models.Buddy.toJsonObject()".
 * @constructor
 */
houl.Buddy = function(json) {
    this.id = json.id;
    this.name = json.name;
    this.type = json.type;
    this.url = json.url;
    this.imageURL = json.imageURL;
    this.lastChatAt = json.lastChatAt;
    this.lastChatMessage = json.lastChatMessage;
    this.requestedAt = json.requestedAt;
    this.requestMessage = json.requestMessage;
    this.acceptedAt = json.acceptedAt;

    // Some shortcut properties.
    this.isRequest = (json.type == "incoming request");
    this.isOpenChat = (json.type == "open chat");
    this.isOtherType = (!this.isRequest && !this.isOpenChat);
}

/**
 * @param {houl.BuddyList} buddyList
 */
houl.Buddy.prototype.render = function(buddyList) {
    var html = houl.templates.buddy({
        buddy: this
    });
    buddyList.element.innerHTML += html;
}
