goog.provide("houl.Options");

goog.require("houl");
goog.require("houl.templates");
goog.require("houl.EditProfile");
goog.require("goog.dom");
goog.require("goog.dom.forms");
goog.require("goog.events");
goog.require("goog.events.EventType");
goog.require("goog.net.XhrIo");
goog.require("goog.ui.Textarea");

/**
 * @constructor
 */
houl.Options = function() {
}

houl.Options.prototype.render = function() {
    houl.globalBuddyList.setAutoUpdating(false);

    var container = houl.getAndActivatePageContainer('options-page');
    goog.dom.removeChildren(container);

    var template = goog.dom.createDom('div');
    template.innerHTML = houl.templates.options({
        user: houl.User.currentUser
    });
    goog.dom.appendChild(container, template);

    goog.events.listenOnce(goog.dom.$('profile-option'), goog.events.EventType.CLICK, editProfile);
    goog.events.listenOnce(goog.dom.$('feedback-option'), goog.events.EventType.CLICK, feedback);
    goog.events.listenOnce(goog.dom.$('logout-option'), goog.events.EventType.CLICK, logout);

    houl.setTopBarText('Options');
}

/** @private */
function editProfile() {
    new houl.EditProfile().render();
}

/** @private */
function feedback(clickEvt) {
    var container = /** @type {HTMLElement} */ (clickEvt.currentTarget);
    container.innerHTML += houl.templates.sendFeedback();

    var form = goog.dom.$('send-feedback-form');

    var textarea = goog.dom.$$('textarea', null, form)[0];
    new goog.ui.Textarea().decorate(textarea);

    var submit = goog.dom.$$('button', null, form)[0];
    goog.events.listenOnce(submit, [goog.events.EventType.CLICK, goog.events.EventType.KEYPRESS],
        /**
         * When the "send" button is clicked, disable the button to prevent further clicks,
         * and do an XHR request to send the feedback message.
         *
         * @param {goog.events.Event} submitEvt
         */
        function(submitEvt) {
            submitEvt.preventDefault();

            submitEvt.target.setAttribute('disabled', 'disabled');
            goog.dom.setTextContent(submit, 'Sending...');

            var url = houl.getURL('send-feedback', {
                'message': goog.dom.forms.getValue(textarea)
            });
            goog.net.XhrIo.send(url,
                function() {
                    goog.dom.removeChildren(form);
                    goog.dom.setTextContent(form, 'Thanks for your feedback!');
                });
        });
}

/** @private */
function logout() {
    window.location = houl.getURL('logout');
}
