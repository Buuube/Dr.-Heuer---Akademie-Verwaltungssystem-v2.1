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
  if (showForm.value) {
    closeForm();
  } else {
    selected.value = null;
    showForm.value = true;
    showDetail.value = false;
  }
};

const edit = (course) => {
  selected.value = { ...course };
  showForm.value = true;
  // showDetail bleibt unverändert — aus Detailansicht heraus bleibt Detail sichtbar
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
      selected.value = { ...updated }; // Detailansicht mit aktualisierten Daten
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
  <div>
    <!-- Formular klappt oben auf — über Liste oder Detail -->
    <Transition name="form-expand">
      <div v-if="showForm" class="form-wrapper">
        <CourseForm
          ref="formRef"
          :course="selected"
          @save="save"
          @cancel="closeForm"
        />
      </div>
    </Transition>

    <!-- Detailansicht -->
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

    <!-- Liste -->
    <CourseList
      v-if="!showDetail"
      :key="reloadKey"
      :OnEdit="edit"
      :OnDelete="remove"
      :OnSelect="select"
      :OnCreate="createNew"
      :OnSave="() => formRef?.submitForm()"
      :showForm="showForm"
    />

    <!-- Bestätigungs-Popup -->
    <div v-if="confirmPending" class="modal-overlay">
      <div class="modal">
        <p>Sicher, dass Sie diesen Kurs deaktivieren möchten?</p>
        <div class="modal-actions">
          <button class="btn-cancel" @click="confirmPending = null">
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
.form-wrapper {
  margin-bottom: 24px;
}

.form-expand-enter-active,
.form-expand-leave-active {
  transition:
    max-height 0.3s ease,
    opacity 0.3s ease;
  overflow: hidden;
  max-height: 600px;
}

.form-expand-enter-from,
.form-expand-leave-to {
  max-height: 0;
  opacity: 0;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.modal {
  background: #1a1a2e;
  border: 1px solid #444;
  border-radius: 8px;
  padding: 24px 28px;
  min-width: 300px;
  max-width: 420px;
}

.modal p {
  margin: 0 0 20px 0;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.btn-cancel {
  padding: 6px 16px;
  background: none;
  border: 1px solid #666;
  border-radius: 4px;
  color: inherit;
  cursor: pointer;
}

.btn-cancel:hover {
  border-color: #aaa;
}

.btn-confirm {
  padding: 6px 16px;
  background: #e74c3c;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.btn-confirm:hover {
  opacity: 0.85;
}

.btn-success {
  padding: 6px 16px;
  background: #2ecc71;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.btn-success:hover {
  opacity: 0.85;
}
</style>
