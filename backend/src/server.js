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
const postalCodeRouter = require('./routes/postalCode');
const coursesRouter = require('./routes/courses'); // NEU
const employmentAgentRouter = require('./routes/employmentAgent');
const moduleSessionRouter = require('./routes/moduleSession');
const roomRouter = require('./routes/room');
const locationRouter = require('./routes/location');
const teachingFormatRouter = require('./routes/teachingFormat');
const cancellationReasonRouter = require('./routes/cancellationReason');

app.use('/api/cancellationreasons', cancellationReasonRouter);
app.use(cors());
app.use(express.json());
app.use('/api/rooms', roomRouter);
app.use('/api/locations', locationRouter);
app.use('/api/modulesessions', moduleSessionRouter);
app.use('/api/participants', participantsRouter);
app.use('/api/modules', moduleRouter);
app.use('/api/bookings', bookingRouter);
app.use('/api/postalcodes', postalCodeRouter);
app.use('/api/courses', coursesRouter); // NEU
app.use('/api/employmentagents', employmentAgentRouter);
app.use('/api/teachingformats', teachingFormatRouter);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(3000, () => {
  console.log('Backend running on port 3000');
});
