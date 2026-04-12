const { getStudentsFromDB } = require('../services/studentsService');

async function getStudents(req, res) {
  try {
    const students = await getStudentsFromDB();
    res.json(students);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch students' });
  }
}

module.exports = { getStudents };