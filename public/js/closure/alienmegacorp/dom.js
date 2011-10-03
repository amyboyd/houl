goog.provide('alienmegacorp.dom');

goog.require('goog.dom');
goog.require('goog.string');

/**
 * @param {HTMLElement} element
 */
alienmegacorp.dom.executeScriptsInElement = function(element) {
    var scripts = goog.dom.$$('script', null, element);
    for (var i = 0; i < scripts.length; i++) {
        // Templating <script>s might have type='text/html'. Only execute if the type is JS or null.
        var script = /** @type {HTMLScriptElement} */ scripts[i];
        var type = script.getAttribute('type');

        if (type == null || goog.string.endsWith(type, 'javascript')) {
            eval(script.textContent);
        }
    }
}
