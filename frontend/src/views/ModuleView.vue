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
const showConfirm = ref(false);

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
  try {
    const { exams = [], ...moduleData } = formData;
    if (
      moduleData.ModuleCode &&
      selected.value?.ModuleCode === moduleData.ModuleCode &&
      showDetail.value
    ) {
      await updateModule(moduleData.ModuleCode, moduleData);
      const existing = await getExams(moduleData.ModuleCode);
      const existingIds = new Set(existing.map((e) => e.ModuleExamId));
      const incomingIds = new Set(
        exams.filter((e) => e.ModuleExamId).map((e) => e.ModuleExamId)
      );
      for (const e of existing) {
        if (!incomingIds.has(e.ModuleExamId))
          await deleteExam(moduleData.ModuleCode, e.ModuleExamId);
      }
      for (const e of exams) {
        if (e.ModuleExamId && existingIds.has(e.ModuleExamId)) {
          await updateExam(moduleData.ModuleCode, e.ModuleExamId, e);
        } else if (!e.ModuleExamId) {
          await createExam(moduleData.ModuleCode, e);
        }
      }
    } else {
      const created = await createModule(moduleData);
      for (const e of exams) {
        await createExam(created.ModuleCode, e);
      }
    }
    showForm.value = false;
    if (!showDetail.value) selected.value = null;
    reloadKey.value++;
  } catch (e) {
    alert('Fehler beim Speichern: ' + e.message);
  }
};

const remove = (moduleCode) => {
  confirmPending.value = moduleCode;
  showConfirm.value = true;
};

const confirmRemove = async () => {
  showConfirm.value = false;
  try {
    await deleteModule(confirmPending.value);
    selected.value = null;
    showDetail.value = false;
    reloadKey.value++;
  } catch (e) {
    alert('Fehler beim Deaktivieren: ' + e.message);
  } finally {
    confirmPending.value = null;
  }
};

const cancelRemove = () => {
  showConfirm.value = false;
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
        @delete="remove(selected.ModuleCode)"
        @close="close"
      />
    </div>

    <!-- Bestätigungs-Modal -->
    <div v-if="showConfirm" class="modal-overlay">
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
</style>
