const API = 'http://localhost:3000/api/rooms';

export async function getRooms() {
  const res = await fetch(API);
  return res.json();
}
