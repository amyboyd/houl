goog.provide('houl.pages');

goog.require('houl');
goog.require('houl.globals');
goog.require('houl.BuddyList');

houl.pages.index = function() {
    houl.globals.buddyList = new houl.BuddyList(houl.getAndActivatePageContainer('index-page'));
    houl.globals.buddyList.update();
}

goog.exportSymbol('houl.pages.index', houl.pages.index);
