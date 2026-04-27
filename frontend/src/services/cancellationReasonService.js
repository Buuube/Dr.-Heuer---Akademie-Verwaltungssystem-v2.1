const API = 'http://localhost:3000/api/cancellationreasons';

export async function createCancellationReason(description) {
  const res = await fetch(API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ description }),
  });
  if (!res.ok) throw new Error('Fehler beim Erstellen des Stornierungsgrundes');
  return res.json();
}
