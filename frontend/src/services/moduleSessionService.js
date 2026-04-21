const API = 'http://localhost:3000/api/modulesessions';

export async function getModuleSessions(moduleCodeId, startDate, endDate) {
  const res = await fetch(
    `${API}?moduleCodeId=${moduleCodeId}&startDate=${startDate}&endDate=${endDate}`
  );
  return res.json();
}

export async function createModuleSession(sessionData) {
  const res = await fetch(API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(sessionData),
  });
  if (!res.ok) throw new Error('Fehler beim Erstellen der ModuleSession');
  return res.json();
}
