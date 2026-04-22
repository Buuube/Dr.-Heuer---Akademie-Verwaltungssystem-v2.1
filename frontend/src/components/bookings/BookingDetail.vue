<script setup>
import { ref, watch } from 'vue';
import { getBookingById } from '../../services/bookingService';

const props = defineProps({
  Booking: Object,
});
const emit = defineEmits(['edit', 'close']);

const Detail = ref(null);

const formatDate = (date) => {
  if (!date) return '-';
  return new Date(date).toISOString().slice(0, 10);
};

const groupedModules = () => {
  if (!Detail.value?.Modules?.length) return [];
  const groups = {};
  for (const M of Detail.value.Modules) {
    const key = M.CourseId ?? 'einzeln';
    if (!groups[key]) {
      groups[key] = {
        courseId: M.CourseId,
        courseName: M.CourseName ?? 'Einzelmodule',
        modules: [],
      };
    }
    groups[key].modules.push(M);
  }
  return Object.values(groups);
};

watch(
  () => props.Booking,
  async (Val) => {
    if (Val?.BookingId) {
      Detail.value = await getBookingById(Val.BookingId);
    } else {
      Detail.value = null;
    }
  },
  { immediate: true }
);
</script>

<template>
  <div v-if="Detail" class="detail-panel">
    <h3>Buchung Details</h3>

    <div class="detail-grid">
      <!-- Buchung -->
      <div class="detail-group">
        <div class="detail-group-title">Buchung</div>
        <div class="detail-row">
          <span class="detail-label">Booking-ID</span>
          <span>{{ Detail.BookingId }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Teilnehmer</span>
          <span>{{ Detail.ParticipantName }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Typ</span>
          <span>{{ Detail.BookingType || '-' }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Bildungsziel</span>
          <span>{{ Detail.EducationalGoal || '-' }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Starttermin</span>
          <span>{{ Detail.StartTerm || '-' }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Laufzeit</span>
          <span>{{ Detail.Duration || '-' }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Unterschrieben</span>
          <span>{{ Detail.IsSigned ? 'Ja' : 'Nein' }}</span>
        </div>
      </div>

      <!-- Zeitraum -->
      <div class="detail-group">
        <div class="detail-group-title">Zeitraum</div>
        <div class="detail-row">
          <span class="detail-label">Start (geplant)</span>
          <span>{{ formatDate(Detail.PlannedStartDate) }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Ende (geplant)</span>
          <span>{{ formatDate(Detail.PlannedEndDate) }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Start (tatsächlich)</span>
          <span>{{ formatDate(Detail.ActualStartDate) }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Ende (tatsächlich)</span>
          <span>{{ formatDate(Detail.ActualEndDate) }}</span>
        </div>
      </div>

      <!-- Finanzen -->
      <div class="detail-group">
        <div class="detail-group-title">Finanzen</div>
        <div class="detail-row">
          <span class="detail-label">Monatliche Rate</span>
          <span>{{ Detail.MonthlyRate || '-' }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Location</span>
          <span>{{ Detail.LocationName || '-' }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Bemerkungen</span>
          <span>{{ Detail.Remarks || '-' }}</span>
        </div>
      </div>

      <!-- Module -->
      <div class="detail-group">
        <div class="detail-group-title">Gebuchte Module</div>
        <div
          v-if="!Detail.Modules?.length"
          style="font-size: 13px; color: var(--muted)"
        >
          Keine Module gebucht.
        </div>
        <div
          v-for="G in groupedModules()"
          :key="G.courseId ?? 'einzeln'"
          style="margin-bottom: 10px"
        >
          <div
            style="
              font-size: 11px;
              font-weight: 600;
              color: var(--cyan);
              margin-bottom: 4px;
              text-transform: uppercase;
              letter-spacing: 1px;
            "
          >
            {{ G.courseName }}
          </div>
          <div
            v-for="M in G.modules"
            :key="M.BookingModuleId"
            style="font-size: 13px; color: var(--text); margin-bottom: 3px"
          >
            {{ M.ModuleCodeId }} — {{ M.ModuleName ?? M.ModuleCodeId }}
            <span
              v-if="M.SessionStartDate"
              style="color: var(--muted); font-size: 11px"
            >
              ({{ formatDate(M.SessionStartDate) }} –
              {{ formatDate(M.SessionEndDate) }})
            </span>
          </div>
        </div>
      </div>
    </div>

    <div class="detail-actions">
      <button class="btn-edit" @click="emit('edit')">Bearbeiten</button>
      <button class="btn-cancel" @click="emit('close')">Schließen</button>
    </div>
  </div>

  <div
    v-else
    class="detail-panel"
    style="padding: 20px; color: var(--muted); font-size: 13px"
  >
    Lade...
  </div>
</template>
