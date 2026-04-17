// this file contains the functions that run when a route is hit
// it receives the request from the route file, asks the service for data, and sends the response back
// it never talks to the database directly — that is the service's job

const {
  getCoursesFromDB,
  createCourseInDB,
  updateCourseInDB,
  deleteCourseFromDB,
} = require('../services/coursesService');

async function getCourses(req, res) {
  try {
    const courses = await getCoursesFromDB();
    res.json(courses);
  } catch (err) {
    console.error('getCourses error:', err);
    res.status(500).json({ error: err.message });
  }
}

async function createCourse(req, res) {
  try {
    const courseData = req.body;
    console.log('createCourse body:', courseData);
    const newCourse = await createCourseInDB(courseData);
    res.status(201).json(newCourse);
  } catch (err) {
    console.error('createCourse error:', err);
    res.status(500).json({ error: err.message });
  }
}

async function updateCourse(req, res) {
  try {
    const { id } = req.params;
    const courseData = req.body;
    console.log('updateCourse id:', id, 'body:', courseData);
    const updatedCourse = await updateCourseInDB(id, courseData);
    if (!updatedCourse) {
      return res.status(404).json({ error: 'Course not found' });
    }
    res.json(updatedCourse);
  } catch (err) {
    console.error('updateCourse error:', err);
    res.status(500).json({ error: err.message });
  }
}

async function deleteCourse(req, res) {
  try {
    const { id } = req.params;
    console.log('deleteCourse id:', id);
    await deleteCourseFromDB(id);
    // 204 = No Content — success, nothing to return
    res.status(204).send();
  } catch (err) {
    console.error('deleteCourse error:', err);
    // 409 = Conflict — course still has modules assigned
    if (err.code === 'HAS_MODULES') {
      return res
        .status(409)
        .json({ error: 'Löschen nicht möglich: Kurs hat zugeordnete Module' });
    }
    res.status(500).json({ error: err.message });
  }
}

module.exports = { getCourses, createCourse, updateCourse, deleteCourse };
