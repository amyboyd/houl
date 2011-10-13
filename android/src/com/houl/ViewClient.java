package com.houl;

import android.util.Log;
import android.webkit.WebView;
import android.webkit.WebViewClient;

/**
 * Will receive various notifications and requests.
 */
public class ViewClient extends WebViewClient {
    @Override
    public void onReceivedError(WebView view, int errorCode, String description, String failingUrl) {
        Log.e(ViewClient.class.getCanonicalName(), "[ViewClient.onReceivedError] " + description);
    }
}
