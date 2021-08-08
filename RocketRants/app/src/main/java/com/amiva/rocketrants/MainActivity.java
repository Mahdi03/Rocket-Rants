package com.amiva.rocketrants;

import androidx.appcompat.app.AppCompatActivity;

import android.os.Bundle;
import android.webkit.WebSettings;
import android.webkit.WebView;

public class MainActivity extends AppCompatActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        WebView myWebView = (WebView) new WebView(MainActivity.this);
        WebSettings webSettings = myWebView.getSettings();
        webSettings.setJavaScriptEnabled(true);
        //setContentView(R.layout.activity_main);
        setContentView(myWebView);
        myWebView.loadUrl("https://rocket-rants.herokuapp.com/");
    }
}