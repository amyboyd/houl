goog.provide("houl");
goog.provide("houl.pages");

goog.require("houl.templates");
goog.require("goog.dom");
goog.require("goog.net.XhrIo");
goog.require("goog.events");
goog.require("goog.events.EventType");
goog.require("goog.style");

houl.pages.index = function() {
    var buddyList = new houl.BuddyList(houl.getAndActivatePageContainer('index-page'));
    buddyList.update();
}

houl.pages.request = function(requestorId) {
    alert(requestorId);
    // @todo
}

houl.pages.chatRoom = function(buddyId) {
    alert(buddyId);
    // @todo
}

houl.setTopBarText = function(text) {
    goog.dom.$('top-bar-inner').innerHTML = text;
}


/** @private @type {object<string, HTMLElement>} */
houl.pageContainers = {
    'index-page': goog.dom.$('index-page'),
    'request-page': goog.dom.$('request-page'),
    'chat-room-page': goog.dom.$('chat-room-page')
};
/**
 * @param {string} pageId One of index-page, request-page, etc.
 */
houl.getAndActivatePageContainer = function(pageId) {
    for (var id in houl.pageContainers) {
        var container = houl.pageContainers[id];
        goog.style.showElement(container, id == pageId);
    }
    return houl.pageContainers[pageId];
}

/**
 * Read a URL from the URL-list element.
 * @param {string} name
 * @param {string|number} params
 * @return {string} URL.
 */
houl.getURL = function(name, params) {
   var url = goog.dom.$('url-list').getAttribute('data-' + name);
   
   if (typeof params === 'string') {
       url = url.replace('%s', params);
   } else if (typeof params === 'number') {
       url = url.replace('%d', params);
   }
   
   return url;
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
}

houl.BuddyList.prototype.update = function() {
    var thisBuddyList = this;

    // Get the buddy list JSON from the server.
    goog.net.XhrIo.send(houl.getURL('buddy-list'), function(event) {
        var json = event.target.getResponseJson();

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
}

/** @type {HTMLDivElement} */
houl.BuddyList.prototype.element = null;

/** @type {number} */
houl.BuddyList.prototype.totalCount = 0;

/** @type {number} */
houl.BuddyList.prototype.totalOnline = 0;

/** @private @type {array} */
houl.BuddyList.prototype.buddies = [];


/**
 * See "models.Buddy.toJsonObject()".
 * @constructor
 */
houl.Buddy = function(json) {
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
    this.isRequest = (json['type'] === "incoming request");
    this.isOpenChat = (json['type'] === "open chat");
    this.isOtherType = (!this.isRequest && !this.isOpenChat);
}

/**
 * @param {houl.BuddyList} buddyList
 */
houl.Buddy.prototype.render = function(buddyList) {
    var el = document.createElement('div');
    el.innerHTML =  houl.templates.buddy({
        buddy: this
    });
    buddyList.element.appendChild(el);
    this.element = goog.dom.$('buddy-' + this.id);

    this.setEventHooks();
}

/** @private */
houl.Buddy.prototype.setEventHooks = function() {
    var link = goog.dom.$$('h2', null, this.element)[0];
    var thisBuddy = this;
    goog.events.listen(link, goog.events.EventType.CLICK, function(evt) {
        evt.preventDefault();

        if (this.isRequest) {
            houl.pages.request(thisBuddy.id);
        } else {
            houl.pages.chatRoom(thisBuddy.id);
        }
    });
}

/** @private @type {HTMLDivElement} */
houl.Buddy.prototype.element = null;
houl.Buddy.prototype.id = null;
houl.Buddy.prototype.type = null;
houl.Buddy.prototype.status = null;
