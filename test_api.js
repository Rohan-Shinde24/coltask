const axios = require('axios');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const mongoose = require('mongoose');

const env = fs.readFileSync('.env', 'utf8');
const jwtSecret = env.split('\n').find(l => l.startsWith('JWT_SECRET=')).split('=')[1].trim();
const uri = env.split('\n').find(l => l.startsWith('MONGODB_URI=')).split('=')[1].trim();

async function run() {
  await mongoose.connect(uri);
  const db = mongoose.connection;
  const Workshop = db.collection('workshops');
  const User = db.collection('users');
  
  const workshopId = new mongoose.Types.ObjectId('6a75ea7284d1467eb6dbd48d');
  const workshop = await Workshop.findOne({ _id: workshopId });
  if (!workshop) {
    console.log("Workshop not found in DB!");
    process.exit(0);
  }
  const user = await User.findOne({ _id: workshop.owner });
  
  const token = jwt.sign(
    { id: user._id.toString(), email: user.email, name: user.name },
    jwtSecret,
    { expiresIn: '1h' }
  );
  
  try {
    const res = await axios.get(`http://localhost:3000/api/workshops/${workshop._id.toString()}`, {
      headers: {
        Cookie: `token=${token}`
      }
    });
    console.log("Success:", res.status, res.data);
  } catch (err) {
    console.log("Error:", err.response ? err.response.status : err.message);
    console.log(err.response ? err.response.data : '');
  }
  
  process.exit(0);
}
run();
