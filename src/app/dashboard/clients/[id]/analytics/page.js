'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell
} from 'recharts';
import { ArrowLeft, TrendingUp, TrendingDown, Eye, Users, Clock, ArrowUpRight, Globe, Monitor, Smartphone, Tablet, Copy, Check } from 'lucide-react';

const PERIOD_OPTIONS = [
  { label: '7 days', value: '7d' },
  { label: '30 days', value: '30d' },
  { label: '90 days', value: '90d' },
];

const DEVICE_COLORS = {
  desktop: '#0a84ff',
  mobile: '#30d158',
  tablet: '#bf5af2',
};

const DEVICE_ICONS = {
  desktop: Monitor,
  mobile: Smartphone,
  tablet: Tablet,
};

const COUNTRY_FLAGS = {
  IN: '🇮🇳', US: '🇺🇸', GB: '🇬🇧', CA: '🇨🇦', AU: '🇦🇺', DE: '🇩🇪', FR: '🇫🇷',
  JP: '🇯🇵', BR: '🇧🇷', AE: '🇦🇪', SG: '🇸🇬', NL: '🇳🇱', IT: '🇮🇹', ES: '🇪🇸',
  KR: '🇰🇷', SA: '🇸🇦', MX: '🇲🇽', ID: '🇮🇩', RU: '🇷🇺', ZA: '🇿🇦', Unknown: '🌍',
};

const REFERRER_COLORS = ['#0a84ff', '#30d158', '#bf5af2', '#ff9f0a', '#ff453a', '#ffd60a', '#64d2ff', '#ff6482'];

function formatDuration(seconds) {
  if (!seconds) return '0s';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

function formatNumber(num) {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num?.toString() || '0';
}

function StatCard({ label, value, change, icon: Icon, formatFn }) {
  const isPositive = change >= 0;
  const TrendIcon = isPositive ? TrendingUp : TrendingDown;
  const displayValue = formatFn ? formatFn(value) : formatNumber(value);

  return (
    <div className="glass p-6 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-semibold text-[rgba(255,255,255,0.5)] uppercase tracking-wider">{label}</span>
        {Icon && <Icon size={18} className="text-[rgba(255,255,255,0.3)]" />}
      </div>
      <p className="text-3xl font-bold text-white tracking-tight">{displayValue}</p>
      {change !== undefined && change !== null && (
        <div className={`flex items-center space-x-1 text-[13px] font-medium ${isPositive ? 'text-[#30d158]' : 'text-[#ff453a]'}`}>
          <TrendIcon size={14} />
          <span>{isPositive ? '+' : ''}{change}% vs prev period</span>
        </div>
      )}
    </div>
  );
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[rgba(28,28,32,0.95)] backdrop-blur-xl border border-[rgba(255,255,255,0.1)] rounded-2xl px-4 py-3 shadow-2xl">
      <p className="text-[13px] text-[rgba(255,255,255,0.5)] mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-sm font-semibold" style={{ color: p.color }}>
          {p.name}: {formatNumber(p.value)}
        </p>
      ))}
    </div>
  );
}

