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

export const getLocations = async () => {
  const res = await fetch('http://localhost:3000/locations'); // URL anpassen!
  return await res.json();
};

export const getPostalCode = async (postalCode) => {
  const res = await fetch(`http://localhost:3000/postalcodes/${postalCode}`);
  return await res.json();
};

export const saveParticipant = async (participant) => {
  const isUpdate = !!participant.Id;

  const url = isUpdate
    ? `http://localhost:3000/participants/${participant.Id}`
    : 'http://localhost:3000/participants';

  const method = isUpdate ? 'PUT' : 'POST';

  const res = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(participant),
  });

  if (!res.ok) {
    throw new Error('Fehler beim Speichern des Teilnehmers');
  }

  return await res.json();
};
// add more functions here when the backend supports POST, PUT, DELETE
// export async function createParticipant(p) {}
// export async function updateParticipant(p) {}
// export async function deleteParticipant(id) {}
