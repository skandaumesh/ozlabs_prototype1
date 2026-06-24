import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import WebsiteContent from '@/models/WebsiteContent';
import PageView from '@/models/PageView';

/**
 * Parses a User-Agent string to extract browser, OS, and device type.
 * Lightweight — no external dependency needed.
 */
function parseUserAgent(ua = '') {
  const lowerUA = ua.toLowerCase();

  // Browser detection
  let browser = 'Other';
  if (lowerUA.includes('edg/')) browser = 'Edge';
  else if (lowerUA.includes('opr/') || lowerUA.includes('opera')) browser = 'Opera';
  else if (lowerUA.includes('chrome') && !lowerUA.includes('edg')) browser = 'Chrome';
  else if (lowerUA.includes('safari') && !lowerUA.includes('chrome')) browser = 'Safari';
  else if (lowerUA.includes('firefox')) browser = 'Firefox';
  else if (lowerUA.includes('msie') || lowerUA.includes('trident')) browser = 'IE';

  // OS detection
  let os = 'Other';
  if (lowerUA.includes('windows')) os = 'Windows';
  else if (lowerUA.includes('mac os') || lowerUA.includes('macintosh')) os = 'macOS';
  else if (lowerUA.includes('android')) os = 'Android';
  else if (lowerUA.includes('iphone') || lowerUA.includes('ipad')) os = 'iOS';
  else if (lowerUA.includes('linux')) os = 'Linux';
  else if (lowerUA.includes('cros')) os = 'ChromeOS';

  // Device detection
  let device = 'desktop';
  if (lowerUA.includes('mobile') || lowerUA.includes('iphone') || lowerUA.includes('android')) {
    device = 'mobile';
  } else if (lowerUA.includes('ipad') || lowerUA.includes('tablet')) {
    device = 'tablet';
  }

  return { browser, os, device };
}

/**
 * Cleans and normalizes a referrer URL to a human-readable source.
 */
function parseReferrer(ref = '') {
  if (!ref || ref === '') return 'Direct';
  try {
    const url = new URL(ref);
    const host = url.hostname.replace('www.', '');
    // Map common referrers
    if (host.includes('google')) return 'Google';
    if (host.includes('bing')) return 'Bing';
    if (host.includes('yahoo')) return 'Yahoo';
    if (host.includes('duckduckgo')) return 'DuckDuckGo';
    if (host.includes('facebook') || host.includes('fb.com')) return 'Facebook';
    if (host.includes('instagram')) return 'Instagram';
    if (host.includes('twitter') || host.includes('x.com')) return 'X (Twitter)';
    if (host.includes('linkedin')) return 'LinkedIn';
    if (host.includes('youtube')) return 'YouTube';
    if (host.includes('reddit')) return 'Reddit';
    if (host.includes('pinterest')) return 'Pinterest';
    if (host.includes('t.co')) return 'X (Twitter)';
    return host; // Return the clean domain
  } catch {
    return ref;
  }
}

/**
 * POST /api/v1/track
 * 
 * Public endpoint — receives page view events from the tracking script.
 * No auth required, identified by API key.
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { key, sid, url, ref, sw, lang, dur } = body;

    if (!key || !sid) {
      return new Response(null, { status: 400 });
    }

    await dbConnect();

    // Find the client by API key
    const content = await WebsiteContent.findOne({ apiKey: key }).select('clientId').lean();
    if (!content) {
      return new Response(null, { status: 404 });
    }

    // Parse the page URL
    let hostname = '';
    let pathname = '/';
    try {
      const parsed = new URL(url);
      hostname = parsed.hostname;
      pathname = parsed.pathname || '/';
    } catch {
      pathname = url || '/';
    }

    // Parse User-Agent
    const userAgent = request.headers.get('user-agent') || '';
    const { browser, os, device } = parseUserAgent(userAgent);

    // Get country from Vercel headers (free geo on Vercel)
    const country = request.headers.get('x-vercel-ip-country') || 
                    request.headers.get('cf-ipcountry') || // Cloudflare fallback
                    'Unknown';

    // If this is a duration update (page exit), update existing record
    if (dur && dur > 0) {
      await PageView.findOneAndUpdate(
        { clientId: content.clientId, sessionId: sid, pathname, duration: 0 },
        { $set: { duration: Math.min(dur, 1800) } }, // Cap at 30 min
        { sort: { timestamp: -1 } }
      );
      return new Response(null, { status: 204 });
    }

    // Create page view
    await PageView.create({
      clientId: content.clientId,
      sessionId: sid,
      hostname,
      pathname,
      referrer: parseReferrer(ref),
      browser,
      os,
      device,
      country,
      screenWidth: sw || 0,
      language: lang || '',
    });

    return new Response(null, { status: 204 });
  } catch (error) {
    console.error('Tracking error:', error);
    return new Response(null, { status: 500 });
  }
}

/**
 * OPTIONS handler for CORS preflight
 */
export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
