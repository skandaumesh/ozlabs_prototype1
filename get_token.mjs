import mongoose from 'mongoose';

async function main() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ozlabs');
  const db = mongoose.connection.db;
  const client = await db.collection('clients').findOne({ email: 'skandaumesh82@gmail.com' });
  if (client) {
    console.log('TOKEN:', client.clientPortalToken);
    console.log('HAS PASSWORD:', !!client.password);
  } else {
    console.log('CLIENT NOT FOUND');
  }
  process.exit(0);
}
main();
