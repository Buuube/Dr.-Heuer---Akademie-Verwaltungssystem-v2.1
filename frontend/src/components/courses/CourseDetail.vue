<script setup>
import { ref, watch } from 'vue';
import { getModules } from '@/services/moduleService';

const props = defineProps({
  Course: Object,
  editMode: Boolean,
});

const emit = defineEmits(['edit', 'save', 'cancel', 'delete', 'close']);

const modules = ref([]);

watch(
  () => props.Course,
  async (val) => {
    if (val?.CourseId) {
      modules.value = await getModules(val.CourseId);
    } else {
      modules.value = [];
    }
  },
  { immediate: true }
);

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
      <div class="header-actions">
        <template v-if="editMode">
          <button class="btn-save" @click="emit('save')">Speichern</button>
          <button class="btn-cancel" @click="emit('cancel')">Abbrechen</button>
        </template>
        <template v-else-if="!Course.IsDeleted">
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
        </template>
        <button
          v-if="!editMode"
          class="btn-close"
          title="Schließen"
          @click="emit('close')"
        >
          ✕
        </button>
      </div>
    </div>

    <p><b>Zertifizierungsnummer:</b> {{ Course.ApprovalNumber }}</p>
    <p><b>Bezeichnung:</b> {{ Course.Name }}</p>
    <p><b>Berater:</b> {{ Course.Advisor }}</p>

    <hr />

    <p><b>Gültig von:</b> {{ formatDate(Course.ApprovalStartDate) }}</p>
    <p><b>Gültig bis:</b> {{ formatDate(Course.ApprovalEndDate) }}</p>
    <p>
      <b>Status:</b>
      <span v-if="Course.IsDeleted" class="badge-deactivated">Deaktiviert</span>
      <span
        v-else
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

    <hr />

    <h4 class="modules-heading">Module</h4>
    <p v-if="modules.length === 0" class="modules-empty">
      Keine Module vorhanden.
    </p>
    <table v-else class="modules-table">
      <thead>
        <tr>
          <th>Ext. Nummer</th>
          <th>Name</th>
          <th>Dauer</th>
          <th>Kosten</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="mod in modules" :key="mod.ModuleCode">
          <td>{{ mod.ExternalModuleCode }}</td>
          <td>{{ mod.Name }}</td>
          <td>{{ mod.Duration }}</td>
          <td>{{ formatCurrency(mod.EstimatedCost) }}</td>
        </tr>
      </tbody>
    </table>
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

.badge-deactivated {
  background: #95a5a6;
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

.header-actions {
  display: flex;
  align-items: center;
  gap: 4px;
}

.btn-save {
  padding: 4px 14px;
  background: #2ecc71;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9em;
}

.btn-save:hover {
  opacity: 0.85;
}

.btn-cancel {
  padding: 4px 14px;
  background: none;
  border: 1px solid #666;
  border-radius: 4px;
  color: inherit;
  cursor: pointer;
  font-size: 0.9em;
}

.btn-cancel:hover {
  border-color: #aaa;
}

.btn-icon {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.2em;
  padding: 2px 6px;
}

.modules-heading {
  margin: 0 0 8px 0;
}

.modules-empty {
  font-size: 0.85em;
  opacity: 0.6;
}

.modules-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.85em;
}

.modules-table th,
.modules-table td {
  text-align: left;
  padding: 4px 8px;
  border-bottom: 1px solid #333;
}

.modules-table th {
  opacity: 0.65;
  font-weight: 600;
}
</style>
