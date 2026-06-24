import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Client from '@/models/Client';
import bcrypt from 'bcryptjs';

export async function POST(request) {
  try {
    const { token, password } = await request.json();

    if (!token || !password) {
      return NextResponse.json({ error: 'Missing token or password' }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters long' }, { status: 400 });
    }

    await dbConnect();

    const client = await Client.findOne({ clientPortalToken: token });

    if (!client) {
      return NextResponse.json({ error: 'Invalid or expired setup token' }, { status: 404 });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Save the new password
    client.password = hashedPassword;
    await client.save();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error setting client password:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
