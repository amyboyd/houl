goog.provide('houl.EditProfile');

goog.require('houl');
goog.require('houl.templates');
goog.require('goog.dom');
goog.require('goog.events');
goog.require('goog.events.EventType');
goog.require('goog.soy');

/**
 * @constructor
 */
houl.EditProfile = function() {
}

houl.EditProfile.prototype.render = function() {
    houl.globalBuddyList.setAutoUpdating(false);

    var container = houl.getAndActivatePageContainer('edit-profile-page');
    goog.dom.removeChildren(container);

    var template = goog.soy.renderAsElement(houl.templates.editProfile, {
        user: houl.User.currentUser
    });
    goog.dom.appendChild(container, template);

    goog.events.listenOnce(goog.dom.$('password-option'), goog.events.EventType.CLICK, changePassword);
    goog.events.listenOnce(goog.dom.$('facebook-option'), goog.events.EventType.CLICK, linkFacebook);
    goog.events.listenOnce(goog.dom.$('twitter-option'), goog.events.EventType.CLICK, linkTwitter);

    houl.setTopBarText('Profile');
}

/** @private */
function changePassword(clickEvt) {
    var container = /** @type {HTMLElement} */ (clickEvt.currentTarget);
    container.innerHTML += houl.templates.changePassword();

    var form = goog.dom.$('change-password-form');
    var passwordField = goog.dom.$$('input', null, form)[0];
    var passwordConfirmationField = goog.dom.$$('input', null, form)[1];
    var submitButton = goog.dom.$$('button', null, form)[0];

    goog.events.listenOnce(submitButton, [goog.events.EventType.CLICK, goog.events.EventType.KEYPRESS],
        /**
         * When the 'save' button is clicked, disable the button to prevent further clicks,
         * and do an XHR request to save the new password.
         *
         * @param {goog.events.Event} submitEvt
         */
        function(submitEvt) {
            submitEvt.preventDefault();

            var password = goog.dom.forms.getValue(passwordField);
            var passwordConfirmation = goog.dom.forms.getValue(passwordConfirmationField);

            if (password != passwordConfirmation) {
                alert('Please type your new password in both boxes the exact same');
                goog.dom.forms.setValue(passwordField, '');
                goog.dom.forms.setValue(passwordConfirmationField, '');
                passwordField.focus();
                return;
            }

            submitEvt.target.setAttribute('disabled', 'disabled');
            goog.dom.setTextContent(submitButton, 'Saving...');

            var url = houl.getURL('change-password', {
                'password': password
            });
            goog.net.XhrIo.send(url,
                function() {
                    goog.dom.removeChildren(form);
                    goog.dom.setTextContent(form, 'Your new password has been saved.');
                }, 'POST');
        });
}

/** @private */
function linkFacebook() {
    // @todo
}

/** @private */
function linkTwitter() {
    // @todo
}
