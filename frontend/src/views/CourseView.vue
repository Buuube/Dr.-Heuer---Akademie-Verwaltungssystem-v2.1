<script setup>
import { ref } from 'vue';

import CourseList from '../components/courses/CourseList.vue';
import CourseForm from '../components/courses/CourseForm.vue';
import CourseDetail from '../components/courses/CourseDetail.vue';

import {
  createCourse,
  updateCourse,
  deleteCourse,
} from '../services/courseService';

const selected = ref(null);
const mode = ref('list');
// list | detail | form
const reloadKey = ref(0);

const select = (course) => {
  selected.value = { ...course };
  mode.value = 'detail';
};

const createNew = () => {
  selected.value = null;
  mode.value = 'form';
};

const edit = (course) => {
  selected.value = { ...course };
  mode.value = 'form';
};

const remove = async (courseId) => {
  await deleteCourse(courseId);
  selected.value = null;
  mode.value = 'list';
  reloadKey.value++;
};

const save = async (courseData) => {
  if (courseData.CourseId) {
    await updateCourse(courseData.CourseId, courseData);
  } else {
    await createCourse(courseData);
  }
  selected.value = null;
  mode.value = 'list';
  reloadKey.value++;
};

const close = () => {
  selected.value = null;
  mode.value = 'list';
};
</script>

<template>
  <div>
    <CourseList
      v-if="mode === 'list'"
      :key="reloadKey"
      :OnEdit="edit"
      :OnDelete="remove"
      :OnSelect="select"
      :OnCreate="createNew"
    />

    <CourseDetail
      v-if="mode === 'detail'"
      :Course="selected"
      @edit="edit(selected)"
      @delete="remove(selected.CourseId)"
      @close="close"
    />

    <CourseForm
      v-if="mode === 'form'"
      :course="selected"
      @save="save"
      @cancel="close"
    />
  </div>
</template>
