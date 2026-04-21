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
  <div class="form">
    <h3>{{ form.CourseId ? 'Kurs bearbeiten' : 'Neuen Kurs anlegen' }}</h3>

    <form @submit.prevent="submit">
      <div class="form-grid">
        <div class="form-group">
          <div class="form-group-title">Allgemein</div>
          <label>Zulassungsnummer</label>
          <input v-model="form.ApprovalNumber" />
          <label>Bezeichnung *</label>
          <input
            v-model="form.Name"
            :class="{ 'input-error': nameError }"
            @input="nameError = ''"
          />
          <span v-if="nameError" class="error">{{ nameError }}</span>
          <label>Berater</label>
          <input v-model="form.Advisor" />
        </div>

        <div class="form-group">
          <div class="form-group-title">Gültigkeit</div>
          <label>Gültig von</label>
          <input v-model="form.ApprovalStartDate" type="date" />
          <label>Gültig bis</label>
          <input v-model="form.ApprovalEndDate" type="date" />
        </div>

        <div class="form-group">
          <div class="form-group-title">Kosten & Zeiten</div>
          <label>Kosten/UE (€)</label>
          <input
            v-model.number="form.CostPerTeachingUnit"
            type="number"
            min="0"
            step="0.01"
          />
          <label>UE-Dauer (Min.)</label>
          <input
            v-model.number="form.TeachingUnitDuration"
            type="number"
            min="1"
          />
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

      <div class="form-actions">
        <button type="submit" class="btn-submit">Speichern</button>
        <button type="button" class="btn-cancel" @click="emit('cancel')">
          Abbrechen
        </button>
      </div>
    </form>
  </div>
</template>
