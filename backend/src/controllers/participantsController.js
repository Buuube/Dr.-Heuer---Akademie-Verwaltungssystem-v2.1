// this file contains the functions that run when a route is hit
// it receives the request from the route file, asks the service for data, and sends the response back
// it never talks to the database directly — that is the service's job

const {
  getParticipantsFromDB,
  createParticipantInDB,
  updateParticipantInDB,
  deleteParticipantFromDB,
} = require('../services/participantsService');

async function getParticipants(req, res) {
  try {
    const participants = await getParticipantsFromDB();
    res.json(participants);
  } catch (err) {
    console.error('getParticipants error:', err); // ← add this
    res.status(500).json({ error: 'Failed to fetch participants' });
  }
}

async function createParticipant(req, res) {
  try {
    const participantData = req.body; // grab the data the frontend sent in the request body

    const newParticipant = await createParticipantInDB(participantData); // pass it to the service which talks to the DB

    res.status(201).json(newParticipant); // 201 = "created" — send the new participant back to the frontend
  } catch (err) {
    console.error('createParticipant error:', err); // log the real error in the terminal
    res.status(500).json({ error: `${err}` }); // tell the frontend something went wrong
  }
}

async function updateParticipant(req, res) {
  try {
    const { id } = req.params;
    const participantData = req.body;
    const updatedParticipant = await updateParticipantInDB(id, participantData);
    if (!updatedParticipant) {
      return res.status(404).json({ error: 'Participant not found' });
    }
    res.json(updatedParticipant);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update participant' });
  }
}

async function deleteParticipant(req, res) {
  try {
    const { id } = req.params;
    await deleteParticipantFromDB(id);
    res.status(204).send();
  } catch (err) {
    // 409 = Conflict — participant still has bookings or absence days
    if (err.code === 'HAS_BOOKINGS') {
      return res.status(409).json({
        error: 'Löschen nicht möglich: Teilnehmer hat aktive Buchungen',
      });
    }
    res.status(500).json({ error: 'Failed to delete participant' });
  }
}

module.exports = {
  getParticipants,
  createParticipant,
  updateParticipant,
  deleteParticipant,
};
