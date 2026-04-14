// Route zu modules
// this file defines which functions handle which HTTP requests for modules
// it receives requests from server.js and calls the correct controller function

const express = require('express');
const router = express.Router();

const {
  getModules,
  createModule,
  updateModule,
  deleteModule,
} = require('../controllers/modulesController');

// GET supports optional query param: /api/modules?courseId=5
router.get('/', getModules);
router.post('/', createModule);
router.put('/:id', updateModule);
router.delete('/:id', deleteModule);

module.exports = router;
