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

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.65);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  backdrop-filter: blur(4px);
}

.modal {
  background: rgba(5, 8, 20, 0.97);
  border: 1px solid rgba(120, 180, 255, 0.18);
  border-radius: 18px;
  padding: 24px 28px;
  min-width: 300px;
  max-width: 420px;
  box-shadow: 0 0 40px rgba(74, 163, 255, 0.15);
  color: #d7e6ff;
}

.modal p {
  margin: 0 0 20px 0;
  font-size: 14px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.btn-confirm {
  padding: 8px 18px;
  border-radius: 10px;
  border: 1px solid rgba(255, 77, 109, 0.4);
  background: rgba(255, 77, 109, 0.12);
  color: #ff4d6d;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 1px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-confirm:hover {
  box-shadow: 0 0 14px rgba(255, 77, 109, 0.35);
  border-color: rgba(255, 77, 109, 0.65);
}

.btn-modal-cancel {
  padding: 8px 18px;
  border-radius: 10px;
  border: 1px solid rgba(124, 247, 255, 0.15);
  background: rgba(74, 163, 255, 0.06);
  color: rgba(215, 230, 255, 0.6);
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 1px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-modal-cancel:hover {
  border-color: rgba(124, 247, 255, 0.3);
  color: #7cf7ff;
}

.btn-success {
  padding: 8px 18px;
  border-radius: 10px;
  border: 1px solid rgba(124, 247, 255, 0.4);
  background: rgba(124, 247, 255, 0.08);
  color: #7cf7ff;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 1px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-success:hover {
  box-shadow: 0 0 14px rgba(124, 247, 255, 0.3);
}
</style>
