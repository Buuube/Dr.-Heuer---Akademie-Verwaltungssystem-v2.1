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

const formRef = ref(null);
const selected = ref(null);
const showForm = ref(false);
const showDetail = ref(false);
const reloadKey = ref(0);

const confirmPending = ref(null);
const errorMessage = ref(null);
const successMessage = ref(null);

const select = (course) => {
  selected.value = { ...course };
  showDetail.value = true;
  showForm.value = false;
};

const createNew = () => {
  selected.value = null;
  showForm.value = true;
  showDetail.value = false;
};

const edit = (course) => {
  selected.value = { ...course };
  showForm.value = true;
};

const closeForm = () => {
  showForm.value = false;
  if (!showDetail.value) {
    selected.value = null;
  }
};

const closeDetail = () => {
  showDetail.value = false;
  selected.value = null;
};

const remove = (courseId) => {
  confirmPending.value = courseId;
};

const confirmRemove = async () => {
  const response = await deleteCourse(confirmPending.value);
  confirmPending.value = null;

  if (response.status === 409) {
    errorMessage.value =
      'Dieser Kurs kann nicht deaktiviert werden, da ihm noch Module zugeordnet sind.';
    return;
  }

  selected.value = null;
  showDetail.value = false;
  reloadKey.value++;
  successMessage.value = 'Der Kurs wurde erfolgreich deaktiviert.';
};

const save = async (courseData) => {
  if (courseData.CourseId) {
    const updated = await updateCourse(courseData.CourseId, courseData);
    if (showDetail.value) {
      selected.value = { ...updated };
    }
  } else {
    await createCourse(courseData);
  }
  showForm.value = false;
  if (!showDetail.value) {
    selected.value = null;
  }
  reloadKey.value++;
};
</script>

<template>
  <div class="course-layout">
    <!-- OBEN: Button oder Form -->
    <div class="top-panel">
      <div v-if="!showForm" class="top-panel-cta">
        <button class="btn-new_part" @click="createNew">
          Neuen Kurs anlegen
        </button>
      </div>

      <CourseForm
        v-if="showForm"
        ref="formRef"
        :course="selected"
        @save="save"
        @cancel="closeForm"
      />
    </div>

    <!-- UNTEN: Liste oder Detail -->
    <div class="bottom-panel">
      <CourseList
        v-if="!showDetail"
        :key="reloadKey"
        :OnEdit="edit"
        :OnDelete="remove"
        :OnSelect="select"
      />

      <CourseDetail
        v-if="showDetail"
        :Course="selected"
        :editMode="showForm"
        @edit="edit(selected)"
        @save="() => formRef?.submitForm()"
        @cancel="closeForm"
        @delete="remove(selected.CourseId)"
        @close="closeDetail"
      />
    </div>

    <!-- Bestätigungs-Popup -->
    <div v-if="confirmPending" class="modal-overlay">
      <div class="modal">
        <p>Sicher, dass Sie diesen Kurs deaktivieren möchten?</p>
        <div class="modal-actions">
          <button class="btn-modal-cancel" @click="confirmPending = null">
            Abbrechen
          </button>
          <button class="btn-confirm" @click="confirmRemove">
            Deaktivieren
          </button>
        </div>
      </div>
    </div>

    <!-- Erfolgs-Popup -->
    <div v-if="successMessage" class="modal-overlay">
      <div class="modal">
        <p>{{ successMessage }}</p>
        <div class="modal-actions">
          <button class="btn-success" @click="successMessage = null">OK</button>
        </div>
      </div>
    </div>

    <!-- Fehler-Popup -->
    <div v-if="errorMessage" class="modal-overlay">
      <div class="modal">
        <p>{{ errorMessage }}</p>
        <div class="modal-actions">
          <button class="btn-confirm" @click="errorMessage = null">OK</button>
        </div>
      </div>
    </div>
  </div>
</template>
