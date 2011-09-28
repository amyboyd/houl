goog.provide('houl.pages');

goog.require('houl');
goog.require('houl.globals');
goog.require('houl.BuddyList');
goog.require('houl.Options');
goog.require('goog.dom');
goog.require('goog.events');
goog.require('goog.events.EventType');

houl.pages.index = function() {
    houl.globals.buddyList = new houl.BuddyList(houl.getAndActivatePageContainer('index-page'));
    houl.globals.buddyList.update();
    
    // Hook up the bottom buttons.
    goog.events.listen(goog.dom.$('bottom-buttons-options'), goog.events.EventType.CLICK,
        /** @param {goog.events.BrowserEvent} */
        function(evt) {
            evt.preventDefault();
            var options = new houl.Options();
            options.render();
        });
}

goog.exportSymbol('houl.pages.index', houl.pages.index);
