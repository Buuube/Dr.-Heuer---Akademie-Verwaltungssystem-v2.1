const API = 'http://localhost:3000/api/locations';

export async function getLocations() {
  const res = await fetch(API);
  return res.json();
}
