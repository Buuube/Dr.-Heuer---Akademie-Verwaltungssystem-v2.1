const service = require('../services/modulesService');

async function getModules(req, res) {
  try {
    const { courseId } = req.query;
    const data = await service.getModulesFromDB(courseId);
    res.json(data);
  } catch (err) {
    console.error('getModules error:', err);
    res.status(500).json({ error: err.message });
  }
}

async function createModule(req, res) {
  try {
    const result = await service.createModule(req.body);
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function updateModule(req, res) {
  try {
    const result = await service.updateModule(req.params.id, req.body);
    if (!result) return res.status(404).json({ error: 'Module not found' });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function deleteModule(req, res) {
  try {
    const result = await service.deleteModule(req.params.id);
    res.json(result);
  } catch (err) {
    if (err.code === 'HAS_BOOKINGS') {
      return res.status(409).json({
        error: 'Löschen nicht möglich: Modul hat aktive Buchungen',
      });
    }
    res.status(500).json({ error: err.message });
  }
}

module.exports = { getModules, createModule, updateModule, deleteModule };
