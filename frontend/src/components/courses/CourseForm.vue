<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  course: Object,
});

const emit = defineEmits(['save', 'cancel']);

const empty = () => ({
  ApprovalNumber: '',
  Name: '',
  Advisor: '',
  ApprovalStartDate: '',
  ApprovalEndDate: '',
  CostPerTeachingUnit: '',
  TeachingUnitDuration: '',
  DailyTeachingHours: '',
});

const form = ref(empty());

watch(
  () => props.course,
  (val) => {
    form.value = val ? { ...val } : empty();
  },
  { immediate: true }
);

const submit = () => {
  emit('save', { ...form.value });
};
</script>

<template>
  <div class="form-card">
    <div class="form-header">
      <h3>{{ form.CourseId ? 'Kurs bearbeiten' : 'Neuen Kurs anlegen' }}</h3>
      <button class="btn-close" title="Abbrechen" @click="emit('cancel')">
        ✕
      </button>
    </div>

    <form @submit.prevent="submit">
      <div class="form-group">
        <label>Zulassungsnummer</label>
        <input v-model="form.ApprovalNumber" required />
      </div>
      <div class="form-group">
        <label>Bezeichnung</label>
        <input v-model="form.Name" required />
      </div>
      <div class="form-group">
        <label>Berater</label>
        <input v-model="form.Advisor" />
      </div>

      <hr />

      <div class="form-row">
        <div class="form-group">
          <label>Gültig von</label>
          <input v-model="form.ApprovalStartDate" type="date" required />
        </div>
        <div class="form-group">
          <label>Gültig bis</label>
          <input v-model="form.ApprovalEndDate" type="date" required />
        </div>
      </div>

      <hr />

      <div class="form-row">
        <div class="form-group">
          <label>Kosten/UE (€)</label>
          <input
            v-model.number="form.CostPerTeachingUnit"
            type="number"
            min="0"
            step="0.01"
          />
        </div>
        <div class="form-group">
          <label>UE-Dauer (Min.)</label>
          <input
            v-model.number="form.TeachingUnitDuration"
            type="number"
            min="1"
          />
        </div>
        <div class="form-group">
          <label>Std./Tag</label>
          <input
            v-model.number="form.DailyTeachingHours"
            type="number"
            min="0"
            max="24"
            step="0.5"
          />
        </div>
      </div>

      <div class="form-actions">
        <button type="submit" class="btn-save">Speichern</button>
      </div>
    </form>
  </div>
</template>

<style scoped>
.form-card {
  max-width: 560px;
}

.form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.btn-close {
  background: none;
  border: none;
  color: #e74c3c;
  font-size: 1.3em;
  cursor: pointer;
}

.btn-close:hover {
  opacity: 0.75;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 12px;
}

.form-group label {
  font-size: 0.85em;
  opacity: 0.75;
}

.form-group input {
  padding: 6px 10px;
  border-radius: 4px;
  border: 1px solid #444;
  background: #1a1a2e;
  color: inherit;
}

.form-row {
  display: flex;
  gap: 16px;
}

.form-row .form-group {
  flex: 1;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

.btn-save {
  padding: 6px 20px;
  background: #2ecc71;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.btn-save:hover {
  opacity: 0.85;
}
</style>
