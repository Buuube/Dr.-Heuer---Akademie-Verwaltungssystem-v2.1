// Route zu courses
// this file defines which functions handle which HTTP requests for courses
// it receives requests from server.js and calls the correct controller function

const express = require('express');
const router = express.Router();

const {
  getCourses,
  createCourse,
  updateCourse,
  deleteCourse,
} = require('../controllers/coursesController');

router.get('/', getCourses);
router.post('/', createCourse);
router.put('/:id', updateCourse);
router.delete('/:id', deleteCourse);

module.exports = router;
