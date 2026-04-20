const express = require('express');
const router = express.Router();
const controller = require('../controllers/modulesExamController');

router.get('/:moduleCode/exams', controller.getExams);
router.post('/:moduleCode/exams', controller.createExam);
router.put('/:moduleCode/exams/:examId', controller.updateExam);
router.delete('/:moduleCode/exams/:examId', controller.deleteExam);

module.exports = router;
