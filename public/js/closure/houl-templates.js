// This file was automatically generated from houl.soy.
// Please don't edit this file by hand.

goog.provide('houl.templates');

goog.require('soy');


houl.templates.buddy = function(opt_data) {
  return '<div class="buddy ' + ((opt_data.buddy.isRequest) ? ' request-type ' : (opt_data.buddy.isOpenChat) ? ' open-chat-type ' : ' other-type ') + '"><img src="' + soy.$$escapeHtml(opt_data.buddy.imageURL) + '" alt="" width="48" height="48" /><div class="buddyTypeAndTime">' + ((opt_data.buddy.isRequest) ? houl.templates.buddyTypeAndTime({type: 'request', time: opt_data.buddy.requestedAt}) : (opt_data.buddy.isOpenChat) ? houl.templates.buddyTypeAndTime({type: 'message', time: opt_data.buddy.lastChatAt}) : (opt_data.buddy.lastChatAt != null) ? houl.templates.buddyTypeAndTime({type: 'message', time: opt_data.buddy.lastChatAt}) : houl.templates.buddyTypeAndTime({type: 'added', time: opt_data.buddy.acceptedAt})) + '</div><h2 class="buddy-name"><a href="' + soy.$$escapeHtml(opt_data.buddy.url) + '">' + soy.$$escapeHtml(opt_data.buddy.name) + '</a></h2><div style="clear: right;"></div>' + ((opt_data.buddy.isRequest) ? houl.templates.buddyMessage({text: opt_data.buddy.requestMessage}) : (opt_data.buddy.lastChatMessage) ? houl.templates.buddyMessage({text: opt_data.buddy.lastChatMessage}) : (opt_data.buddy.status) ? houl.templates.buddyMessage({prependHTML: '<em>Status:</em> ', text: opt_data.buddy.status}) : '') + '</div>';
};


houl.templates.buddyTypeAndTime = function(opt_data) {
  return '<strong>' + soy.$$escapeHtml(opt_data.type) + '</strong><br />' + ((opt_data.time) ? ' ' + soy.$$escapeHtml(opt_data.time) + ' ' : ' just now ');
};


houl.templates.buddyMessage = function(opt_data) {
  return '<div class="buddy-message"><span class="quote">&OpenCurlyDoubleQuote;</span>' + ((opt_data.prependHTML) ? ' ' + opt_data.prependHTML + ' ' : '') + soy.$$escapeHtml(soy.$$insertWordBreaks(opt_data.text, 5)) + '<span class="quote">&CloseCurlyDoubleQuote;</span></div>';
};

