// this file contains the functions that run when a route is hit
// it receives the request from the route file, asks the service for data, and sends the response back to the frontend
// it never talks to the database directly - that is the service's job

// import service functions here
const { getParticipantsFromDB } = require('../services/participantsService');

// define controller functions here
// req = the incoming request from the frontend (contains any data they sent)
// res = the tool for sending something back to the frontend
async function getParticipants(req, res) {
  try {
    // ask the service for the participant data and wait for it
    const participants = await getParticipantsFromDB();
    // send the data back to the frontend as JSON
    res.json(participants);
  } catch (err) {
    // if something went wrong, send back an error message with status code 500
    // 500 means "something broke on the server side"
    res.status(500).json({ error: 'Failed to fetch participants' });
  }
}

// export functions here so the route file can use them
module.exports = { getParticipants };