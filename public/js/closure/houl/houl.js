goog.provide('houl');

goog.require('goog.dom');
goog.require('goog.style');
goog.require('goog.string.format');
goog.require('goog.array');

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
 * Get a URL from the URL-list element.
 *
 * @param {string} name
 * @param {object} params The parameters to set, e.g. {'id': 5} will replace 'id=?' with 'id=5'.
 * @return {string} The URL.
 */
houl.getURL = function(name, params) {
    var url = goog.dom.$('url-list').getAttribute('data-' + name);
    url = goog.string.urlDecode(url);

    if (params != null) {
        for (var key in params) {
            url = url.replace(key + '=?', key + '=' + goog.string.urlEncode(params[key]));
        }
    }

    return url;
}
