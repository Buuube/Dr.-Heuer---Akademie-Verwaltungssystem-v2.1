<script setup>
const props = defineProps({
  Course: Object,
});

const emit = defineEmits(['edit', 'close']);

const formatDate = (date) =>
  new Date(date).toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

const formatCurrency = (value) =>
  Number(value).toLocaleString('de-DE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }) + ' €';

const isActive = (endDate) => new Date(endDate) >= new Date();

const kostenProTag = (course) => {
  if (
    !course.CostPerTeachingUnit ||
    !course.DailyTeachingHours ||
    !course.TeachingUnitDuration
  )
    return '–';
  const unitsPerDay =
    (course.DailyTeachingHours * 60) / course.TeachingUnitDuration;
  return formatCurrency(course.CostPerTeachingUnit * unitsPerDay);
};
</script>

<template>
  <div v-if="Course" class="detail-card">
    <div class="detail-header">
      <h3>Kurs Details</h3>
      <button class="btn-close" title="Schließen" @click="emit('close')">
        ✕
      </button>
    </div>

    <p><b>Zertifizierungsnummer:</b> {{ Course.ApprovalNumber }}</p>
    <p><b>Bezeichnung:</b> {{ Course.Name }}</p>
    <p><b>Berater:</b> {{ Course.Advisor }}</p>

    <hr />

    <p><b>Gültig von:</b> {{ formatDate(Course.ApprovalStartDate) }}</p>
    <p><b>Gültig bis:</b> {{ formatDate(Course.ApprovalEndDate) }}</p>
    <p>
      <b>Status:</b>
      <span
        :class="
          isActive(Course.ApprovalEndDate) ? 'badge-active' : 'badge-expired'
        "
      >
        {{ isActive(Course.ApprovalEndDate) ? 'Aktiv' : 'Abgelaufen' }}
      </span>
    </p>

    <hr />

    <p><b>Kosten/UE:</b> {{ formatCurrency(Course.CostPerTeachingUnit) }}</p>
    <p><b>UE-Dauer:</b> {{ Course.TeachingUnitDuration }} Min.</p>
    <p><b>Std./Tag:</b> {{ Course.DailyTeachingHours }}</p>
    <p><b>Kosten/Tag:</b> {{ kostenProTag(Course) }}</p>

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
.badge-active {
  background: #2ecc71;
  color: white;
  padding: 2px 10px;
  border-radius: 12px;
  font-size: 0.85em;
  margin-left: 6px;
}

.badge-expired {
  background: #e74c3c;
  color: white;
  padding: 2px 10px;
  border-radius: 12px;
  font-size: 0.85em;
  margin-left: 6px;
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
