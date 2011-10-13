package com.houl;

import android.util.Log;
import android.app.Activity;
import android.os.Bundle;
import android.view.KeyEvent;
import android.view.Window;
import android.webkit.WebSettings;
import android.webkit.WebView;

/**
 * This {@link Activity} is the app's entry point, created when the app is run.
 */
public class MainActivity extends Activity {
    /**
     * Defaults to file:///android_asset/index.html
     */
    private static final String HOME_URL = "http://ec2-184-73-68-5.compute-1.amazonaws.com/";

    private WebView webView;

    /** Called when the activity is first created. */
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Remove name of app from the top of the screen.
        requestWindowFeature(Window.FEATURE_NO_TITLE);

        // Use the layout from "res/layout/main.xml".
        setContentView(R.layout.main);

        webView = (WebView) findViewById(R.id.webview);
        webView.setWebChromeClient(new ChromeClient());
        webView.setWebViewClient(new ViewClient());

        // JavaScript is disabled by default in a WebView.
        WebSettings webSettings = webView.getSettings();
        webSettings.setJavaScriptEnabled(true);
        webSettings.setAllowFileAccess(true);

        // Don't allow caching.
        webSettings.setCacheMode(WebSettings.LOAD_NO_CACHE);

        // Finally show URL in the WebView.
        webView.loadUrl(HOME_URL);
        Log.i(MainActivity.class.getCanonicalName(), "Loaded " + HOME_URL);
    }

    /**
     * Back button defaults to closing the application. Make it go back in the WebView's
     * browsing history instead.
     */
    @Override
    public boolean onKeyDown(int keyCode, KeyEvent event) {
        if ((keyCode == KeyEvent.KEYCODE_BACK) && webView.canGoBack()) {
            webView.goBack();
            return true;
        }
        return super.onKeyDown(keyCode, event);
    }
}
