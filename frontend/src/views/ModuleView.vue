<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';

import ModuleList from '../components/modules/ModuleList.vue';
import ModuleForm from '../components/modules/ModuleForm.vue';
import ModuleDetail from '../components/modules/ModuleDetail.vue';
import {
  createModule,
  updateModule,
  deleteModule,
} from '../services/moduleService';
import {
  createExam,
  updateExam,
  deleteExam,
  getExams,
} from '../services/moduleExamService';

const route = useRoute();
const selected = ref(null);
const showForm = ref(false);
const showDetail = ref(false);
const reloadKey = ref(0);

const confirmPending = ref(null);
const successMessage = ref(null);
const errorMessage = ref(null);

onMounted(() => {
  if (route.query.openForm && route.query.courseId) {
    selected.value = { CourseId: Number(route.query.courseId) };
    showForm.value = true;
  }
});

const select = (module) => {
  selected.value = { ...module };
  showDetail.value = true;
  showForm.value = false;
};

const createNew = () => {
  selected.value = null;
  showForm.value = true;
  showDetail.value = false;
};

const edit = (module) => {
  selected.value = { ...module };
  showForm.value = true;
};

const closeForm = () => {
  showForm.value = false;
  if (!showDetail.value) selected.value = null;
};

const close = () => {
  selected.value = null;
  showDetail.value = false;
};

const save = async (formData) => {
  console.log('formData:', formData);
  try {
    const { exams = [], ...moduleData } = formData;
    if (moduleData.ModuleCodeId) {
      await updateModule(moduleData.ModuleCodeId, moduleData);
      const existing = await getExams(moduleData.ModuleCodeId);
      const existingIds = new Set(existing.map((e) => e.ModuleExamId));
      const incomingIds = new Set(
        exams.filter((e) => e.ModuleExamId).map((e) => e.ModuleExamId)
      );
      for (const e of existing) {
        if (!incomingIds.has(e.ModuleExamId))
          await deleteExam(moduleData.ModuleCodeId, e.ModuleExamId);
      }
      for (const e of exams) {
        if (e.ModuleExamId && existingIds.has(e.ModuleExamId)) {
          await updateExam(moduleData.ModuleCodeId, e.ModuleExamId, e);
        } else if (!e.ModuleExamId) {
          await createExam(moduleData.ModuleCodeId, e);
        }
      }
    } else {
      const created = await createModule(moduleData);
      for (const e of exams) {
        await createExam(created.ModuleCodeId, e);
      }
    }
    showForm.value = false;
    if (!showDetail.value) selected.value = null;
    reloadKey.value++;
  } catch (e) {
    errorMessage.value = 'Fehler beim Speichern: ' + e.message;
  }
};

const remove = (moduleCodeId) => {
  confirmPending.value = moduleCodeId;
};

const confirmRemove = async () => {
  try {
    await deleteModule(confirmPending.value);
    confirmPending.value = null;
    selected.value = null;
    showDetail.value = false;
    reloadKey.value++;
    successMessage.value = 'Das Modul wurde erfolgreich deaktiviert.';
  } catch (e) {
    confirmPending.value = null;
    errorMessage.value = 'Fehler beim Deaktivieren: ' + e.message;
  }
};

const cancelRemove = () => {
  confirmPending.value = null;
};
</script>

<template>
  <div class="course-layout">
    <!-- OBEN: Button oder Form -->
    <div class="top-panel">
      <div v-if="!showForm" class="top-panel-cta">
        <button class="btn-new_part" @click="createNew">
          Neues Modul anlegen
        </button>
      </div>

      <ModuleForm
        v-if="showForm"
        :module="selected"
        @save="save"
        @cancel="closeForm"
      />
    </div>

    <!-- UNTEN: Liste oder Detail -->
    <div class="bottom-panel">
      <ModuleList
        v-if="!showDetail"
        :key="reloadKey"
        :OnEdit="edit"
        :OnDelete="remove"
        :OnSelect="select"
      />

      <ModuleDetail
        v-if="showDetail"
        :Module="selected"
        @edit="edit(selected)"
        @delete="remove(selected.ModuleCodeId)"
        @close="close"
      />
    </div>

    <!-- Bestätigungs-Modal -->
    <div v-if="confirmPending" class="modal-overlay">
      <div class="modal">
        <p>Sicher, dass Sie dieses Modul deaktivieren möchten?</p>
        <div class="modal-actions">
          <button class="btn-modal-cancel" @click="cancelRemove">
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
          <button class="btn-modal-cancel" @click="errorMessage = null">
            OK
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
