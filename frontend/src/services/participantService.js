// this file handles all communication between the frontend and the backend for participants
// the components never talk to the backend directly - they always go through this file
// when a component needs data it calls a function from here

// the address of the backend API - all participant requests go to this URL
const API = 'http://localhost:3000/api/participants';

// define API functions here

// fetch all participants from the backend and return them as a JS array
// called automatically when the participant list component loads
export async function getParticipants() {
  const response = await fetch(API); // send a GET request to the backend
  return response.json(); // convert the response from JSON to a JS array
}

// add more functions here when the backend supports POST, PUT, DELETE
// export async function createParticipant(p) {}
// export async function updateParticipant(p) {}
// export async function deleteParticipant(id) {}