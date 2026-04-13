const express = require('express');
const cors = require('cors');
const path = require('path');
const os = require('os');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/meals', require('./routes/meals'));

app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🍱  TV Dinners API running on port ${PORT}`);

  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        console.log(`   Local network: http://${net.address}:5173`);
      }
    }
  }
  console.log('');
});
