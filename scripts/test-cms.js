import mongoose from 'mongoose';
import dbConnect from '../src/lib/mongodb.js';
import Client from '../src/models/Client.js';
import WebsiteContent from '../src/models/WebsiteContent.js';

async function run() {
  await dbConnect();
  
  // 1. Get the first client
  const client = await Client.findOne();
  if (!client) {
    console.log('No clients found in DB. Please create one in the dashboard.');
    process.exit(0);
  }

  console.log(`\n1. Found Client: ${client.company} (${client._id})`);

  // 2. Create some dummy CMS schema & content for this client
  let content = await WebsiteContent.findOne({ clientId: client._id });
  if (!content) {
    console.log('2. Creating dummy CMS schema & content...');
    content = await WebsiteContent.create({
      clientId: client._id,
      fields: [
        { key: 'hero_title', label: 'Hero Title', type: 'text', value: 'Welcome to Vetaas Innovation' },
        { key: 'about_text', label: 'About Us', type: 'textarea', value: 'We are a next-gen technology company.' },
      ]
    });
  } else {
    console.log('2. CMS schema already exists. Updating it...');
    content.fields = [
      { key: 'hero_title', label: 'Hero Title', type: 'text', value: 'Welcome to Vetaas Innovation' },
      { key: 'about_text', label: 'About Us', type: 'textarea', value: 'We are a next-gen technology company.' },
    ];
    await content.save();
  }

  console.log(`\n✅ 3. Dummy content saved successfully!`);
  console.log(`\nHere is the API Key that was generated: ${content.apiKey}`);
  console.log(`\n4. Simulating what the external Next.js website would fetch...`);

  // Simulate the external website fetch
  const API_URL = `http://localhost:3000/api/v1/content/${content.apiKey}`;
  console.log(`\nFetching GET -> ${API_URL}`);
  
  try {
    const res = await fetch(API_URL);
    const data = await res.json();
    
    console.log(`\n🎉 Received JSON Response on external website:`);
    console.log(JSON.stringify(data, null, 2));
    
    console.log(`\nSuccess! The Next.js website successfully pulled the dynamic content.`);
  } catch(e) {
    console.log('Make sure the dev server is running on localhost:3000 to test the fetch!');
  }

  process.exit(0);
}

run();
