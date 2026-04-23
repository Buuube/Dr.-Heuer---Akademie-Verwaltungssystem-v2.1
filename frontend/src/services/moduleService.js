const API = 'http://localhost:3000/api/modules';

export async function getModule(courseId) {
  const url = courseId ? `${API}?courseId=${courseId}` : API;
  const response = await fetch(url);
  return response.json();
}

export async function createModule(moduleData) {
  const response = await fetch(API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(moduleData),
  });

  return response.json();
}

export async function updateModule(id, module) {
  const response = await fetch(`${API}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(module),
  });

  return response.json();
}

export async function deleteModule(id) {
  const res = await fetch(`${API}/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    const check = await res.json();
    throw new Error(check.error);
  }
}
