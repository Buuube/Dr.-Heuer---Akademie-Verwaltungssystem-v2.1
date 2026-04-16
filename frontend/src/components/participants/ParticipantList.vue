<script setup>
import { ref, computed, onMounted } from 'vue';
import { getParticipants } from '../../services/participantService';

const props = defineProps({
  onEdit: Function,
  onSelect: Function,
  onDelete: Function,
});

const Participants = ref([]);
const Search = ref('');
const FilterEmployed = ref('all');

const Load = async () => {
  try {
    const result = await getParticipants();
    Participants.value = Array.isArray(result) ? result : [];
  } catch (e) {
    console.error('Fehler beim Laden der Teilnehmer:', e);
    Participants.value = [];
  }
};

onMounted(Load);

const FilteredParticipants = computed(() => {
  return Participants.value.filter((P) => {
    const FullText = `${P.FirstName} ${P.LastName} ${P.Email}`.toLowerCase();
    const MatchesSearch = FullText.includes(Search.value.toLowerCase());
    const MatchesFilter =
      FilterEmployed.value === 'all' ||
      String(P.IsEmployed) === FilterEmployed.value;
    return MatchesSearch && MatchesFilter;
  });
});
</script>

<template>
  <div>
    <h3>Teilnehmer Liste</h3>

    <div class="toolbar">
      <input v-model="Search" placeholder="Suche..." />
      <select v-model="FilterEmployed">
        <option value="all">Alle</option>
        <option value="true">Beschäftigt</option>
        <option value="false">Nicht beschäftigt</option>
      </select>
    </div>

    <table>
      <thead>
        <tr>
          <th>Anrede</th>
          <th>Vorname</th>
          <th>Nachname</th>
          <th>E-Mail</th>
          <th>Telefon</th>
          <th>Mobil</th>
          <th>PLZ</th>
          <th>Ort</th>
          <th>Beschäftigt</th>
          <th>Aktionen</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="P in FilteredParticipants" :key="P.ParticipantId || P.Id">
          <td>
            {{ P.Salutation === false || P.Salutation === 0 ? 'Herr' : 'Frau' }}
          </td>
          <td>{{ P.FirstName }}</td>
          <td>{{ P.LastName }}</td>
          <td>{{ P.Email }}</td>
          <td>{{ P.Phone }}</td>
          <td>{{ P.Mobile }}</td>
          <td>{{ P.PostalCode?.Code }}</td>
          <td>{{ P.PostalCode?.City }}</td>
          <td>
            <span v-if="P.IsEmployed">✔</span>
            <span v-else>✖</span>
          </td>
          <td>
            <!-- Ganzes Objekt P übergeben, nicht nur ID -->
            <button class="btn-edit" @click="props.onEdit?.(P)">
              Bearbeiten
            </button>
            <button class="btn-detail" @click="props.onSelect?.(P)">
              Details
            </button>
            <button class="btn-delete" @click="props.onDelete?.(P)">
              Löschen
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
