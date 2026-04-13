const express = require('express'); // loads express
const cors = require('cors'); // loads cors
require('dotenv').config(); // loads .env file into process.env

const app = express(); // creates the express app

// imports the students router we created
const studentsRouter = require('./routes/students');
const participantsRouter = require('./routes/participant');

app.use(cors()); // allows frontend to talk to backend
app.use(express.json()); // lets the app read JSON from incoming requests

// mounts the students router at /api/students
// any route defined in students.js gets prefixed with /api/students
// so router.get('/') in students.js becomes GET /api/students
app.use('/api/students', studentsRouter);
app.use('/api/participants', participantsRouter);

// a test route to confirm the backend is running
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// starts the server on port 3000
app.listen(3000, () => {
  console.log('Backend running on port 3000');
});