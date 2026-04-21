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

const errors = ref({});

const clampDecimals = (field, decimals, max) => {
  const val = form.value[field];
  if (val === '' || val === null) return;
  const str = String(val);
  const dot = str.indexOf('.');
  if (dot !== -1 && str.length - dot - 1 > decimals) {
    form.value[field] = parseFloat(val.toFixed(decimals));
  }
  if (max !== undefined && Number(val) > max) {
    form.value[field] = max;
  }
};

const validate = () => {
  errors.value = {};

  if (!form.value.Name?.trim()) errors.value.Name = 'Pflichtfeld';

  if (form.value.ApprovalNumber && form.value.ApprovalNumber.length > 30)
    errors.value.ApprovalNumber = 'Maximal 30 Zeichen';

  if (form.value.Name && form.value.Name.length > 100)
    errors.value.Name = 'Maximal 100 Zeichen';

  if (form.value.Advisor && form.value.Advisor.length > 100)
    errors.value.Advisor = 'Maximal 100 Zeichen';

  if (
    form.value.TeachingUnitDuration &&
    form.value.TeachingUnitDuration.toString().length > 100
  )
    errors.value.TeachingUnitDuration = 'Maximal 100 Zeichen';

  if (
    form.value.CostPerTeachingUnit !== '' &&
    form.value.CostPerTeachingUnit !== null
  ) {
    const cost = Number(form.value.CostPerTeachingUnit);
    if (isNaN(cost) || cost < 0)
      errors.value.CostPerTeachingUnit = 'Muss eine positive Zahl sein';
    else if (cost >= 100000000)
      errors.value.CostPerTeachingUnit = 'Max. 8 Vorkommastellen (10,2)';
    else if (Math.round(cost * 100) / 100 !== cost)
      errors.value.CostPerTeachingUnit = 'Max. 2 Nachkommastellen';
  }

  if (
    form.value.DailyTeachingHours === '' ||
    form.value.DailyTeachingHours === null
  ) {
    errors.value.DailyTeachingHours = 'Pflichtfeld';
  } else {
    const hours = Number(form.value.DailyTeachingHours);
    if (isNaN(hours) || hours < 0.1)
      errors.value.DailyTeachingHours = 'Muss mindestens 0.1 sein';
    else if (hours > 24) errors.value.DailyTeachingHours = 'Max. 24 Stunden';
    else if (Math.round(hours * 10) / 10 !== hours)
      errors.value.DailyTeachingHours = 'Max. 1 Nachkommastelle';
  }

  return Object.keys(errors.value).length === 0;
};

const submit = () => {
  if (!validate()) return;
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
          <input
            v-model="form.ApprovalNumber"
            maxlength="30"
            :class="{ 'input-error': errors.ApprovalNumber }"
            @input="delete errors.ApprovalNumber"
          />
          <span v-if="errors.ApprovalNumber" class="error">{{
            errors.ApprovalNumber
          }}</span>

          <label>Bezeichnung <span class="required">*</span></label>
          <input
            v-model="form.Name"
            maxlength="100"
            :class="{ 'input-error': errors.Name }"
            @input="delete errors.Name"
          />
          <span v-if="errors.Name" class="error">{{ errors.Name }}</span>

          <label>Berater</label>
          <input
            v-model="form.Advisor"
            maxlength="100"
            :class="{ 'input-error': errors.Advisor }"
            @input="delete errors.Advisor"
          />
          <span v-if="errors.Advisor" class="error">{{ errors.Advisor }}</span>
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
            max="99999999.99"
            step="0.01"
            :class="{ 'input-error': errors.CostPerTeachingUnit }"
            @input="
              clampDecimals('CostPerTeachingUnit', 2, 99999999.99);
              delete errors.CostPerTeachingUnit;
            "
          />
          <span v-if="errors.CostPerTeachingUnit" class="error">{{
            errors.CostPerTeachingUnit
          }}</span>

          <label>UE-Dauer</label>
          <input
            v-model="form.TeachingUnitDuration"
            maxlength="100"
            :class="{ 'input-error': errors.TeachingUnitDuration }"
            @input="delete errors.TeachingUnitDuration"
          />
          <span v-if="errors.TeachingUnitDuration" class="error">{{
            errors.TeachingUnitDuration
          }}</span>

          <label>Std./Tag <span class="required">*</span></label>
          <input
            v-model.number="form.DailyTeachingHours"
            type="number"
            min="0.1"
            max="24"
            step="0.1"
            :class="{ 'input-error': errors.DailyTeachingHours }"
            @input="
              clampDecimals('DailyTeachingHours', 1, 24);
              delete errors.DailyTeachingHours;
            "
          />
          <span v-if="errors.DailyTeachingHours" class="error">{{
            errors.DailyTeachingHours
          }}</span>
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
