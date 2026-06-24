'use client';

import { PageTransition } from '@/components/ui/Motion';

export default function DashboardTemplate({ children }) {
  return (
    <PageTransition className="min-h-full">
      {children}
    </PageTransition>
  );
}
