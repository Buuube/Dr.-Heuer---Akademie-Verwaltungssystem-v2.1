const API = 'http://localhost:3000/api/teachingformats';

export async function getTeachingFormats() {
  const response = await fetch(API);
  return response.json();
}
