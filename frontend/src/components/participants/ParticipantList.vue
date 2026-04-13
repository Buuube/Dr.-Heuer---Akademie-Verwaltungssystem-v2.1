<script setup>
import { ref, computed, onMounted } from 'vue';
import {
  getParticipants,
  deleteParticipant,
} from '../../services/participantService';

const props = defineProps({
  onEdit: Function,
});

const participants = ref([]);
const search = ref('');
const filterEmployed = ref('all'); // all | true | false

const load = async () => {
  participants.value = await getParticipants();
};

onMounted(load);

const remove = async (id) => {
  await deleteParticipant(id);
  await load();
};

const filteredParticipants = computed(() => {
  return participants.value.filter((p) => {
    const fullText = `${p.firstName} ${p.lastName} ${p.email}`.toLowerCase();

    const matchesSearch = fullText.includes(search.value.toLowerCase());

    const matchesFilter =
      filterEmployed.value === 'all' ||
      String(p.isEmployed) === filterEmployed.value;

    return matchesSearch && matchesFilter;
  });
});
</script>

<template>
  <div>
    <h3>Teilnehmer Liste</h3>

    <!-- SEARCH + FILTER -->
    <div class="toolbar">
      <input v-model="search" placeholder="Suche..." />

      <select v-model="filterEmployed">
        <option value="all">Alle</option>
        <option value="true">Beschäftigt</option>
        <option value="false">Nicht beschäftigt</option>
      </select>
    </div>

    <!-- TABLE -->
    <table border="1" cellpadding="8">
      <thead>
        <tr>
          <th>Anrede</th>
          <th>Vorname</th>
          <th>Nachname</th>
          <th>E-Mail</th>
          <th>Telefon</th>
          <th>Mobil</th>
          <th>PLZ</th>
          <th>Beschäftigt</th>
          <th>Aktionen</th>
        </tr>
      </thead>

      <tbody>
        <tr v-for="p in filteredParticipants" :key="p.id">
          <td>{{ p.salutation === 0 ? 'Herr' : 'Frau' }}</td>
          <td>{{ p.firstName }}</td>
          <td>{{ p.lastName }}</td>
          <td>{{ p.email }}</td>
          <td>{{ p.phone }}</td>
          <td>{{ p.mobile }}</td>
          <td>{{ p.postalCodeId }}</td>
          <td>
            <span v-if="p.isEmployed">✔</span>
            <span v-else>✖</span>
          </td>

          <td>
            <button class="btn-edit" @click="props.onEdit(p)">
              Bearbeiten
            </button>
            <button class="btn-delete" @click="remove(p.id)">Löschen</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
