package com.houl;

import android.app.AlertDialog;
import android.util.Log;
import android.webkit.JsResult;
import android.webkit.WebChromeClient;
import android.webkit.WebView;

/**
 * Override some default behaviour of {@link WebChromeClient}.
 */
public class ChromeClient extends WebChromeClient {
    /**
     * {@link WebChromeClient} discards JavaScript alerts by default. Show them.
     */
    @Override
    public boolean onJsAlert(WebView view, String url, String message, JsResult result) {
        Log.i(ChromeClient.class.getCanonicalName(), "[JS alert] " + message);
        new AlertDialog.Builder(view.getContext()).setMessage(message).
                setCancelable(true).
                show();
        result.confirm();
        return true;
    }
}
