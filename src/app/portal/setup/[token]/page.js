'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { use } from 'react';

export default function PortalSetupPage({ params }) {
  const unwrappedParams = use(params);
  const token = unwrappedParams.token;
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/portal/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to set password');
      }

      // Password set successfully, redirect to login
      router.push('/portal/login?setup=success');
      router.refresh();
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-sm w-full space-y-10">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tighter">OZL STUDIO</h1>
          <p className="text-muted text-sm font-medium mt-3">Set up your secure portal password</p>
        </div>

        {error && (
          <div className="p-4 bg-[rgba(255,69,58,0.15)] rounded-2xl text-[#ff453a] text-sm text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-3">
            <label className="block text-xs font-bold text-muted uppercase tracking-[0.2em]" htmlFor="password">
              New Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-5 py-4 bg-card rounded-2xl text-foreground placeholder-[#555] outline-none transition-all focus:ring-2 focus:ring-foreground"
              placeholder="••••••••"
              required
            />
          </div>

          <div className="space-y-3">
            <label className="block text-xs font-bold text-muted uppercase tracking-[0.2em]" htmlFor="confirmPassword">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-5 py-4 bg-card rounded-2xl text-foreground placeholder-[#555] outline-none transition-all focus:ring-2 focus:ring-foreground"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 px-4 bg-foreground text-background font-bold rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-background/30 border-t-background rounded-full animate-spin" />
            ) : (
              'Save Password'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
