'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useNotifications } from '@/hooks/useNotifications';
import { Bell, LayoutDashboard, Users, FolderKanban, Receipt, LogOut } from 'lucide-react';
import { signOut } from 'next-auth/react';

export default function DashboardLayout({ children, user }) {
  const pathname = usePathname();
  const { unreadCount } = useNotifications();

  const navItems = [
    { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Clients', href: '/dashboard/clients', icon: Users },
    { name: 'Projects', href: '/dashboard/projects', icon: FolderKanban },
    { name: 'Invoices', href: '/dashboard/invoices', icon: Receipt },
  ];

  return (
    <div className="flex min-h-screen page-glow">
      {/* Sidebar */}
      <aside className="w-64 glass-nav border-r border-[rgba(255,255,255,0.06)] flex flex-col hidden md:flex sticky top-0 h-screen">
        <div className="p-8 pb-4">
          <h1 className="text-2xl font-serif text-white tracking-[-0.5px]">OZL Studio</h1>
        </div>
        
        <nav className="flex-1 p-4 space-y-1 mt-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center space-x-3 px-4 py-3 rounded-[14px] transition-colors text-sm font-semibold ${
                  isActive ? 'bg-[rgba(255,255,255,0.1)] text-white' : 'text-[rgba(255,255,255,0.55)] hover:text-white hover:bg-[rgba(255,255,255,0.05)]'
                }`}
              >
                <Icon size={18} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
        
        <div className="p-6">
          <div className="flex items-center justify-between glass-elevated px-4 py-3 rounded-[14px]">
            <div className="flex items-center space-x-3 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-[rgba(255,255,255,0.12)] flex items-center justify-center text-white font-bold text-sm">
                {user?.name?.[0]?.toUpperCase() || 'A'}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
                <p className="text-xs text-[rgba(255,255,255,0.55)] truncate">{user?.email}</p>
              </div>
            </div>
            <button onClick={() => signOut()} className="text-[rgba(255,255,255,0.55)] hover:text-white transition-colors p-1" title="Sign out">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 glass-nav border-b border-[rgba(255,255,255,0.06)] flex items-center justify-between px-8 sticky top-0 z-50">
          <div className="flex items-center space-x-4 md:hidden">
            <h1 className="text-xl font-serif text-white tracking-[-0.5px]">OZL Studio</h1>
          </div>
          <div className="hidden md:block" /> {/* Spacer */}
          
          <div className="flex items-center space-x-4">
            <Link href="/dashboard/notifications" className="relative p-2 rounded-full hover:bg-[rgba(255,255,255,0.05)] transition-colors text-[rgba(255,255,255,0.55)] hover:text-white">
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-[#ff453a] rounded-full border-2 border-[#0a0a0f]"></span>
              )}
            </Link>
          </div>
        </header>
        
        <div className="flex-1 overflow-auto p-6 md:p-10 stagger">
          {children}
        </div>
      </main>
    </div>
  );
}
