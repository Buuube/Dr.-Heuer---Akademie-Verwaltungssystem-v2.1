// this file contains the functions that run when a route is hit
// it receives the request from the route file, asks the service for data, and sends the response back
// it never talks to the database directly — that is the service's job

const {
  getModulesFromDB,
  createModuleInDB,
  updateModuleInDB,
  deleteModuleFromDB,
} = require('../services/modulesService');

async function getModules(req, res) {
  try {
    // optional filter: /api/modules?courseId=5
    const { courseId } = req.query;
    const modules = await getModulesFromDB(courseId);
    res.json(modules);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch modules' });
  }
}

async function createModule(req, res) {
  try {
    const moduleData = req.body;
    const newModule = await createModuleInDB(moduleData);
    res.status(201).json(newModule);
  } catch (err) {
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

module.exports = { getModules, createModule, updateModule, deleteModule };
