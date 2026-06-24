'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        setError('Invalid email or password');
      } else {
        router.push('/dashboard');
        router.refresh();
      }
    } catch (err) {
      setError('An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-sm w-full space-y-10">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tighter">OZL STUDIO</h1>
          <p className="text-muted text-sm font-medium mt-3">Sign in to operations</p>
        </div>

        {error && (
          <div className="p-4 bg-card rounded-2xl text-foreground text-sm text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-3">
            <label className="block text-xs font-bold text-muted uppercase tracking-[0.2em]" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-5 py-4 bg-card rounded-2xl text-foreground placeholder-[#555] outline-none transition-all focus:ring-2 focus:ring-foreground"
              placeholder="admin@onezerolabs.in"
              required
            />
          </div>

          <div className="space-y-3">
            <label className="block text-xs font-bold text-muted uppercase tracking-[0.2em]" htmlFor="password">
              Password
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

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 px-4 bg-foreground text-background font-bold rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-background/30 border-t-background rounded-full animate-spin" />
            ) : (
              'Get Started'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
