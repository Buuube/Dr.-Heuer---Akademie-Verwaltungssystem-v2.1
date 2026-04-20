const API = 'http://localhost:3000/api/courses';

export async function getCourses() {
  const response = await fetch(API);
  return response.json();
}

export async function createCourse(courseData) {
  const response = await fetch(API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(courseData),
  });

  return response.json();
}

export async function updateCourse(id, course) {
  const response = await fetch(`${API}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(course),
  });

  return response.json();
}

export async function deleteCourse(id) {
  await fetch(`${API}/${id}`, {
    method: 'DELETE',
  });
}
