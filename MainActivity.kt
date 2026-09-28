class MainActivity : AppCompatActivity() {
    private lateinit var webView: WebView

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        WebView.setWebContentsDebuggingEnabled(BuildConfig.DEBUG)

        webView = findViewById(R.id.webView)
        webView.settings.apply {
            javaScriptEnabled = true
            domStorageEnabled = true
            databaseEnabled = true
            loadWithOverviewMode = true
            useWideViewPort = true
            builtInZoomControls = false
            displayZoomControls = false
            setSupportZoom(false)
            mediaPlaybackRequiresUserGesture = false
            cacheMode = WebSettings.LOAD_DEFAULT
            mixedContentMode = WebSettings.MIXED_CONTENT_NEVER_ALLOW
            userAgentString = "$userAgentString KhayalApp/5.0.0"
        }

        webView.setLayerType(View.LAYER_TYPE_HARDWARE, null)
        webView.setOverScrollMode(View.OVER_SCROLL_NEVER)
        webView.isVerticalScrollBarEnabled = false
        webView.setBackgroundColor(Color.WHITE)

        webView.addJavascriptInterface(AndroidBackBridge(), "AndroidBack")
        webView.webViewClient = object : WebViewClient() {
            override fun shouldOverrideUrlLoading(view: WebView?, request: WebResourceRequest?): Boolean {
                val url = request?.url?.toString() ?: return false
                if (url.startsWith("https://khyal-app.vercel.app")) return false
                startActivity(Intent(Intent.ACTION_VIEW, Uri.parse(url)))
                return true
            }
        }
        webView.loadUrl("https://khyal-app.vercel.app/")
    }

    inner class AndroidBackBridge {
        @JavascriptInterface
        fun onRouteChange(hash: String) {
            runOnUiThread {
                if (hash == "#/" || hash == "#") {
                    // Enable back navigation in WebView
                }
            }
        }
    }

    override fun onBackPressed() {
        if (webView.canGoBack()) webView.goBack()
        else super.onBackPressed()
    }
}