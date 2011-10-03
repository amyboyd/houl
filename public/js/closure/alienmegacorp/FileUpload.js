goog.provide('alienmegacorp.FileUpload');

goog.require('goog.uri.utils');

/**
 * @constructor
 * @param {string} file
 * @param {string} url The URL to POST the file to.
 * @param {function} complete Called with xhr as param.
 * @param {?function} progressChanged Called with progress percent as param.
 * @param {?function} validator Called with 'file' param as param. Must return a boolean.
 */
alienmegacorp.FileUpload = function(file, url, complete, progressChanged, validator) {
    if (typeof validator === 'function') {
        if (!validator(file)) {
            return;
        }
    }

    var fileName = (typeof file.name !== 'undefined' ? file.name :
            (typeof file.fileName !== 'undefined' ? file.fileName :
            undefined));

    if (goog.DEBUG) console.log('Uploading ' + fileName + ' to ' + url, file);

    var xhr = new XMLHttpRequest();
    this.xhr = xhr;

    // Progress updater.
    xhr.upload.addEventListener('progress', function(evt)
    {
        if (evt.lengthComputable && typeof progressChanged === 'function')
        {
            var percentage = Math.round((evt.loaded * 100) / evt.total);
            progressChanged(percentage);
        }
    }, false);

    // When XHR is complete.
    xhr.onreadystatechange = function(event)
    {
        if (event.target.readyState == 4)
        {
            complete(xhr);
        }
    };

    xhr.open('POST', goog.uri.utils.setParam(url, 'filename', fileName), true);
    xhr.overrideMimeType('text/plain; charset=x-user-defined-binary');

    var reader = new FileReader();
    reader.onload = function()
    {
        xhr.send(file);
    };
    reader.readAsBinaryString(file);
}
