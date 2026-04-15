<script setup>
import { ref, computed, onMounted } from 'vue';
import { getBookings, deleteBooking } from '../../services/bookingService';

const props = defineProps({
  OnEdit: Function,
  OnSelect: Function,
});

const Bookings = ref([]);
const Search = ref('');

const Load = async () => {
  Bookings.value = await getBookings();
};

onMounted(Load);

const Remove = async (Id) => {
  await deleteBooking(Id);
  await Load();
};

const FilteredBookings = computed(() => {
  return Bookings.value.filter((B) => {
    const FullText = `${B.ParticipantName} ${B.StartDate}`.toLowerCase();
    return FullText.includes(Search.value.toLowerCase());
  });
});
</script>

<template>
  <div>
    <h3>Buchungen</h3>

    <div class="toolbar">
      <input v-model="Search" placeholder="Suche..." />
    </div>

    <table>
      <thead>
        <tr>
          <th>Teilnehmer</th>
          <th>Start</th>
          <th>Ende</th>
          <th>Storniert</th>
          <th>Aktionen</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="B in FilteredBookings" :key="B.Id">
          <td>{{ B.ParticipantName }}</td>
          <td>{{ B.StartDate }}</td>
          <td>{{ B.EndDate }}</td>
          <td>
            <span v-if="B.IsCancelled">✔</span>
            <span v-else>✖</span>
          </td>
          <td>
            <button class="btn-edit" @click="props.OnEdit(B)">
              Bearbeiten
            </button>
            <button class="btn-delete" @click="Remove(B.Id)">Löschen</button>
            <button class="btn-edit" @click="props.OnSelect(B)">Details</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
