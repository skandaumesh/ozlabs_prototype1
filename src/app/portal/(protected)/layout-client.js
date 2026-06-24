'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, FolderKanban, Receipt, LineChart, Image as ImageIcon, Globe } from 'lucide-react';
import { AnimatedLink, PageTransition } from '@/components/ui/Motion';

export default function PortalLayoutClient({ children, client }) {
  const pathname = usePathname();
  const basePath = `/portal`;

  const navItems = [
    { name: 'Overview', href: basePath, icon: LayoutDashboard },
    { name: 'Projects', href: `${basePath}/projects`, icon: FolderKanban },
    { name: 'Invoices', href: `${basePath}/invoices`, icon: Receipt },
    { name: 'Analytics', href: `${basePath}/analytics`, icon: LineChart },
    { name: 'Brand Assets', href: `${basePath}/assets`, icon: ImageIcon },
    { name: 'Website', href: `${basePath}/cms`, icon: Globe },
  ];

  return (
    <div className="flex min-h-screen page-glow bg-[#0a0a0f]">
      {/* Client Sidebar */}
      <aside className="w-64 glass-nav border-r border-[rgba(255,255,255,0.06)] flex flex-col hidden md:flex sticky top-0 h-screen">
        <div className="p-8 pb-4">
          <h1 className="text-2xl font-serif text-white tracking-[-0.5px]">Client Portal</h1>
          <p className="text-[10px] text-[rgba(255,255,255,0.55)] font-bold tracking-[0.2em] mt-2 uppercase">
            {client.company || client.name}
          </p>
        </div>
        
        <nav className="flex-1 p-4 space-y-1 mt-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== basePath && pathname.startsWith(item.href));
            const Icon = item.icon;
            return (
              <AnimatedLink
                key={item.name}
                href={item.href}
                className={`flex items-center space-x-3 px-4 py-3 rounded-[14px] transition-colors text-sm font-semibold w-full ${
                  isActive ? 'bg-[rgba(255,255,255,0.1)] text-white' : 'text-[rgba(255,255,255,0.55)] hover:text-white hover:bg-[rgba(255,255,255,0.05)]'
                }`}
              >
                <Icon size={18} />
                <span>{item.name}</span>
              </AnimatedLink>
            );
          })}
        </nav>
        
        <div className="p-6">
          <div className="flex flex-col space-y-1 px-4 py-3 bg-[rgba(255,255,255,0.03)] rounded-[14px] border border-[rgba(255,255,255,0.06)]">
            <span className="text-xs text-[rgba(255,255,255,0.55)] font-medium">Agency Contact</span>
            <span className="text-sm font-semibold text-white">OZL Studio</span>
            <a href="mailto:hello@onezerolabs.com" className="text-xs text-[#0a84ff] hover:underline mt-1">hello@onezerolabs.com</a>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 glass-nav border-b border-[rgba(255,255,255,0.06)] flex items-center justify-between px-8 sticky top-0 z-50 md:hidden">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-serif text-white tracking-[-0.5px]">Client Portal</h1>
          </div>
        </header>
        
        <div className="flex-1 overflow-auto p-6 pb-28 md:pb-10 md:p-10 stagger">
          <PageTransition className="min-h-full">
            {children}
          </PageTransition>
        </div>
      </main>
      {/* Mobile Bottom Navigation - Authentic iOS Style */}
      <nav 
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex justify-around items-start pt-2 pb-[calc(4px+env(safe-area-inset-bottom))] px-1"
        style={{
          background: 'rgba(28, 28, 30, 0.75)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          borderTop: '0.5px solid rgba(255,255,255,0.15)',
        }}
      >
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== basePath && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <AnimatedLink
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center justify-center w-full transition-colors ${
                isActive ? 'text-white' : 'text-[#8E8E93]'
              }`}
            >
              <div className="mb-[2px]">
                {/* Premium iOS SF Symbol look: thinner stroke, fill when active if possible (lucide doesn't fill well, so we use slightly thicker stroke for active) */}
                <Icon size={26} strokeWidth={isActive ? 2 : 1.5} />
              </div>
              <span className="text-[10px] font-medium leading-none tracking-tight">{item.name}</span>
            </AnimatedLink>
          );
        })}
      </nav>
    </div>
  );
}
