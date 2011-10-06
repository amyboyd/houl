goog.provide('houl.Emoticons');

goog.require('houl');
goog.require('houl.templates');
goog.require('goog.dom');
goog.require('goog.events');
goog.require('goog.events.EventType');
goog.require('goog.soy');

/** @const @private */
houl.Emoticons.map = {
    ':)' : 1,
    ':@': 2,
    ":'(": 3,
    ':D': 4,
    ':(': 5,
    ":')": 6,
    ":P": 7
};

houl.Emoticons.insertEmoticonImages = function(message) {
    var emoticonsDir = houl.getURL('emoticons-dir');
    for (var smiley in houl.Emoticons.map) {
        var imageNumber = houl.Emoticons.map[smiley];
        message = message.replace(smiley, '<img src="' + emoticonsDir + '/' + imageNumber + '.png" alt="' + smiley + '" width="16" height="16" />', 'gm');
    }
    return message;
}

houl.Emoticons.renderChooser = function() {
    // If the chooser is already in the page, we don't need to do anything.
    var existing = goog.dom.$('emoticon-chooser');
    if (existing != null) {
        return;
    }

    var chooser = goog.soy.renderAsElement(houl.templates.emoticonChooser, {
        emoticons: houl.Emoticons.map
    });
    goog.dom.appendChild(goog.dom.$('chat-room-page'), chooser);

    // Listen for clicks on the icons.
    var icons = goog.dom.$$('img', null, chooser);
    for (var i = 0; i < icons.length; i++) {
        goog.events.listen(icons[i], goog.events.EventType.CLICK, onIconClicked);
    }
}

houl.Emoticons.closeChooser = function() {
    var chooser = goog.dom.$('emoticon-chooser');
    if (chooser != null) {
        goog.dom.removeNode(chooser);
    }
}

function onIconClicked(evt) {
    var icon = /** @type {HTMLImageElement} */ (evt.target);
    var emoticonText = icon.getAttribute('alt');
    var messageField = goog.dom.$$(null, 'chat-room-new-message-field', document.body)[0];
    messageField.value += ' ' + emoticonText;
    houl.Emoticons.closeChooser();
}
