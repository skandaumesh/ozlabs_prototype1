import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import DashboardLayoutClient from './layout-client';

export default async function DashboardLayout({ children }) {
  const session = await auth();
  
  if (!session?.user) {
    redirect('/login');
  }

  return (
    <DashboardLayoutClient user={session.user}>
      {children}
    </DashboardLayoutClient>
  );
}
