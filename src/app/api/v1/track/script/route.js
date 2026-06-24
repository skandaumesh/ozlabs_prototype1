import { NextResponse } from 'next/server';

/**
 * GET /api/v1/track/script?key=<API_KEY>
 * 
 * Serves the lightweight tracking JavaScript snippet.
 * Client websites embed: <script defer src="https://yourapp.com/api/v1/track/script?key=CLIENT_KEY"></script>
 * 
 * The script is ~1KB minified, no cookies, privacy-friendly.
 */
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const key = searchParams.get('key');

  if (!key) {
    return new Response('// Missing API key', { 
      status: 400, 
      headers: { 'Content-Type': 'application/javascript' } 
    });
  }

  // Determine the tracking endpoint base URL from the request
  const origin = request.headers.get('x-forwarded-host') 
    ? `https://${request.headers.get('x-forwarded-host')}`
    : new URL(request.url).origin;

  const script = `
(function() {
  "use strict";
  var KEY = "${key}";
  var ENDPOINT = "${origin}/api/v1/track";
  var sid = sessionStorage.getItem("_ozl_sid");
  if (!sid) {
    sid = Math.random().toString(36).substring(2) + Date.now().toString(36);
    sessionStorage.setItem("_ozl_sid", sid);
  }

  var start = Date.now();
  var sent = false;

  function send(dur) {
    var data = {
      key: KEY,
      sid: sid,
      url: location.href,
      ref: document.referrer,
      sw: screen.width,
      lang: navigator.language,
      dur: dur || 0
    };
    if (navigator.sendBeacon) {
      navigator.sendBeacon(ENDPOINT, JSON.stringify(data));
    } else {
      var x = new XMLHttpRequest();
      x.open("POST", ENDPOINT, true);
      x.setRequestHeader("Content-Type", "application/json");
      x.send(JSON.stringify(data));
    }
  }

  // Send initial page view
  send(0);

  // Send duration on page exit
  function onLeave() {
    if (sent) return;
    sent = true;
    var dur = Math.round((Date.now() - start) / 1000);
    if (dur > 0) send(dur);
  }

  document.addEventListener("visibilitychange", function() {
    if (document.visibilityState === "hidden") onLeave();
  });
  window.addEventListener("beforeunload", onLeave);

  // SPA support — track route changes
  var pushState = history.pushState;
  history.pushState = function() {
    pushState.apply(history, arguments);
    setTimeout(function() {
      start = Date.now();
      sent = false;
      send(0);
    }, 100);
  };
  window.addEventListener("popstate", function() {
    start = Date.now();
    sent = false;
    send(0);
  });
})();
`.trim();

  return new Response(script, {
    status: 200,
    headers: {
      'Content-Type': 'application/javascript',
      'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      'Access-Control-Allow-Origin': '*',
    },
  });
}
