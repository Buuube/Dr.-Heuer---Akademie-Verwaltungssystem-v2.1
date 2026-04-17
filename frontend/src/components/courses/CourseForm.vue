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
  DailyTeachingHours: 8.0,
});

const form = ref(empty());

const toDateInput = (val) => (val ? val.substring(0, 10) : '');

watch(
  () => props.course,
  (val) => {
    if (!val) {
      form.value = empty();
    } else {
      form.value = {
        ...val,
        ApprovalStartDate: toDateInput(val.ApprovalStartDate),
        ApprovalEndDate: toDateInput(val.ApprovalEndDate),
      };
    }
  },
  { immediate: true }
);

const nameError = ref('');

const submit = () => {
  if (!form.value.Name || !form.value.Name.trim()) {
    nameError.value = 'Bezeichnung ist erforderlich.';
    return;
  }
  nameError.value = '';
  emit('save', { ...form.value });
};

defineExpose({ submitForm: submit });
</script>

<template>
  <div class="form-card">
    <div class="form-header">
      <h3>{{ form.CourseId ? 'Kurs bearbeiten' : 'Neuen Kurs anlegen' }}</h3>
    </div>

    <form @submit.prevent="submit">
      <div class="form-group">
        <label>Zulassungsnummer</label>
        <input v-model="form.ApprovalNumber" />
      </div>
      <div class="form-group">
        <label>Bezeichnung *</label>
        <input
          v-model="form.Name"
          :class="{ 'input-error': nameError }"
          @input="nameError = ''"
        />
        <span v-if="nameError" class="error-msg">{{ nameError }}</span>
      </div>
      <div class="form-group">
        <label>Berater</label>
        <input v-model="form.Advisor" />
      </div>

      <hr />

      <div class="form-row">
        <div class="form-group">
          <label>Gültig von</label>
          <input v-model="form.ApprovalStartDate" type="date" />
        </div>
        <div class="form-group">
          <label>Gültig bis</label>
          <input v-model="form.ApprovalEndDate" type="date" />
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
            min="0.5"
            max="24"
            step="0.5"
            required
          />
        </div>
      </div>
    </form>
  </div>
</template>

<style scoped>
.form-card {
  width: 100%;
}

.form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
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

.input-error {
  border-color: #e74c3c !important;
}

.error-msg {
  color: #e74c3c;
  font-size: 0.8em;
}

.form-row {
  display: flex;
  gap: 16px;
}

.form-row .form-group {
  flex: 1;
}
</style>
