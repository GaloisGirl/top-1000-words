# Text-to-Speech (TTS) Browser Support

This application uses the Web Speech API for text-to-speech functionality. This document explains which browsers support this feature.

## ✅ Supported Browsers

### Desktop Browsers
- **Chrome** (version 33+) - Full support
- **Edge** (version 14+) - Full support  
- **Safari** (version 14.1+) - Full support
- **Opera** (version 20+) - Full support
- **Firefox** (version 49+) - Partial support (requires online connection)

### Mobile Browsers
- **Chrome for Android** (version 33+) - Full support
- **Safari for iOS** (version 14.5+) - Full support
- **Samsung Internet** (version 3.0+) - Full support

## ❌ NOT Supported Browsers

### Desktop Browsers
- **Internet Explorer** - No support

### Mobile Browsers
- **DuckDuckGo Browser** (Android/iOS) - No support
- **Opera Mini** - No support
- **Firefox for Android** - Limited/no support
- Many privacy-focused browsers that disable Web APIs

## What Happens in Unsupported Browsers?

When you use this app in a browser that doesn't support TTS:

1. **Visual Warning**: A yellow warning banner appears at the top of the language page
2. **Disabled Speaker Icons**: The speaker (🔊) buttons are grayed out and cannot be clicked
3. **Helpful Message**: The warning explains which browsers support TTS and suggests alternatives

## Why Doesn't DuckDuckGo Support TTS?

DuckDuckGo browser uses WebView (Android) or WKWebView (iOS) engines and intentionally limits certain Web APIs for privacy and security reasons. The Web Speech API is one of the APIs that is either:
- Not exposed to the WebView
- Blocked by DuckDuckGo's privacy features
- Not fully implemented in the underlying WebView

## Alternative Solutions for Unsupported Browsers

If you're using DuckDuckGo or another unsupported browser and want to use TTS:

1. **Switch to a supported browser** like Chrome, Safari, or Edge
2. **Use desktop mode** on mobile (may enable some features)
3. **Use external TTS apps** to read words aloud manually

## Testing Browser Support

The app automatically detects TTS support when the language page loads. You can test your current browser by:

1. Navigate to any language page
2. Look for the yellow warning banner - if you see it, TTS is not supported
3. Try clicking a speaker icon - if it's disabled or shows an alert, TTS is not available

## Technical Details

The app checks for TTS support using:

```javascript
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  // TTS is available
} else {
  // TTS is not available - show warning
}
```

## References

- [MDN Web Speech API Documentation](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API)
- [Can I Use - Speech Synthesis](https://caniuse.com/speech-synthesis)
- [Web Speech API Browser Support](https://caniuse.com/mdn-api_speechsynthesis)
