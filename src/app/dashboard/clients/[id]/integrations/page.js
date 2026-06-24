'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { Copy, Check, ExternalLink, BarChart3, Wifi, WifiOff } from 'lucide-react';

export default function ClientIntegrationsPage({ params }) {
  const { id } = use(params);
  const [client, setClient] = useState(null);
  const [instagramUrl, setInstagramUrl] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [trackingData, setTrackingData] = useState(null);
  const [copied, setCopied] = useState(false);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const url = new URL(window.location.href);
    if (url.searchParams.get('connected') === 'true') {
      setConnected(true);
      setTimeout(() => setConnected(false), 3000);
    }
  }, []);

  useEffect(() => {
    Promise.all([
      fetch(`/api/dashboard/clients/${id}`).then(res => res.json()),
      fetch(`/api/dashboard/analytics/${id}/website/tracking-code`).then(res => res.json()),
    ]).then(([clientData, tracking]) => {
      setClient(clientData.client);
      setInstagramUrl(clientData.client.socialProfile?.instagramUrl || '');
      setWebsiteUrl(clientData.client.socialProfile?.websiteUrl || '');
      setTrackingData(tracking);
      setIsLoading(false);
    }).catch(() => setIsLoading(false));
  }, [id]);

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await fetch(`/api/dashboard/clients/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          socialProfile: { instagramUrl, websiteUrl }
        }),
      });
      if (!res.ok) throw new Error('Failed to save');
      // Refresh tracking data
      const tracking = await fetch(`/api/dashboard/analytics/${id}/website/tracking-code`).then(r => r.json());
      setTrackingData(tracking);
      alert('Integrations saved successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to save integrations.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopy = () => {
    if (trackingData?.scriptTag) {
      navigator.clipboard.writeText(trackingData.scriptTag);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (isLoading) return <div className="p-10 text-[rgba(255,255,255,0.55)]">Loading...</div>;

  return (
    <div className="max-w-3xl mx-auto space-y-10 animate-fade pb-20">
      {connected && (
        <div className="glass p-4 flex items-center space-x-3 border-[#30d158]/30 bg-[#30d158]/5">
          <Check size={18} className="text-[#30d158]" />
          <span className="text-sm font-semibold text-[#30d158]">Integration connected successfully!</span>
        </div>
      )}

      <div className="flex items-center space-x-6">
        <Link href={`/dashboard/clients/${id}`} className="text-[rgba(255,255,255,0.55)] hover:text-white transition-colors text-sm font-semibold">
          ← Back to Client
        </Link>
        <h1 className="text-3xl font-bold text-white tracking-tight">Integrations</h1>
      </div>

      <form onSubmit={handleSave} className="glass p-8 md:p-10 space-y-8">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight mb-2">Instagram</h2>
          <p className="text-sm text-[rgba(255,255,255,0.55)] mb-4">Paste the client's Instagram profile URL to activate the analytics dashboard.</p>
          <input
            type="url"
            value={instagramUrl}
            onChange={(e) => setInstagramUrl(e.target.value)}
            placeholder="https://instagram.com/onezerolabs"
            className="w-full px-4 py-3 bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] rounded-xl text-white outline-none focus:border-[rgba(255,255,255,0.2)] transition-colors"
          />
        </div>

        <div className="divider-inset ml-0" />

        <div>
          <h2 className="text-xl font-bold text-white tracking-tight mb-2">Website / Google Analytics</h2>
          <p className="text-sm text-[rgba(255,255,255,0.55)] mb-4">Paste the client's website URL to activate traffic analytics.</p>
          <input
            type="url"
            value={websiteUrl}
            onChange={(e) => setWebsiteUrl(e.target.value)}
            placeholder="https://onezerolabs.com"
            className="w-full px-4 py-3 bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] rounded-xl text-white outline-none focus:border-[rgba(255,255,255,0.2)] transition-colors"
          />
        </div>
        
        <div className="pt-4 flex justify-end">
          <button 
            type="submit"
            disabled={isSaving}
            className="btn-primary disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save Integrations'}
          </button>
        </div>
      </form>

      {/* Website Tracking Code Section */}
      {trackingData?.scriptTag && (
        <div className="glass p-8 md:p-10 space-y-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight mb-2">Website Tracking Code</h2>
              <p className="text-sm text-[rgba(255,255,255,0.55)]">
                Add this script tag to the <code className="text-[#30d158] bg-[rgba(48,209,88,0.1)] px-1.5 py-0.5 rounded text-[13px]">&lt;head&gt;</code> of the client's website.
              </p>
            </div>
            <div className="flex items-center space-x-2">
              {trackingData.isReceivingData ? (
                <span className="badge badge-green flex items-center space-x-1.5">
                  <Wifi size={12} />
                  <span>Receiving Data</span>
                </span>
              ) : (
                <span className="badge badge-yellow flex items-center space-x-1.5">
                  <WifiOff size={12} />
                  <span>No Data Yet</span>
                </span>
              )}
            </div>
          </div>

          <div className="relative">
            <pre className="bg-[rgba(0,0,0,0.4)] rounded-2xl p-5 text-[13px] text-[#30d158] font-mono overflow-x-auto border border-[rgba(255,255,255,0.06)] leading-relaxed">
              {trackingData.scriptTag}
            </pre>
            <button 
              onClick={handleCopy}
              className="absolute top-3 right-3 bg-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.15)] text-white rounded-xl px-3 py-1.5 text-[13px] font-semibold flex items-center space-x-1.5 transition-colors"
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              <span>{copied ? 'Copied!' : 'Copy'}</span>
            </button>
          </div>

          {trackingData.lastDataAt && (
            <p className="text-[13px] text-[rgba(255,255,255,0.4)]">
              Last data received: {new Date(trackingData.lastDataAt).toLocaleString()}
            </p>
          )}

          <div className="flex items-center space-x-4 pt-2">
            <Link 
              href={`/dashboard/clients/${id}/analytics`} 
              className="btn-primary !text-[14px] !px-6 !py-3 flex items-center space-x-2"
            >
              <BarChart3 size={16} />
              <span>View Analytics Dashboard</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
