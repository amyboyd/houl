goog.provide("houl");
goog.provide("houl.index");

goog.require("houl.templates");

houl.index = function() {
    
}

/**
 * @constructor
 */
houl.Buddy = function(json) {
    this.prototype = JSON.decode(json);
    this.isRequest = (this.type == "incoming request");
    this.isOpenChat = (this.type == "open chat");
    this.isOtherType = (!this.isRequest && !this.isOpenChat);
}
