const API = 'http://localhost:3000/api/participants';

export async function getParticipants() {
  const response = await fetch(API);
  return response.json();
}

export const getLocations = async () => {
  const res = await fetch('http://localhost:3000/locations');
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
    : API;

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

export const deleteParticipant = async (id) => {
  const res = await fetch(`http://localhost:3000/api/participants/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Fehler beim Löschen');
};
