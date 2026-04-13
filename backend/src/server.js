const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// load the participants route file so the app knows how to handle participant requests
const participantsRouter = require('./routes/participant');

// without this, the browser blocks requests from the frontend (port 5173) to the backend (port 3000)
app.use(cors());

// without this, the backend cannot read the JSON data that the frontend sends
app.use(express.json());

// everything that arrives at /api/participants gets handled by the participants route file
app.use('/api/participants', participantsRouter);

// test route - open http://localhost:3000/api/health in the browser to confirm the backend is running
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// start listening for incoming requests from the frontend on port 3000
// port 3000 is the address the frontend uses to reach the backend (http://localhost:3000)
app.listen(3000, () => {
  console.log('Backend running on port 3000');
});