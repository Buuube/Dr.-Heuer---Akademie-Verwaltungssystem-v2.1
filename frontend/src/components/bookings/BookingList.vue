<script setup>
import { ref, computed, onMounted } from 'vue';
import { getBookings, deleteBooking } from '../../services/bookingService';
import { getParticipants } from '../../services/participantService';

const props = defineProps({
  OnEdit: Function,
  OnSelect: Function,
});

const Bookings = ref([]);
const Participants = ref([]);

// Filter
const FilterParticipantId = ref('');
const FilterSigned = ref('all'); // all | true | false
const FilterExpired = ref('all'); // all | active | expired

const Load = async () => {
  Bookings.value = await getBookings();
  Participants.value = await getParticipants();
};

onMounted(Load);

const Remove = async (Id) => {
  const confirmed = confirm('Möchten Sie diese Buchung wirklich löschen?');
  if (!confirmed) return;

  const reasonInput = prompt(
    'Stornierungsgrund-ID (leer lassen zum direkten Löschen):'
  );
  if (reasonInput === null) return; // Abbrechen gedrückt

  await deleteBooking(Id, reasonInput ? Number(reasonInput) : null);
  await Load();
};

// Laufzeit in Monaten berechnen
const calcDuration = (start, end) => {
  if (!start || !end) return '-';
  const s = new Date(start);
  const e = new Date(end);
  const months =
    (e.getFullYear() - s.getFullYear()) * 12 + (e.getMonth() - s.getMonth());
  return months > 0 ? `${months} Mon.` : '-';
};

const formatDate = (date) => {
  if (!date) return '-';
  return new Date(date).toISOString().slice(0, 10);
};

const today = new Date();

const FilteredBookings = computed(() => {
  return Bookings.value.filter((B) => {
    // Teilnehmer-Filter
    if (
      FilterParticipantId.value &&
      String(B.ParticipantId) !== String(FilterParticipantId.value)
    )
      return false;

    // Unterschrieben-Filter
    if (
      FilterSigned.value !== 'all' &&
      String(B.IsSigned) !== FilterSigned.value
    )
      return false;

    // Abgelaufen-Filter
    if (FilterExpired.value === 'active') {
      if (B.ActualEndDate && new Date(B.ActualEndDate) < today) return false;
    }
    if (FilterExpired.value === 'expired') {
      if (!B.ActualEndDate || new Date(B.ActualEndDate) >= today) return false;
    }
    return true;
  });
});
</script>

<template>
  <div>
    <h3>Buchungen</h3>

    <!-- FILTER-LEISTE -->
    <div class="toolbar">
      <select v-model="FilterParticipantId">
        <option value="">Alle Teilnehmer</option>
        <option
          v-for="P in Participants"
          :key="P.ParticipantId"
          :value="P.ParticipantId"
        >
          {{ P.FirstName }} {{ P.LastName }}
        </option>
      </select>

      <select v-model="FilterSigned">
        <option value="all">Alle (Unterschrift)</option>
        <option value="true">Unterschrieben</option>
        <option value="false">Nicht unterschrieben</option>
      </select>

      <select v-model="FilterExpired">
        <option value="all">Alle (Status)</option>
        <option value="active">Aktiv</option>
        <option value="expired">Abgelaufen</option>
      </select>
    </div>

    <table>
      <thead>
        <tr>
          <th>Booking ID</th>
          <th>Start (geplant)</th>
          <th>Start (tatsächlich)</th>
          <th>Ende (geplant)</th>
          <th>Ende (tatsächlich)</th>
          <th>Laufzeit</th>
          <th>Rate (mtl.)</th>
          <th>Bildungsziel</th>
          <th>Bemerkungen</th>
          <th>Aktionen</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="B in FilteredBookings" :key="B.BookingId">
          <td>{{ B.BookingId }}</td>
          <td>{{ formatDate(B.PlannedStartDate) }}</td>
          <td>{{ formatDate(B.ActualStartDate) }}</td>
          <td>{{ formatDate(B.PlannedEndDate) }}</td>
          <td>{{ formatDate(B.ActualEndDate) }}</td>
          <td>{{ B.Duration }}</td>
          <td>{{ B.MonthlyRate || '-' }}</td>
          <td>{{ B.EducationalGoal || '-' }}</td>
          <td>{{ B.Remarks || '-' }}</td>
          <td>
            <button class="btn-edit" @click="props.OnEdit(B)">
              Bearbeiten
            </button>
            <button class="btn-delete" @click="Remove(B.BookingId)">
              Löschen
            </button>
            <button class="btn-edit" @click="props.OnSelect(B)">Details</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
