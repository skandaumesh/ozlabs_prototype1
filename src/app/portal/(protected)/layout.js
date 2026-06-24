import dbConnect from '@/lib/mongodb';
import Client from '@/models/Client';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import PortalLayoutClient from './layout-client';

export default async function PortalLayout({ children }) {
  const session = await auth();

  if (!session || session.user.role !== 'client') {
    redirect('/portal/login');
  }

  await dbConnect();

  const client = await Client.findById(session.user.id).lean();

  if (!client) {
    redirect('/portal/login');
  }

  // Pass the client details to the client-side wrapper
  const clientData = {
    id: client._id.toString(),
    name: client.name,
    company: client.company,
    token: client.clientPortalToken
  };

  return (
    <PortalLayoutClient client={clientData}>
      {children}
    </PortalLayoutClient>
  );
}
