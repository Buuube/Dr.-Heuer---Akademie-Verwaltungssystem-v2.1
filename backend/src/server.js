const path = require('path');
const resolvedPath = path.resolve(__dirname, '../.env');
console.log('ENV PATH:', resolvedPath);
const result = require('dotenv').config({ path: resolvedPath });
console.log('DOTENV RESULT:', result);
console.log('DB_SERVER:', process.env.DB_SERVER);

const express = require('express');
const cors = require('cors');

const app = express();

const participantsRouter = require('./routes/participant');
const moduleRouter = require('./routes/modules');
const bookingRouter = require('./routes/booking');
const coursesRouter = require('./routes/courses'); // NEU

app.use(cors());
app.use(express.json());

app.use('/api/participants', participantsRouter);
app.use('/api/modules', moduleRouter);
app.use('/api/bookings', bookingRouter);
app.use('/api/courses', coursesRouter); // NEU

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(3000, () => {
  console.log('Backend running on port 3000');
});
