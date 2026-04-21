<script setup>
import { ref, watch, onMounted } from 'vue';
import { getCourses } from '@/services/courseService';
import { getExams } from '@/services/moduleExamService';
import { getTeachingFormats } from '@/services/teachingFormatService';

const props = defineProps({
  module: Object,
});

const emit = defineEmits(['save', 'cancel']);
const teachingFormats = ref([]);
const courses = ref([]);
const exams = ref([]);

onMounted(async () => {
  courses.value = await getCourses();
  teachingFormats.value = await getTeachingFormats();
});

watch(
  () => props.module,
  async (val) => {
    if (val?.ModuleCode) {
      exams.value = await getExams(val.ModuleCode);
    } else {
      exams.value = [];
    }
  },
  { immediate: true }
);

const addExam = () => exams.value.push({ ExamName: '', ExamType: 'intern' });
const removeExam = (i) => exams.value.splice(i, 1);

const empty = () => ({
  ExternalModuleCode: '',
  Name: '',
  CourseId: '',
  TeachingFormatId: '',
  Content: '',
  EstimatedCost: '',
  Duration: '',
  HasInternship: false,
  DailyTeachingHours: 9.0,
});

const form = ref(empty());

watch(
  () => props.module,
  (val) => {
    form.value = val ? { ...empty(), ...val } : empty();
  },
  { immediate: true }
);

const errors = ref({});

const validate = () => {
  errors.value = {};
  if (!form.value.CourseId) errors.value.CourseId = 'Pflichtfeld';
  if (!form.value.TeachingFormatId)
    errors.value.TeachingFormatId = 'Pflichtfeld';
  return Object.keys(errors.value).length === 0;
};

const submit = () => {
  if (!validate()) return;
  emit('save', {
    ...form.value,
    exams: exams.value.filter((e) => e.ExamName.trim()),
  });
};

defineExpose({ submitForm: submit });
</script>

<template>
  <div class="form">
    <h3>{{ props.module ? 'Modul bearbeiten' : 'Neues Modul anlegen' }}</h3>

    <form @submit.prevent="submit">
      <div class="form-grid">
        <div class="form-group">
          <div class="form-group-title">Allgemein</div>

          <label>Externe Nummer</label>
          <input v-model="form.ExternalModuleCode" maxlength="50" />

          <label>Name</label>
          <input v-model="form.Name" maxlength="150" />

          <label>Kurs *</label>
          <select
            v-model="form.CourseId"
            :class="{ 'input-error': errors.CourseId }"
            @change="delete errors.CourseId"
          >
            <option value="" disabled>– Kurs wählen –</option>
            <option v-for="c in courses" :key="c.CourseId" :value="c.CourseId">
              {{ c.ApprovalNumber }} – {{ c.Name }}
            </option>
          </select>
          <span v-if="errors.CourseId" class="error">{{
            errors.CourseId
          }}</span>
        </div>
        <div class="form-group">
          <div class="form-group-title">Format & Inhalt</div>

          <label>Unterrichtsformat *</label>
          <select
            v-model="form.TeachingFormatId"
            :class="{ 'input-error': errors.TeachingFormatId }"
            @change="delete errors.TeachingFormatId"
          >
            <option value="" disabled>– Format wählen –</option>
            <option
              v-for="f in teachingFormats"
              :key="f.TeachingFormatId"
              :value="f.TeachingFormatId"
            >
              {{ f.Name }}
            </option>
          </select>
          <span v-if="errors.TeachingFormatId" class="error">{{
            errors.TeachingFormatId
          }}</span>
          <span class="field-hint"
            >1 – Präsenzunterricht<br />2 – Hybrid<br />3 – Homeoffice</span
          >

          <label class="checkbox">
            <input type="checkbox" v-model="form.HasInternship" />
            Praktikum enthalten
          </label>
        </div>

        <div class="form-group">
          <div class="form-group-title">Inhalt</div>

          <label>Curriculum</label>
          <textarea v-model="form.Content" rows="6"></textarea>
        </div>

        <div class="form-group">
          <div class="form-group-title">
            Prüfungen
            <button type="button" class="btn-add-exam" @click="addExam">
              + Hinzufügen
            </button>
          </div>

          <div v-if="exams.length === 0" class="exam-empty">
            Keine Prüfungen
          </div>

          <div v-for="(exam, i) in exams" :key="i" class="exam-row">
            <input
              v-model="exam.ExamName"
              placeholder="Prüfungsname"
              class="exam-name"
              maxlength="100"
            />
            <select v-model="exam.ExamType" class="exam-type">
              <option value="intern">Intern</option>
              <option value="extern">Extern</option>
            </select>
            <button
              type="button"
              class="btn-remove-exam"
              @click="removeExam(i)"
            >
              ✕
            </button>
          </div>
        </div>

        <div class="form-group">
          <div class="form-group-title">Zeiten & Kosten</div>

          <label>Dauer</label>
          <input
            v-model="form.Duration"
            placeholder="z.B. 20 Tage"
            maxlength="50"
          />

          <label>Geschätzte Kosten (€)</label>
          <input
            v-model.number="form.EstimatedCost"
            type="number"
            min="0"
            step="0.01"
          />

          <label>Std./Tag</label>
          <input
            v-model.number="form.DailyTeachingHours"
            type="number"
            min="0.1"
            max="24"
            step="0.1"
          />
        </div>
      </div>

      <div class="form-actions">
        <button type="submit" class="btn-submit">Speichern</button>
        <button type="button" class="btn-cancel" @click="emit('cancel')">
          Abbrechen
        </button>
      </div>
    </form>
  </div>
</template>

<style scoped>
textarea {
  width: 100%;
  padding: 8px 10px;
  margin: 3px 0 4px;
  border-radius: 10px;
  border: 1px solid var(--border-input);
  background: var(--bg-input);
  color: var(--text);
  outline: none;
  box-sizing: border-box;
  font-size: 13px;
  font-family: inherit;
  resize: vertical;
  transition:
    border-color 0.25s,
    box-shadow 0.25s;
}

textarea:focus {
  border-color: var(--cyan);
  box-shadow: 0 0 15px rgba(124, 247, 255, 0.25);
}

.field-hint {
  display: block;
  font-size: 10px;
  color: var(--muted);
  margin-top: 4px;
  line-height: 1.6;
  letter-spacing: 0.3px;
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

.exam-empty {
  font-size: 12px;
  color: var(--muted);
  margin: 6px 0;
}

.exam-row {
  display: flex;
  gap: 6px;
  align-items: center;
  margin-bottom: 6px;
}

.exam-name {
  flex: 1;
}

.exam-type {
  width: 90px;
  flex-shrink: 0;
}

.btn-remove-exam {
  background: transparent;
  border: none;
  color: var(--muted);
  cursor: pointer;
  font-size: 13px;
  padding: 2px 4px;
  line-height: 1;
  transition: color 0.2s;
}

.btn-remove-exam:hover {
  color: #ff4d6d;
}
</style>
