require('dotenv').config({
  path: require('path').resolve(__dirname, '../.env'),
});

const express = require('express');
const cors = require('cors');

const app = express();

// load route files here — one line per feature
const participantsRouter = require('./routes/participant');

// middleware — runs on every request before routes, do not change order
app.use(cors()); // allows frontend to talk to backend
app.use(express.json()); // allows backend to read JSON from incoming requests

// mount routes here — one line per feature
// format: app.use('/api/yourfeature', yourRouter)
app.use('/api/participants', participantsRouter);

// test route — open http://localhost:3000/api/health to confirm backend is running
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// starts the server
app.listen(3000, () => {
  console.log('Backend running on port 3000');
});
