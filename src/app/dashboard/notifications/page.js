'use client';

import { useNotifications } from '@/hooks/useNotifications';
import Link from 'next/link';
import { Bell, CheckCircle2 } from 'lucide-react';
import { AnimatedNotification } from '@/components/ui/Motion';

export default function NotificationsPage() {
  const { notifications, loading, error, markAsRead } = useNotifications();

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto space-y-8 animate-fade pb-20">
        <h1 className="text-3xl font-serif text-white tracking-[-0.5px]">Notifications</h1>
        <div className="p-12 text-center text-[rgba(255,255,255,0.55)] font-semibold">Loading notifications...</div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fade pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h1 className="text-3xl font-serif text-white tracking-[-0.5px]">Notifications</h1>
        </div>
      </div>

      <div className="glass overflow-hidden">
        {error ? (
          <div className="p-8 text-center text-[#ff453a]">{error}</div>
        ) : notifications.length === 0 ? (
          <div className="p-16 text-center text-[rgba(255,255,255,0.55)] flex flex-col items-center">
            <Bell size={32} className="mb-4 opacity-50" />
            <p className="font-semibold">You're all caught up!</p>
            <p className="text-sm mt-1">No new notifications.</p>
          </div>
        ) : (
          <ul className="flex flex-col">
            {notifications.map((notification, index) => {
              // Determine border accent color based on type
              let accentClass = '';
              if (!notification.read) {
                switch(notification.type) {
                  case 'review':
                  case 'comment':
                    accentClass = 'border-l-2 border-[#30d158]';
                    break;
                  case 'approval':
                    accentClass = 'border-l-2 border-[#0a84ff]';
                    break;
                  case 'invoice':
                    accentClass = 'border-l-2 border-[#ff9f0a]';
                    break;
                  default:
                    accentClass = 'border-l-2 border-white';
                }
              }

              return (
                <AnimatedNotification key={notification._id} className={`${index !== 0 ? 'divider-inset' : ''} p-5 hover:bg-[rgba(255,255,255,0.02)] transition-colors group relative ${accentClass}`}>
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        {!notification.read && <span className="w-2 h-2 rounded-full bg-[#0a84ff]" />}
                        <h3 className={`font-semibold text-[15px] ${notification.read ? 'text-[rgba(255,255,255,0.7)]' : 'text-white'}`}>
                          {notification.title}
                        </h3>
                      </div>
                      <p className="text-[13px] text-[rgba(255,255,255,0.4)] mt-1">
                        {new Date(notification.createdAt).toLocaleString()}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-3 shrink-0">
                      {!notification.read && (
                        <button 
                          onClick={() => markAsRead(notification._id)}
                          className="p-2 rounded-full hover:bg-[rgba(255,255,255,0.1)] text-[rgba(255,255,255,0.55)] hover:text-white transition-colors"
                          title="Mark as read"
                        >
                          <CheckCircle2 size={18} />
                        </button>
                      )}
                      
                      {notification.link && (
                        <Link 
                          href={notification.link}
                          className="btn-secondary py-2 px-4 text-xs"
                        >
                          View
                        </Link>
                      )}
                    </div>
                  </div>
                </AnimatedNotification>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
