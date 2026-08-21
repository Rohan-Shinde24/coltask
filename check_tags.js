const fs = require('fs');
const mongoose = require('mongoose');
const env = fs.readFileSync('.env', 'utf8');
const uri = env.split('\n').find(l => l.startsWith('MONGODB_URI=')).split('=')[1].trim();

async function check() {
  await mongoose.connect(uri);
  const db = mongoose.connection;
  const Workshop = db.collection('workshops');
  const workshops = await Workshop.find({}).toArray();
  console.log(JSON.stringify(workshops.map(w => ({ id: w._id, name: w.name, tags: w.tags })), null, 2));
  process.exit(0);
}
check();
