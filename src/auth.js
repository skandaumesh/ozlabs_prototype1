import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import dbConnect from './lib/mongodb';
import Admin from './models/Admin';
import Client from './models/Client';

import { authConfig } from './auth.config';

export const { handlers: { GET, POST }, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        
        await dbConnect();
        
        const admin = await Admin.findOne({ email: credentials.email });
        
        if (admin) {
          const isPasswordValid = await bcrypt.compare(credentials.password, admin.password);
          if (isPasswordValid) {
            return { id: admin._id.toString(), name: admin.name, email: admin.email, role: admin.role };
          }
        }
        
        // If not admin, check client
        const client = await Client.findOne({ email: credentials.email });
        if (client && client.password) {
          const isPasswordValid = await bcrypt.compare(credentials.password, client.password);
          if (isPasswordValid) {
            return { id: client._id.toString(), name: client.name, email: client.email, role: 'client' };
          }
        }
        
        return null;
      }
    })
  ]
});
