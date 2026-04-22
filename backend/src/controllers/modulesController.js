// this file contains the functions that run when a route is hit
// it receives the request from the route file, asks the service for data, and sends the response back
// it never talks to the database directly — that is the service's job

const {
  getModulesFromDB,
  createModuleInDB,
  updateModuleInDB,
  deleteModuleFromDB,
  getExamsFromDB,
  createExamInDB,
  deleteExamFromDB,
  updateExamInDB,
} = require('../services/modulesService');

async function getModules(req, res) {
  try {
    const { courseId } = req.query;
    const modules = await getModulesFromDB(courseId);
    res.json(modules);
  } catch (err) {
    console.error('getModules error:', err); // ← diese Zeile hinzufügen
    res.status(500).json({ error: 'Failed to fetch modules' });
  }
}

async function createModule(req, res) {
  try {
    const moduleData = req.body;
    const newModule = await createModuleInDB(moduleData);
    res.status(201).json(newModule);
  } catch (err) {
    console.log('moduleData:', req.body);
    console.log('createModule error:', err);
    res.status(500).json({ error: 'Failed to create module' });
  }
}

async function updateModule(req, res) {
  try {
    const { id } = req.params;
    const moduleData = req.body;
    const updatedModule = await updateModuleInDB(id, moduleData);
    if (!updatedModule) {
      return res.status(404).json({ error: 'Module not found' });
    }
    res.json(updatedModule);
  } catch (err) {
    console.log('updateModule error:', err);
    console.error('updateModule error:', err);
    res.status(500).json({ error: 'Failed to update module' });
  }
}

async function deleteModule(req, res) {
  try {
    const { id } = req.params;
    await deleteModuleFromDB(id);
    res.status(204).send();
  } catch (err) {
    // 409 = Conflict — module still has active bookings
    if (err.code === 'HAS_BOOKINGS') {
      return res
        .status(409)
        .json({ error: 'Löschen nicht möglich: Modul hat aktive Buchungen' });
    }
    res.status(500).json({ error: 'Failed to delete module' });
  }
}

async function getExams(req, res) {
  try {
    const { moduleCode } = req.params;
    const result = await getExamsFromDB(moduleCode);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch exams' });
  }
}

async function createExam(req, res) {
  try {
    const { moduleCode } = req.params;
    const result = await createExamInDB(moduleCode, req.body);
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create exam' });
  }
}

async function deleteExam(req, res) {
  try {
    const { moduleCode, examId } = req.params;
    await deleteExamFromDB(moduleCode, examId);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete exam' });
  }
}

async function updateExam(req, res) {
  try {
    const { moduleCode, examId } = req.params;
    const result = await updateExamInDB(moduleCode, examId, req.body);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update exam' });
  }
}

module.exports = {
  getModules,
  createModule,
  updateModule,
  deleteModule,
  getExams,
  createExam,
  deleteExam,
  updateExam,
};
