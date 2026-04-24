<script setup>
import { ref, watch, computed } from 'vue';
import { getExams, createExam } from '@/services/moduleExamService';

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
  if (!props.Module?.ModuleCodeId) return;
  try {
    exams.value = await getExams(props.Module.ModuleCodeId);
  } catch {
    exams.value = [];
  }
};

watch(() => props.Module, loadExams, { immediate: true });

const internExams = computed(() =>
  exams.value.filter((e) => e.ExamType === 'Internal')
);
const externExams = computed(() =>
  exams.value.filter((e) => e.ExamType === 'External')
);

const newIntern = ref('');
const newExtern = ref('');
const newMinScoreIntern = ref(50);
const newMinScoreExtern = ref(50);
const addingIntern = ref(false);
const addingExtern = ref(false);
const examError = ref('');

const addExam = async (type) => {
  const name =
    type === 'Internal' ? newIntern.value.trim() : newExtern.value.trim();
  if (!name) return;
  const count =
    type === 'Internal' ? internExams.value.length : externExams.value.length;
  if (count >= 5) {
    examError.value = `Maximal 5 ${type === 'Internal' ? 'interne' : 'externe'} Prüfungen erlaubt.`;
    return;
  }
  examError.value = '';
  await createExam(props.Module.ModuleCodeId, {
    ExamName: name,
    ExamType: type,
    MinimumScore:
      type === 'Internal' ? newMinScoreIntern.value : newMinScoreExtern.value,
  });
  if (type === 'Internal') {
    newIntern.value = '';
    newMinScoreIntern.value = 50;
    addingIntern.value = false;
  } else {
    newExtern.value = '';
    newMinScoreExtern.value = 50;
    addingExtern.value = false;
  }
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
          <span class="detail-label">Externe Nummer</span>
          <span>{{ Module.ExternalModuleCode || '–' }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Modulnummer</span>
          <span>{{ Module.ModuleCode || '–' }}</span>
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
        <span v-if="examError" class="error exam-error">{{ examError }}</span>

        <div class="exam-section">
          <div class="detail-group-title">
            Interne Prüfungen ({{ internExams.length }}/5)
            <button
              v-if="!Module.IsDeleted"
              class="btn-add-exam"
              :disabled="internExams.length >= 5"
              @click="
                addingIntern = !addingIntern;
                examError = '';
              "
            >
              + Hinzufügen
            </button>
          </div>

          <div v-if="addingIntern" class="exam-add-row">
            <input
              v-model="newIntern"
              placeholder="Prüfungsname"
              @keydown.enter="addExam('Internal')"
            />
            <input
              v-model.number="newMinScoreIntern"
              type="number"
              min="0"
              class="exam-minscore-input"
              placeholder="Min. Punkte"
              title="Mindestpunktzahl"
            />
            <button class="btn-exam-save" @click="addExam('Internal')">
              ✓
            </button>
            <button
              class="btn-exam-cancel"
              @click="
                addingIntern = false;
                newIntern = '';
                newMinScoreIntern = 50;
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
            <span class="exam-name-text">{{ exam.ExamName }}</span>
            <span
              class="exam-minscore-badge"
              :title="'Mindestpunktzahl: ' + (exam.MinimumScore ?? '–')"
            >
              Min: {{ exam.MinimumScore ?? '–' }}
            </span>
          </div>
        </div>

        <div class="exam-section">
          <div class="detail-group-title">
            Externe Prüfungen ({{ externExams.length }}/5)
            <button
              v-if="!Module.IsDeleted"
              class="btn-add-exam"
              :disabled="externExams.length >= 5"
              @click="
                addingExtern = !addingExtern;
                examError = '';
              "
            >
              + Hinzufügen
            </button>
          </div>

          <div v-if="addingExtern" class="exam-add-row">
            <input
              v-model="newExtern"
              placeholder="Prüfungsname"
              @keydown.enter="addExam('External')"
            />
            <input
              v-model.number="newMinScoreExtern"
              type="number"
              min="0"
              class="exam-minscore-input"
              placeholder="Min. Punkte"
              title="Mindestpunktzahl"
            />
            <button class="btn-exam-save" @click="addExam('External')">
              ✓
            </button>
            <button
              class="btn-exam-cancel"
              @click="
                addingExtern = false;
                newExtern = '';
                newMinScoreExtern = 50;
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
            <span class="exam-name-text">{{ exam.ExamName }}</span>
            <span
              class="exam-minscore-badge"
              :title="'Mindestpunktzahl: ' + (exam.MinimumScore ?? '–')"
            >
              Min: {{ exam.MinimumScore ?? '–' }}
            </span>
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

.exam-name-text {
  flex: 1;
}

.exam-minscore-badge {
  font-size: 11px;
  color: var(--muted);
  margin-right: 6px;
  white-space: nowrap;
}

.exam-minscore-input {
  width: 80px;
  margin: 0 4px;
}

.exam-error {
  display: block;
  margin-bottom: 6px;
}
</style>
