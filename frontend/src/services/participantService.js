const API = 'http://localhost:3000/api/participants';

// MOCK falls Backend noch nicht fertig
let mock = [];
let id = 1;

export async function getParticipants() {
  return mock;
}

export async function createParticipant(p) {
  mock.push({ ...p, id: id++ });
}

export async function updateParticipant(p) {
  const index = mock.findIndex((x) => x.id === p.id);
  if (index !== -1) mock[index] = p;
}

export async function deleteParticipant(id) {
  mock = mock.filter((p) => p.id !== id);
}
