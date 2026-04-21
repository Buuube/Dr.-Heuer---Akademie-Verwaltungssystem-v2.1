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
.exam-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 3px 0;
  font-size: 13px;
}

.exam-row:hover .btn-exam-delete {
  opacity: 1;
}
</style>