export default function WebsiteAnalyticsPage({ params }) {
  const { id } = use(params);
  const [data, setData] = useState(null);
  const [period, setPeriod] = useState('30d');
  const [isLoading, setIsLoading] = useState(true);
  const [trackingCode, setTrackingCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [client, setClient] = useState(null);

  useEffect(() => {
    setIsLoading(true);
    Promise.all([
      fetch(`/api/dashboard/analytics/${id}/website?period=${period}`).then(r => r.json()),
      fetch(`/api/dashboard/clients/${id}`).then(r => r.json()),
    ]).then(([analyticsData, clientData]) => {
      setData(analyticsData);
      setClient(clientData.client);
      if (analyticsData.hasTracking) {
        // We need the API key from the CMS setup
        fetch(`/api/dashboard/clients/${id}`).then(r => r.json());
      }
      setIsLoading(false);
    }).catch(() => setIsLoading(false));
  }, [id, period]);

  // Fetch tracking code
  useEffect(() => {
    fetch(`/api/dashboard/analytics/${id}/website/tracking-code`)
      .then(r => r.json())
      .then(d => {
        if (d.scriptTag) setTrackingCode(d.scriptTag);
      })
      .catch(() => {});
  }, [id]);

  const handleCopy = () => {
    navigator.clipboard.writeText(trackingCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <div className="w-10 h-10 border-2 border-[rgba(255,255,255,0.1)] border-t-[#0a84ff] rounded-full animate-spin mx-auto" />
          <p className="text-[rgba(255,255,255,0.55)] text-sm font-semibold">Loading analytics...</p>
        </div>
      </div>
    );
  }

  const hasData = data && data.overview && data.overview.pageViews > 0;

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center space-x-6">
          <Link href={`/dashboard/clients/${id}`} className="text-[rgba(255,255,255,0.55)] hover:text-white transition-colors text-sm font-semibold">
            <ArrowLeft size={18} className="inline mr-1" />
            Back
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Website Analytics</h1>
            {client && (
              <p className="text-sm text-[rgba(255,255,255,0.5)] mt-1">{client.company || client.name}</p>
            )}
          </div>
        </div>

        {/* Period Selector */}
        <div className="flex space-x-1 bg-[rgba(255,255,255,0.06)] rounded-2xl p-1">
          {PERIOD_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => setPeriod(opt.value)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                period === opt.value 
                  ? 'bg-white text-black' 
                  : 'text-[rgba(255,255,255,0.55)] hover:text-white'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tracking Code Section (shown when no data or always available) */}
      {trackingCode && (
        <div className={`glass p-6 ${hasData ? 'opacity-60 hover:opacity-100 transition-opacity' : ''}`}>
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="text-sm font-bold text-white">Tracking Code</h3>
              <p className="text-[13px] text-[rgba(255,255,255,0.5)] mt-1">
                {hasData ? 'Tracking is active. Paste this on any additional client pages.' : 'Paste this script tag in the <head> of the client\'s website to start tracking.'}
              </p>
            </div>
            <button onClick={handleCopy} className="btn-secondary !px-4 !py-2 !text-[13px] flex items-center gap-2">
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <pre className="bg-[rgba(0,0,0,0.4)] rounded-xl p-4 text-[13px] text-[#30d158] font-mono overflow-x-auto border border-[rgba(255,255,255,0.06)]">
            {trackingCode}
          </pre>
        </div>
      )}

      {!hasData ? (
        /* Empty State */
        <div className="glass p-16 text-center space-y-4">
          <div className="w-16 h-16 bg-[#0a84ff]/10 rounded-3xl flex items-center justify-center mx-auto border border-[#0a84ff]/20">
            <Globe size={32} className="text-[#0a84ff]" />
          </div>
          <h2 className="text-xl font-bold text-white">No data yet</h2>
          <p className="text-sm text-[rgba(255,255,255,0.55)] max-w-md mx-auto">
            {trackingCode 
              ? 'Add the tracking code above to your client\'s website. Data will appear within minutes of the first visit.'
              : 'Set up a website URL in the Integrations page to generate a tracking code.'}
          </p>
          {!trackingCode && (
            <Link href={`/dashboard/clients/${id}/integrations`} className="btn-primary !inline-flex mt-4">
              Set Up Tracking
            </Link>
          )}
        </div>
      ) : (
        /* Analytics Dashboard */
        <div className="space-y-8 stagger">
          {/* Overview Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Page Views" value={data.overview.pageViews} change={data.overview.pageViewsChange} icon={Eye} />
            <StatCard label="Unique Visitors" value={data.overview.uniqueVisitors} change={data.overview.uniqueVisitorsChange} icon={Users} />
            <StatCard label="Avg Duration" value={data.overview.avgDuration} change={data.overview.avgDurationChange} icon={Clock} formatFn={formatDuration} />
            <StatCard label="Bounce Rate" value={data.overview.bounceRate} change={data.overview.bounceRateChange} icon={ArrowUpRight} formatFn={v => v + '%'} />
          </div>

          {/* Views Over Time Chart */}
          <div className="glass p-6 md:p-8">
            <h3 className="text-lg font-bold text-white mb-6">Views Over Time</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.dailyViews}>
                  <defs>
                    <linearGradient id="viewsGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#0a84ff" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#0a84ff" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="visitorsGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#30d158" stopOpacity={0.2} />
                      <stop offset="100%" stopColor="#30d158" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis 
                    dataKey="date" 
                    stroke="rgba(255,255,255,0.3)" 
                    fontSize={12}
                    tickFormatter={v => { const d = new Date(v); return `${d.getDate()}/${d.getMonth()+1}`; }}
                  />
                  <YAxis stroke="rgba(255,255,255,0.3)" fontSize={12} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="views" name="Views" stroke="#0a84ff" strokeWidth={2} fill="url(#viewsGradient)" />
                  <Area type="monotone" dataKey="visitors" name="Visitors" stroke="#30d158" strokeWidth={2} fill="url(#visitorsGradient)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Top Pages */}
            <div className="glass p-6 md:p-8">
              <h3 className="text-lg font-bold text-white mb-6">Top Pages</h3>
              <div className="space-y-3">
                {data.topPages?.map((page, i) => {
                  const maxViews = data.topPages[0]?.views || 1;
                  const pct = Math.round((page.views / maxViews) * 100);
                  return (
                    <div key={i} className="relative">
                      <div 
                        className="absolute inset-0 rounded-xl bg-[#0a84ff]/10" 
                        style={{ width: `${pct}%` }} 
                      />
                      <div className="relative flex items-center justify-between px-4 py-3">
                        <span className="text-sm font-medium text-white truncate mr-4">{page.page}</span>
                        <div className="flex items-center space-x-3 shrink-0">
                          <span className="text-sm font-semibold text-white">{formatNumber(page.views)}</span>
                          <span className="text-[12px] text-[rgba(255,255,255,0.4)]">{page.visitors} visitors</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {(!data.topPages || data.topPages.length === 0) && (
                  <p className="text-sm text-[rgba(255,255,255,0.4)] text-center py-4">No page data yet</p>
                )}
              </div>
            </div>

            {/* Traffic Sources */}
            <div className="glass p-6 md:p-8">
              <h3 className="text-lg font-bold text-white mb-6">Traffic Sources</h3>
              <div className="space-y-3">
                {data.referrerSources?.map((source, i) => {
                  const maxViews = data.referrerSources[0]?.views || 1;
                  const pct = Math.round((source.views / maxViews) * 100);
                  return (
                    <div key={i} className="relative">
                      <div 
                        className="absolute inset-0 rounded-xl"
                        style={{ 
                          width: `${pct}%`, 
                          backgroundColor: `${REFERRER_COLORS[i % REFERRER_COLORS.length]}15` 
                        }} 
                      />
                      <div className="relative flex items-center justify-between px-4 py-3">
                        <span className="text-sm font-medium text-white">{source.source}</span>
                        <span className="text-sm font-semibold text-white">{formatNumber(source.views)}</span>
                      </div>
                    </div>
                  );
                })}
                {(!data.referrerSources || data.referrerSources.length === 0) && (
                  <p className="text-sm text-[rgba(255,255,255,0.4)] text-center py-4">No referrer data yet</p>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Devices */}
            <div className="glass p-6 md:p-8">
              <h3 className="text-lg font-bold text-white mb-6">Devices</h3>
              {data.deviceBreakdown?.length > 0 ? (
                <div className="space-y-4">
                  <div className="h-[180px] flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={data.deviceBreakdown}
                          cx="50%" cy="50%"
                          innerRadius={55} outerRadius={80}
                          dataKey="count"
                          nameKey="device"
                          strokeWidth={0}
                        >
                          {data.deviceBreakdown.map((entry, i) => (
                            <Cell key={i} fill={DEVICE_COLORS[entry.device] || '#666'} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-2">
                    {data.deviceBreakdown.map((d, i) => {
                      const total = data.deviceBreakdown.reduce((s, x) => s + x.count, 0);
                      const pct = Math.round((d.count / total) * 100);
                      const DeviceIcon = DEVICE_ICONS[d.device] || Monitor;
                      return (
                        <div key={i} className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <DeviceIcon size={14} style={{ color: DEVICE_COLORS[d.device] }} />
                            <span className="text-sm text-white capitalize">{d.device}</span>
                          </div>
                          <span className="text-sm font-semibold text-[rgba(255,255,255,0.7)]">{pct}%</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-[rgba(255,255,255,0.4)] text-center py-4">No device data</p>
              )}
            </div>

            {/* Browsers */}
            <div className="glass p-6 md:p-8">
              <h3 className="text-lg font-bold text-white mb-6">Browsers</h3>
              <div className="space-y-3">
                {data.browserBreakdown?.map((b, i) => {
                  const total = data.browserBreakdown.reduce((s, x) => s + x.count, 0);
                  const pct = Math.round((b.count / total) * 100);
                  return (
                    <div key={i} className="flex items-center justify-between">
                      <span className="text-sm text-white">{b.browser}</span>
                      <div className="flex items-center space-x-3">
                        <div className="w-24 h-1.5 rounded-full bg-[rgba(255,255,255,0.1)] overflow-hidden">
                          <div 
                            className="h-full rounded-full bg-[#0a84ff] transition-all duration-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-sm font-semibold text-[rgba(255,255,255,0.7)] w-10 text-right">{pct}%</span>
                      </div>
                    </div>
                  );
                })}
                {(!data.browserBreakdown || data.browserBreakdown.length === 0) && (
                  <p className="text-sm text-[rgba(255,255,255,0.4)] text-center py-4">No browser data</p>
                )}
              </div>
            </div>

            {/* Countries */}
            <div className="glass p-6 md:p-8">
              <h3 className="text-lg font-bold text-white mb-6">Countries</h3>
              <div className="space-y-3">
                {data.countryBreakdown?.map((c, i) => {
                  const total = data.countryBreakdown.reduce((s, x) => s + x.count, 0);
                  const pct = Math.round((c.count / total) * 100);
                  return (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-base">{COUNTRY_FLAGS[c.country] || '🌍'}</span>
                        <span className="text-sm text-white">{c.country}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="text-sm font-semibold text-[rgba(255,255,255,0.7)]">{pct}%</span>
                        <span className="text-[12px] text-[rgba(255,255,255,0.4)]">{formatNumber(c.count)}</span>
                      </div>
                    </div>
                  );
                })}
                {(!data.countryBreakdown || data.countryBreakdown.length === 0) && (
                  <p className="text-sm text-[rgba(255,255,255,0.4)] text-center py-4">No country data</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
