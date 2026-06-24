import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Client from '@/models/Client';
import Project from '@/models/Project';
import BrandAsset from '@/models/BrandAsset';
import ClientIntegration from '@/models/ClientIntegration';
import { auth } from '@/auth';

export async function GET(request, { params }) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    await dbConnect();

    const client = await Client.findById(id).lean();
    if (!client) return NextResponse.json({ error: 'Client not found' }, { status: 404 });

    const projects = await Project.find({ clientId: id }).sort({ createdAt: -1 }).lean();
    const brandAsset = await BrandAsset.findOne({ clientId: id }).lean();
    const integrations = await ClientIntegration.find({ clientId: id }).lean();

    return NextResponse.json({ client, projects, brandAsset, integrations });
  } catch (error) {
    console.error('Error fetching client:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(request, { params }) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const body = await request.json();
    
    await dbConnect();
    
    // Only allow updating socialProfile and password for now
    const updateData = {};
    if (body.socialProfile) {
      updateData.socialProfile = body.socialProfile;
    }
    if (body.password) {
      const bcrypt = require('bcryptjs');
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(body.password, salt);
    }

    const client = await Client.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!client) return NextResponse.json({ error: 'Client not found' }, { status: 404 });

    return NextResponse.json(client);
  } catch (error) {
    console.error('Error updating client:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
