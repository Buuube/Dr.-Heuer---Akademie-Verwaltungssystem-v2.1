const BASE = 'http://localhost:3000/api/modules';

export async function getExams(moduleCode) {
  const response = await fetch(`${BASE}/${moduleCode}/exams`);
  return response.json();
}

export async function createExam(moduleCode, examData) {
  const response = await fetch(`${BASE}/${moduleCode}/exams`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(examData),
  });

  return response.json();
}

export async function updateExam(moduleCode, examId, examData) {
  const response = await fetch(`${BASE}/${moduleCode}/exams/${examId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(examData),
  });

  return response.json();
}

export async function deleteExam(moduleCode, examId) {
  await fetch(`${BASE}/${moduleCode}/exams/${examId}`, {
    method: 'DELETE',
  });
}
