const service = require('../services/modulesExamService');

async function getExams(req, res) {
  try {
    const data = await service.getExamsByModule(req.params.moduleCode);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function createExam(req, res) {
  try {
    const result = await service.createExam(req.params.moduleCode, req.body);
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function updateExam(req, res) {
  try {
    const result = await service.updateExam(req.params.examId, req.body);
    if (!result) return res.status(404).json({ error: 'Exam not found' });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function deleteExam(req, res) {
  try {
    const result = await service.deleteExam(req.params.examId);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { getExams, createExam, updateExam, deleteExam };
