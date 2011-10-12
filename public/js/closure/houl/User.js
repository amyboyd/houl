goog.provide('houl.User');

goog.require('houl');
goog.require('goog.net.XhrIo');

/** @type {houl.User} The authenticated user. */
houl.User.currentUser = null;

/**
 * @constructor
 * @param {obj} json Comes from 'models.User.toJsonObject()' in Java.
 */
houl.User = function(json) {
    this.setValuesFromJSON(json);
}

/**
 * @param {number} id
 * @param {function} onSuccess Called with the user as the only parameter.
 */
houl.User.getByID = function(id, onSuccess) {
    var url = houl.getURL('user', {
        'id': id
    });
    goog.net.XhrIo.send(url, function(evt) {
        var user = new houl.User(evt.target.getResponseJson());
        onSuccess(user);
    });
}

houl.User.prototype.update = function(onComplete) {
    var url = houl.getURL('user', {
        'id': this.id
    });
    var thisUser = this;

    goog.net.XhrIo.send(url, function(evt) {
        thisUser.setValuesFromJSON(evt.target.getResponseJson());
        onComplete();
    });
}

/** @private */
houl.User.prototype.setValuesFromJSON = function(json) {
    this.id = json['id'];
    this.name = json['name'];
    this.avatarURL = json['avatarURL'];
    this.status = json['status'];
    this.pin = json['pin'];
    this.email = json['email'];
    this.isCurrentUser = json['isCurrentUser'];
}

houl.User.prototype.toString = function() {
    return this.name;
}

/** @type {number} */
houl.User.prototype.id = null;

/** @type {string} */
houl.User.prototype.name = null;

/** @type {string} Absolute URL to a 48x48-pixels image. */
houl.User.prototype.avatarURL = null;

/** @type {string} The user's status (like a Twitter user's last tweet). */
houl.User.prototype.status = null;

/** @type {string} */
houl.User.prototype.email = null;

/** @type {boolean} */
houl.User.prototype.isCurrentUser = null;
