<script setup>
import { ref, watch } from 'vue';
import { getExams } from '@/services/moduleExamService';

const props = defineProps({
  Module: Object,
});

const emit = defineEmits(['edit', 'close']);

const formatCurrency = (value) =>
  Number(value).toLocaleString('de-DE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }) + ' €';

const exams = ref([]);

watch(
  () => props.Module,
  async (mod) => {
    if (!mod) return;
    try {
      exams.value = await getExams(mod.ModuleCode);
    } catch {
      exams.value = [];
    }
  },
  { immediate: true }
);

const internExams = () => exams.value.filter((e) => e.ExamType === 'intern');
const externExams = () => exams.value.filter((e) => e.ExamType === 'extern');
</script>

<template>
  <div v-if="Module" class="detail-card">
    <div class="detail-header">
      <h3>Modul Details</h3>
      <button class="btn-close" title="Schließen" @click="emit('close')">
        ✕
      </button>
    </div>

    <p><b>Modulnummer:</b> {{ Module.ModuleCode }}</p>
    <p><b>Externe Nummer:</b> {{ Module.ExternalModuleCode }}</p>
    <p><b>Name:</b> {{ Module.Name }}</p>

    <hr />

    <p><b>Dauer:</b> {{ Module.Duration }} Std.</p>
    <p><b>Kosten:</b> {{ formatCurrency(Module.EstimatedCost) }}</p>
    <p><b>Std./Tag:</b> {{ Module.DailyTeachingHours }}</p>
    <p><b>Unterrichtsformat:</b> {{ Module.TeachingFormat || '–' }}</p>
    <p><b>Praktikum:</b> {{ Module.HasInternship ? 'Ja' : 'Nein' }}</p>

    <hr />

    <p><b>Interne Prüfungen:</b> {{ internExams().length }}</p>
    <ul v-if="internExams().length">
      <li v-for="exam in internExams()" :key="exam.ModuleExamId">
        {{ exam.ExamName }}
      </li>
    </ul>

    <p><b>Externe Prüfungen:</b> {{ externExams().length }}</p>
    <ul v-if="externExams().length">
      <li v-for="exam in externExams()" :key="exam.ModuleExamId">
        {{ exam.ExamName }}
      </li>
    </ul>

    <div class="detail-actions">
      <button class="btn-icon" title="Bearbeiten" @click="emit('edit')">
        ✏️
      </button>
      <button
        class="btn-icon btn-icon--delete"
        title="Löschen"
        @click="emit('delete')"
      >
        🗑️
      </button>
    </div>
  </div>
</template>

<style scoped>
.detail-card {
  position: relative;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.btn-close {
  background: none;
  border: none;
  color: #e74c3c;
  font-size: 1.3em;
  cursor: pointer;
  line-height: 1;
}

.btn-close:hover {
  opacity: 0.75;
}

.detail-actions {
  display: flex;
  justify-content: flex-end;
  gap: 6px;
  margin-top: 12px;
}

.btn-icon {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.2em;
  padding: 2px 6px;
}
</style>
