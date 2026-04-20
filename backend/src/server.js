const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const express = require('express');
const cors = require('cors');
const app = express();

const participantsRouter = require('./routes/participant');
const modulesRouter = require('./routes/modules');
const moduleExamRouter = require('./routes/moduleExamRoutes');
const bookingRouter = require('./routes/booking');
const postalCodeRouter = require('./routes/postalCode');
const coursesRouter = require('./routes/courses');
const employmentAgentRouter = require('./routes/employmentAgent');

app.use(cors());
app.use(express.json());

app.use('/api/participants', participantsRouter);
app.use('/api/modules', modulesRouter);
app.use('/api/modules', moduleExamRouter); // ← exam routes on same base
app.use('/api/bookings', bookingRouter);
app.use('/api/postalcodes', postalCodeRouter);
app.use('/api/courses', coursesRouter);
app.use('/api/employmentagents', employmentAgentRouter);

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.listen(3000, () => console.log('Backend running on port 3000'));
