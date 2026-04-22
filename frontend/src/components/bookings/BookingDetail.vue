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

// Module gruppiert nach Kurs
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
  <div v-if="Detail">
    <h3>Buchung Details</h3>

    <p><b>Buchungs-ID:</b> {{ Detail.BookingId }}</p>
    <p><b>Teilnehmer:</b> {{ Detail.ParticipantName }}</p>
    <p><b>Typ:</b> {{ Detail.BookingType }}</p>
    <p><b>Unterschrieben:</b> {{ Detail.IsSigned ? 'Ja' : 'Nein' }}</p>

    <hr />

    <p><b>Start (geplant):</b> {{ formatDate(Detail.PlannedStartDate) }}</p>
    <p><b>Ende (geplant):</b> {{ formatDate(Detail.PlannedEndDate) }}</p>
    <p><b>Start (tatsächlich):</b> {{ formatDate(Detail.ActualStartDate) }}</p>
    <p><b>Ende (tatsächlich):</b> {{ formatDate(Detail.ActualEndDate) }}</p>
    <p><b>Laufzeit:</b> {{ Detail.Duration || '-' }}</p>
    <p><b>Starttermin:</b> {{ Detail.StartTerm || '-' }}</p>

    <hr />

    <p><b>Bildungsziel:</b> {{ Detail.EducationalGoal || '-' }}</p>
    <p><b>Monatliche Rate:</b> {{ Detail.MonthlyRate || '-' }}</p>
    <p><b>Bemerkungen:</b> {{ Detail.Remarks || '-' }}</p>
    <p><b>Location:</b> {{ Detail.LocationName || '-' }}</p>

    <hr />

    <h4>Gebuchte Module</h4>

    <div v-if="!Detail.Modules?.length">
      <p>Keine Module gebucht.</p>
    </div>

    <div
      v-for="G in groupedModules()"
      :key="G.courseId ?? 'einzeln'"
      style="margin-bottom: 12px"
    >
      <p>
        <b>{{ G.courseName }}</b>
      </p>
      <ul>
        <li v-for="M in G.modules" :key="M.BookingModuleId">
          {{ M.ModuleCodeId }} — {{ M.ModuleName ?? M.ModuleCodeId }}
          <span v-if="M.SessionStartDate">
            ({{ formatDate(M.SessionStartDate) }} –
            {{ formatDate(M.SessionEndDate) }})
          </span>
        </li>
      </ul>
    </div>

    <hr />

    <button @click="emit('edit')">Bearbeiten</button>
    <button @click="emit('close')">Schließen</button>
  </div>

  <div v-else>
    <p>Lade...</p>
  </div>
</template>
