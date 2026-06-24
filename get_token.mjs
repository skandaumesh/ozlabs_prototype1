import mongoose from 'mongoose';

async function main() {
  await mongoose.connect('mongodb+srv://onezerolabs:onezerolabs%402025@cluster0.u8eddyu.mongodb.net/onezerolabs?appName=Cluster0');
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
