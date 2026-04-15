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
    res.status(500).json({ error: 'Failed to fetch courses' });
  }
}

async function createCourse(req, res) {
  try {
    const courseData = req.body;
    const newCourse = await createCourseInDB(courseData);
    // 201 = Created
    res.status(201).json(newCourse);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create course' });
  }
}

async function updateCourse(req, res) {
  try {
    const { id } = req.params;
    const courseData = req.body;
    const updatedCourse = await updateCourseInDB(id, courseData);
    if (!updatedCourse) {
      return res.status(404).json({ error: 'Course not found' });
    }
    res.json(updatedCourse);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update course' });
  }
}

async function deleteCourse(req, res) {
  try {
    const { id } = req.params;
    await deleteCourseFromDB(id);
    // 204 = No Content — success, nothing to return
    res.status(204).send();
  } catch (err) {
    // 409 = Conflict — course still has modules assigned
    if (err.code === 'HAS_MODULES') {
      return res
        .status(409)
        .json({ error: 'Löschen nicht möglich: Kurs hat zugeordnete Module' });
    }
    res.status(500).json({ error: 'Failed to delete course' });
  }
}

module.exports = { getCourses, createCourse, updateCourse, deleteCourse };
