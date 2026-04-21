<script setup>
import { ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { getModule, deleteModule } from '@/services/moduleService';

const router = useRouter();

const props = defineProps({
  Course: Object,
  editMode: Boolean,
});

const emit = defineEmits(['edit', 'save', 'cancel', 'delete', 'close']);

const modules = ref([]);

watch(
  () => props.Course,
  async (val) => {
    modules.value = val?.CourseId ? await getModule(val.CourseId) : [];
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

const showDeleteAllConfirm = ref(false);

const deleteAllModules = async () => {
  showDeleteAllConfirm.value = false;
  const failed = [];
  for (const mod of modules.value) {
    try {
      await deleteModule(mod.ModuleCode);
    } catch {
      failed.push(mod.ExternalModuleCode || mod.ModuleCode);
    }
  }
  modules.value = await getModule(props.Course.CourseId);
  if (failed.length > 0) {
    alert(
      `Folgende Module konnten nicht gelöscht werden (aktive Buchungen):\n${failed.join(', ')}`
    );
  }
};

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
  <div v-if="Course" class="detail-panel">
    <h3>Kurs Details</h3>

    <div class="detail-grid">
      <div class="detail-group">
        <div class="detail-group-title">Allgemein</div>
        <div class="detail-row">
          <span class="detail-label">Zulassungsnummer</span>
          <span>{{ Course.ApprovalNumber || '–' }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Bezeichnung</span>
          <span>{{ Course.Name || '–' }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Berater</span>
          <span>{{ Course.Advisor || '–' }}</span>
        </div>
      </div>

      <div class="detail-group">
        <div class="detail-group-title">Gültigkeit & Status</div>
        <div class="detail-row">
          <span class="detail-label">Gültig von</span>
          <span>{{ formatDate(Course.ApprovalStartDate) }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Gültig bis</span>
          <span>{{ formatDate(Course.ApprovalEndDate) }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Status</span>
          <span>
            <span v-if="Course.IsDeleted" class="badge-deactivated"
              >Deaktiviert</span
            >
            <span
              v-else
              :class="
                isActive(Course.ApprovalEndDate)
                  ? 'badge-active'
                  : 'badge-expired'
              "
            >
              {{ isActive(Course.ApprovalEndDate) ? 'Aktiv' : 'Abgelaufen' }}
            </span>
          </span>
        </div>
      </div>

      <div class="detail-group">
        <div class="detail-group-title">Kosten & Zeiten</div>
        <div class="detail-row">
          <span class="detail-label">Kosten/UE</span>
          <span>{{ formatCurrency(Course.CostPerTeachingUnit) }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">UE-Dauer</span>
          <span>{{ Course.TeachingUnitDuration }} Min.</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Std./Tag</span>
          <span>{{ Course.DailyTeachingHours }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Kosten/Tag</span>
          <span>{{ kostenProTag(Course) }}</span>
        </div>
      </div>

      <div class="detail-group">
        <div class="detail-group-title">
          Module ({{ modules.length }})
          <button
            class="btn-add-module"
            @click="
              router.push({
                path: '/modules',
                query: { courseId: Course.CourseId, openForm: true },
              })
            "
          >
            + Modul hinzufügen
          </button>
          <button
            v-if="modules.length > 0"
            class="btn-delete-modules"
            @click="showDeleteAllConfirm = true"
          >
            Alle löschen
          </button>
        </div>
        <div v-if="modules.length === 0" class="detail-row">
          <span>Keine Module vorhanden</span>
        </div>
        <div v-for="mod in modules" :key="mod.ModuleCode" class="detail-row">
          <span class="detail-label">{{
            mod.ExternalModuleCode || mod.ModuleCode
          }}</span>
          <span>{{ mod.Name }}</span>
        </div>
      </div>
    </div>

    <!-- Bestätigungs-Modal -->
    <div v-if="showDeleteAllConfirm" class="confirm-overlay">
      <div class="confirm-box">
        <p>Sind Sie sicher, alle Module löschen zu wollen?</p>
        <div class="confirm-actions">
          <button class="btn-submit" @click="deleteAllModules">
            Ja, alle löschen
          </button>
          <button class="btn-cancel" @click="showDeleteAllConfirm = false">
            Abbrechen
          </button>
        </div>
      </div>
    </div>

    <div class="detail-actions">
      <template v-if="editMode">
        <button class="btn-submit" @click="emit('save')">Speichern</button>
        <button class="btn-cancel" @click="emit('cancel')">Abbrechen</button>
      </template>
      <template v-else>
        <button v-if="!Course.IsDeleted" class="btn-edit" @click="emit('edit')">
          Bearbeiten
        </button>
        <button
          v-if="!Course.IsDeleted"
          class="btn-delete"
          @click="emit('delete')"
        >
          Löschen
        </button>
        <button class="btn-cancel" @click="emit('close')">Schließen</button>
      </template>
    </div>
  </div>
</template>

<style scoped>
.btn-add-module {
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

.btn-add-module:hover {
  box-shadow: 0 0 10px rgba(124, 247, 255, 0.25);
}

.btn-delete-modules {
  margin-left: 8px;
  padding: 2px 10px;
  border-radius: 8px;
  border: 1px solid rgba(255, 77, 109, 0.3);
  background: rgba(255, 77, 109, 0.08);
  color: #ff4d6d;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 1px;
  text-transform: uppercase;
  cursor: pointer;
  transition: box-shadow 0.2s;
}

.btn-delete-modules:hover {
  box-shadow: 0 0 10px rgba(255, 77, 109, 0.25);
}

.confirm-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: inherit;
  z-index: 10;
}

.confirm-box {
  background: var(--bg-panel, #1a1f2e);
  border: 1px solid rgba(124, 247, 255, 0.15);
  border-radius: 14px;
  padding: 28px 32px;
  max-width: 360px;
  text-align: center;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
}

.confirm-box p {
  margin: 0 0 20px;
  font-size: 14px;
  line-height: 1.5;
}

.confirm-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.badge-active {
  background: rgba(46, 204, 113, 0.15);
  color: #2ecc71;
  border: 1px solid rgba(46, 204, 113, 0.3);
  padding: 2px 10px;
  border-radius: 12px;
  font-size: 0.85em;
}

.badge-expired {
  background: rgba(231, 76, 60, 0.12);
  color: #ff4d6d;
  border: 1px solid rgba(255, 77, 109, 0.3);
  padding: 2px 10px;
  border-radius: 12px;
  font-size: 0.85em;
}

.badge-deactivated {
  background: rgba(120, 180, 255, 0.08);
  color: rgba(215, 230, 255, 0.5);
  border: 1px solid rgba(120, 180, 255, 0.15);
  padding: 2px 10px;
  border-radius: 12px;
  font-size: 0.85em;
}
</style>
