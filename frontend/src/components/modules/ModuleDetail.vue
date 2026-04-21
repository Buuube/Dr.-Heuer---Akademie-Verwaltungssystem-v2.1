<script setup>
import { ref, watch, computed } from 'vue';
import { getExams, createExam, deleteExam } from '@/services/moduleExamService';

const props = defineProps({
  Module: Object,
});

const emit = defineEmits(['edit', 'delete', 'close']);

const formatCurrency = (value) =>
  Number(value).toLocaleString('de-DE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }) + ' €';

const exams = ref([]);

const loadExams = async () => {
  if (!props.Module?.ModuleCode) return;
  try {
    exams.value = await getExams(props.Module.ModuleCode);
  } catch {
    exams.value = [];
  }
};

watch(() => props.Module, loadExams, { immediate: true });

const internExams = computed(() =>
  exams.value.filter((e) => e.ExamType === 'intern')
);
const externExams = computed(() =>
  exams.value.filter((e) => e.ExamType === 'extern')
);

const newIntern = ref('');
const newExtern = ref('');
const addingIntern = ref(false);
const addingExtern = ref(false);

const addExam = async (type) => {
  const name =
    type === 'intern' ? newIntern.value.trim() : newExtern.value.trim();
  if (!name) return;
  await createExam(props.Module.ModuleCode, { ExamName: name, ExamType: type });
  if (type === 'intern') {
    newIntern.value = '';
    addingIntern.value = false;
  } else {
    newExtern.value = '';
    addingExtern.value = false;
  }
  await loadExams();
};

const removeExam = async (examId) => {
  await deleteExam(props.Module.ModuleCode, examId);
  await loadExams();
};
</script>

<template>
  <div v-if="Module" class="detail-panel">
    <h3>Modul Details</h3>

    <div class="detail-grid">
      <div class="detail-group">
        <div class="detail-group-title">Allgemein</div>
        <div class="detail-row">
          <span class="detail-label">Status</span>
          <span>
            <span v-if="Module.IsDeleted" class="badge-deactivated"
              >Deaktiviert</span
            >
            <span v-else class="badge-active">Aktiv</span>
          </span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Modulnummer</span>
          <span>{{ Module.ModuleCode || '–' }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Externe Nummer</span>
          <span>{{ Module.ExternalModuleCode || '–' }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Name</span>
          <span>{{ Module.Name || '–' }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Unterrichtsformat</span>
          <span>{{ Module.TeachingFormat || '–' }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Praktikum</span>
          <span>{{ Module.HasInternship ? 'Ja' : 'Nein' }}</span>
        </div>
      </div>

      <div class="detail-group">
        <div class="detail-group-title">Zeiten & Kosten</div>
        <div class="detail-row">
          <span class="detail-label">Dauer</span>
          <span>{{ Module.Duration || '–' }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Std./Tag</span>
          <span>{{ Module.DailyTeachingHours ?? '–' }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Kosten</span>
          <span>{{ formatCurrency(Module.EstimatedCost) }}</span>
        </div>
      </div>

      <div class="detail-group exam-group">
        <div class="exam-section">
          <div class="detail-group-title">
            Interne Prüfungen ({{ internExams.length }})
            <button
              v-if="!Module.IsDeleted"
              class="btn-add-exam"
              @click="addingIntern = !addingIntern"
            >
              + Hinzufügen
            </button>
          </div>

          <div v-if="addingIntern" class="exam-add-row">
            <input
              v-model="newIntern"
              placeholder="Prüfungsname"
              @keydown.enter="addExam('intern')"
            />
            <button class="btn-exam-save" @click="addExam('intern')">✓</button>
            <button
              class="btn-exam-cancel"
              @click="
                addingIntern = false;
                newIntern = '';
              "
            >
              ✕
            </button>
          </div>

          <div
            v-if="internExams.length === 0 && !addingIntern"
            class="detail-row"
          >
            <span>–</span>
          </div>
          <div
            v-for="exam in internExams"
            :key="exam.ModuleExamId"
            class="exam-row"
          >
            <span>{{ exam.ExamName }}</span>
            <button
              class="btn-exam-delete"
              @click="removeExam(exam.ModuleExamId)"
            >
              ✕
            </button>
          </div>
        </div>

        <div class="exam-section">
          <div class="detail-group-title">
            Externe Prüfungen ({{ externExams.length }})
            <button
              v-if="!Module.IsDeleted"
              class="btn-add-exam"
              @click="addingExtern = !addingExtern"
            >
              + Hinzufügen
            </button>
          </div>

          <div v-if="addingExtern" class="exam-add-row">
            <input
              v-model="newExtern"
              placeholder="Prüfungsname"
              @keydown.enter="addExam('extern')"
            />
            <button class="btn-exam-save" @click="addExam('extern')">✓</button>
            <button
              class="btn-exam-cancel"
              @click="
                addingExtern = false;
                newExtern = '';
              "
            >
              ✕
            </button>
          </div>

          <div
            v-if="externExams.length === 0 && !addingExtern"
            class="detail-row"
          >
            <span>–</span>
          </div>
          <div
            v-for="exam in externExams"
            :key="exam.ModuleExamId"
            class="exam-row"
          >
            <span>{{ exam.ExamName }}</span>
            <button
              class="btn-exam-delete"
              @click="removeExam(exam.ModuleExamId)"
            >
              ✕
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="detail-actions">
      <template v-if="!Module.IsDeleted">
        <button class="btn-edit" @click="emit('edit')">Bearbeiten</button>
        <button class="btn-delete" @click="emit('delete')">Deaktivieren</button>
      </template>
      <button class="btn-delete" @click="emit('close')">Schließen</button>
    </div>
  </div>
</template>

<style scoped>
.badge-active {
  background: rgba(46, 204, 113, 0.15);
  color: #2ecc71;
  border: 1px solid rgba(46, 204, 113, 0.3);
  padding: 2px 10px;
  border-radius: 12px;
  font-size: 0.85em;
}

.badge-deactivated {
  background: rgba(120, 180, 255, 0.08);
  color: rgba(215, 230, 255, 0.5);
  border: 1px solid rgba(120, 180, 255, 0.15);
  padding: 2px 10px;
  border-radius: 12px;
  font-size: 0.85em;
}

.exam-group {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.exam-section {
  display: flex;
  flex-direction: column;
}

.btn-add-exam {
  margin-left: 10px;
  padding: 2px 10px;
  border-radius: 8px;
  border: 1px solid rgba(124, 247, 255, 0.3);
  background: rgba(124, 247, 255, 0.08);
  color: var(--cyan);
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 1px;
  text-transform: uppercase;
  cursor: pointer;
  transition: box-shadow 0.2s;
}

.btn-add-exam:hover {
  box-shadow: 0 0 10px rgba(124, 247, 255, 0.25);
}

.exam-add-row {
  display: flex;
  gap: 6px;
  align-items: center;
  margin: 6px 0;
}

.exam-add-row input {
  flex: 1;
  padding: 4px 8px;
  border-radius: 8px;
  border: 1px solid var(--border-input);
  background: var(--bg-input);
  color: var(--text);
  font-size: 12px;
  outline: none;
}

.exam-add-row input:focus {
  border-color: var(--cyan);
}

.btn-exam-save {
  background: rgba(46, 204, 113, 0.12);
  border: 1px solid rgba(46, 204, 113, 0.3);
  color: #2ecc71;
  border-radius: 6px;
  padding: 2px 8px;
  cursor: pointer;
  font-size: 13px;
  transition: box-shadow 0.2s;
}

.btn-exam-save:hover {
  box-shadow: 0 0 8px rgba(46, 204, 113, 0.3);
}

.btn-exam-cancel {
  background: transparent;
  border: none;
  color: var(--muted);
  cursor: pointer;
  font-size: 13px;
  padding: 2px 4px;
}

.exam-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 3px 0;
  font-size: 13px;
}

.btn-exam-delete {
  background: transparent;
  border: none;
  color: var(--muted);
  cursor: pointer;
  font-size: 12px;
  padding: 1px 4px;
  line-height: 1;
  opacity: 0;
  transition:
    opacity 0.2s,
    color 0.2s;
}

.exam-row:hover .btn-exam-delete {
  opacity: 1;
}

.btn-exam-delete:hover {
  color: #ff4d6d;
}
</style>
