goog.provide('houl');

goog.require('goog.dom');
goog.require('goog.style');
goog.require('goog.string');

/**
 * @type {houl.BuddyList}
 */
houl.globalBuddyList = null;

houl.setTopBarText = function(text) {
    goog.dom.$$('h1', null, goog.dom.$('top-bar'))[0].innerHTML = text;
}


/** @private @type {object<string, HTMLElement>} */
var pageContainers = {
    'loading-page': goog.dom.$('loading-page'),
    'index-page': goog.dom.$('index-page'),
    'request-page': goog.dom.$('request-page'),
    'chat-room-page': goog.dom.$('chat-room-page'),
    'options-page': goog.dom.$('options-page'),
    'edit-profile-page': goog.dom.$('edit-profile-page')
};
/**
 * @param {string} pageId One of index-page, request-page, etc.
 */
houl.getAndActivatePageContainer = function(pageId) {
    for (var id in pageContainers) {
        var container = pageContainers[id];
        goog.style.showElement(container, id == pageId);
    }
    return pageContainers[pageId];
}

/**
 * Get a URL from the URL-list element.
 *
 * @param {string} name
 * @param {object} params The parameters to set, e.g. {'id': 5} will replace 'id=?' with 'id=5'.
 * @return {string} The URL.
 */
houl.getURL = function(name, params) {
    var url = goog.dom.$('url-list').getAttribute('data-' + name);
    if (goog.string.isEmptySafe(url)) {
        throw 'No URL for name \'' + name + '\'';
    }

    url = goog.string.urlDecode(url);

    if (params != null) {
        for (var key in params) {
            url = url.replace(key + '=?', key + '=' + goog.string.urlEncode(params[key]));
        }
    }

    return url;
}
