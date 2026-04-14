<script setup>
// this file is the participant list component
// it fetches all participants from the backend and displays them in a table
// it also handles search and filter functionality

// ref = a reactive variable - when it changes, the page updates automatically
// computed = a value that recalculates automatically when its dependencies change
// onMounted = runs a function automatically when the component first loads
import { ref, computed, onMounted } from 'vue';

// import service functions here
import { getParticipants } from '../../services/participantService';

// props are values passed into this component from the parent (ParticipantView.vue)
// onEdit is a function that opens the edit form when someone clicks Bearbeiten
const props = defineProps({
  onEdit: Function,
});

// reactive variables - changing these automatically updates what the user sees
const participants = ref([]); // the list of participants from the backend
const search = ref(''); // what the user typed in the search box
const filterEmployed = ref('all'); // the selected filter option (all / true / false)

// fetch participants from the backend and store them in the participants variable
const load = async () => {
  participants.value = await getParticipants();
};

// run load() automatically when this component first appears on the page
onMounted(load);

// TODO: wire up when backend supports DELETE
const remove = async (id) => {
  // await deleteParticipant(id);
  // await load();
};

// filteredParticipants recalculates automatically whenever search or filterEmployed changes
// it filters the full participant list based on what the user typed and selected
const filteredParticipants = computed(() => {
  return participants.value.filter((p) => {
    // combine name and email into one string for searching
    const fullText = `${p.firstName} ${p.lastName} ${p.email}`.toLowerCase();

    // check if the search text appears anywhere in the combined string
    const matchesSearch = fullText.includes(search.value.toLowerCase());

    // check if the employment filter matches (all = show everyone)
    const matchesFilter =
      filterEmployed.value === 'all' ||
      String(p.isEmployed) === filterEmployed.value;

    // only include this participant if both conditions are true
    return matchesSearch && matchesFilter;
  });
});
</script>

<template>
  <!-- the visible part of the component - everything the user sees -->
  <div>
    <h3>Teilnehmer Liste</h3>

    <!-- SEARCH + FILTER - v-model means the input is linked to the variable above -->
    <div class="toolbar">
      <input v-model="search" placeholder="Suche..." />

      <select v-model="filterEmployed">
        <option value="all">Alle</option>
        <option value="true">Beschäftigt</option>
        <option value="false">Nicht beschäftigt</option>
      </select>
    </div>

    <!-- TABLE - v-for loops through filteredParticipants and creates one row per participant -->
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
        <!-- :key tells Vue how to identify each row uniquely - always use the ID -->
        <tr v-for="p in filteredParticipants" :key="p.id">
          <td>{{ p.salutation === 0 ? 'Herr' : 'Frau' }}</td>
          <td>{{ p.firstName }}</td>
          <td>{{ p.lastName }}</td>
          <td>{{ p.email }}</td>
          <td>{{ p.phone }}</td>
          <td>{{ p.mobile }}</td>
          <td>{{ p.postalCodeId }}</td>
          <td>
            <!-- v-if and v-else show different content based on a condition -->
            <span v-if="p.isEmployed">✔</span>
            <span v-else>✖</span>
          </td>
          <td>
            <!-- @click means "run this function when the button is clicked" -->
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