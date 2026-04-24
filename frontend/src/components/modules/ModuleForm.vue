<script setup>
import { ref, watch, onMounted, computed } from 'vue';
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
  async (val) => {
    form.value = val ? { ...empty(), ...val } : empty();
    exams.value = val?.ModuleCodeId ? await getExams(val.ModuleCodeId) : [];
  },
  { immediate: true }
);

const internCount = computed(
  () => exams.value.filter((e) => e.ExamType === 'Internal').length
);
const externCount = computed(
  () => exams.value.filter((e) => e.ExamType === 'External').length
);

const addExam = () => exams.value.push({ ExamName: '', ExamType: 'Internal' });
const removeExam = (i) => exams.value.splice(i, 1);

const errors = ref({});

const validate = () => {
  errors.value = {};
  if (!form.value.CourseId) errors.value.CourseId = 'Pflichtfeld';
  if (!form.value.TeachingFormatId)
    errors.value.TeachingFormatId = 'Pflichtfeld';
  if (!form.value.Content?.trim()) errors.value.Content = 'Pflichtfeld';
  if (internCount.value > 5)
    errors.value.exams = 'Maximal 5 interne Prüfungen erlaubt.';
  if (externCount.value > 5)
    errors.value.exams = 'Maximal 5 externe Prüfungen erlaubt.';
  if (exams.value.some((e) => !e.ExamName.trim()))
    errors.value.exams = 'Prüfungen benötigen einen Namen.';
  return Object.keys(errors.value).length === 0;
};

const submit = () => {
  if (!validate()) return;
  emit('save', {
    ...form.value,
    exams: exams.value,
  });
};
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

          <label>Kurs <span class="required">*</span></label>
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

          <label>Unterrichtsformat <span class="required">*</span></label>
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

          <label class="checkbox">
            <input type="checkbox" v-model="form.HasInternship" />
            Praktikum enthalten
          </label>
        </div>

        <div class="form-group">
          <div class="form-group-title">Inhalt</div>

          <label>Curriculum <span class="required">*</span></label>
          <textarea
            v-model="form.Content"
            rows="6"
            :class="{ 'input-error': errors.Content }"
            @input="delete errors.Content"
          ></textarea>
          <span v-if="errors.Content" class="error">{{ errors.Content }}</span>
        </div>

        <div class="form-group form-group--exams">
          <div class="form-group-title">
            Prüfungen
            <button
              type="button"
              class="btn-add-exam"
              :disabled="internCount >= 5 && externCount >= 5"
              @click="addExam"
            >
              + Hinzufügen
            </button>
          </div>

          <div class="exam-limits">
            Intern {{ internCount }}/5 &nbsp;|&nbsp; Extern {{ externCount }}/5
          </div>
          <span v-if="errors.exams" class="error">{{ errors.exams }}</span>

          <div v-if="exams.length > 0" class="exam-header">
            <span class="exam-header-name"
              >Prüfungsname <span class="required">*</span></span
            >
            <span class="exam-header-type">Typ</span>
            <span class="exam-header-score">Min. Punkteanzahl</span>
          </div>

          <div v-if="exams.length === 0" class="exam-empty">
            Keine Prüfungen
          </div>

          <div v-for="(exam, i) in exams" :key="i" class="exam-row">
            <input
              v-model="exam.ExamName"
              placeholder="Prüfungsname"
              class="exam-name"
              :class="{ 'input-error': errors.exams && !exam.ExamName.trim() }"
              maxlength="150"
            />
            <select v-model="exam.ExamType" class="exam-type">
              <option value="Internal">Intern</option>
              <option value="External">Extern</option>
            </select>
            <input
              v-model.number="exam.MinimumScore"
              type="number"
              min="0"
              class="exam-minscore"
              placeholder="50"
              title="Min. Punktzahl"
            />
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

.form-group--exams {
  grid-column: span 2;
}

.exam-header {
  display: flex;
  gap: 6px;
  align-items: center;
  margin-bottom: 2px;
  padding: 0 2px;
}

.exam-header-name {
  flex: 1;
  font-size: 11px;
  color: var(--muted);
}

.exam-header-type {
  flex: 0 0 65px;
  font-size: 11px;
  color: var(--muted);
}

.exam-header-score {
  flex: 0 0 55px;
  font-size: 11px;
  color: var(--muted);
  white-space: nowrap;
}

.exam-row {
  display: flex;
  gap: 6px;
  align-items: center;
  margin-bottom: 6px;
}

.exam-name {
  flex: 1;
  min-width: 0;
}

.exam-type {
  flex: 0 0 80px;
}

.exam-minscore {
  flex: 0 0 56px;
}

.exam-limits {
  font-size: 11px;
  color: var(--muted);
  margin-bottom: 4px;
}
</style>
