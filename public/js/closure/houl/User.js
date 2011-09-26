goog.provide('houl.User');

goog.require('houl');

/**
 * @constructor
 * @param {obj} json
 */
houl.User = function(json) {
    this.id = json['id'];
    this.name = json['name'];
    this.imageURL = json['imageURL'];
    this.status = json['status'];
}

houl.User.prototype.toString = function() {
    return this.name;
}

/** @type {number} */
houl.User.prototype.id = null;

/** @type {string} */
houl.User.prototype.name = null;

/** @type {string} Absolute URL to a 48x48-pixels image. */
houl.User.prototype.imageURL = null;

/** @type {string} The user's status (like a Twitter user's last tweet). */
houl.User.prototype.status = null;
