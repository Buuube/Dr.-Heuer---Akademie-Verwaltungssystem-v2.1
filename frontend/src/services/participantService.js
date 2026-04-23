const API = 'http://localhost:3000/api/participants';

export async function getParticipants() {
  const response = await fetch(API);
  return response.json();
}

export const getPostalCode = async (postalCode) => {
  const res = await fetch(
    `http://localhost:3000/api/postalcodes/${postalCode}`
  );
  return await res.json();
};

export const createParticipant = async (participant) => {
  const res = await fetch('http://localhost:3000/api/participants', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(participant),
  });

  if (!res.ok) {
    throw new Error('Fehler beim Anlegen');
  }

  return await res.json();
};

export const updateParticipant = async (participant) => {
  const id = participant.Id || participant.ParticipantId;

  if (!id) {
    throw new Error('Keine ID für Update vorhanden');
  }

  const res = await fetch(`http://localhost:3000/api/participants/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(participant),
  });

  if (!res.ok) {
    throw new Error('Fehler beim Aktualisieren');
  }

  return await res.json();
};

export const deleteParticipant = async (id) => {
  const res = await fetch(`http://localhost:3000/api/participants/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    const check = await res.json(); // nur bei Fehler JSON lesen
    throw new Error(check.error);
  }
};
