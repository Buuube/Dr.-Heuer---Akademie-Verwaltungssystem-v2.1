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

/* =========================
   FILTER STATE
========================= */
const genderFilter = ref('all'); // all | male | female
const emailFilter = ref('all'); // all | has | none
const selfFilter = ref('all'); // all | yes | no
const sortBy = ref('lastname'); // firstname | lastname

/* =========================
   LOAD
========================= */
const Load = async () => {
  const result = await getParticipants();
  Participants.value = Array.isArray(result) ? result : [];
};

onMounted(Load);

/* =========================
   FILTER + SORT
========================= */
const FilteredParticipants = computed(() => {
  let list = [...Participants.value];

  // SEARCH
  const search = Search.value.toLowerCase();
  if (search) {
    list = list.filter((p) =>
      `${p.FirstName} ${p.LastName} ${p.Email}`.toLowerCase().includes(search)
    );
  }

  // GENDER
  if (genderFilter.value !== 'all') {
    list = list.filter((p) => {
      const isMale = p.Salutation === false || p.Salutation === 0;
      return genderFilter.value === 'male' ? isMale : !isMale;
    });
  }

  // EMAIL
  if (emailFilter.value === 'has') {
    list = list.filter((p) => !!p.Email);
  }
  if (emailFilter.value === 'none') {
    list = list.filter((p) => !p.Email);
  }

  // SELF PAYER
  if (selfFilter.value === 'yes') {
    list = list.filter((p) => p.IsSelfPayer);
  }
  if (selfFilter.value === 'no') {
    list = list.filter((p) => !p.IsSelfPayer);
  }

  const sortBy = ref('lastname_asc');

  // SORT
  list.sort((a, b) => {
    const fnA = a.FirstName || '';
    const fnB = b.FirstName || '';
    const lnA = a.LastName || '';
    const lnB = b.LastName || '';

    switch (sortBy.value) {
      case 'firstname_asc':
        return fnA.localeCompare(fnB);

      case 'firstname_desc':
        return fnB.localeCompare(fnA);

      case 'lastname_asc':
        return lnA.localeCompare(lnB);

      case 'lastname_desc':
        return lnB.localeCompare(lnA);

      default:
        return 0;
    }
  });

  return list;
});
</script>

<template>
  <div class="list-panel">
    <h3>Teilnehmer Liste</h3>

    <!-- SEARCH + FILTER -->
    <div class="toolbar">
      <input v-model="Search" placeholder="Suche..." />

      <!-- GENDER -->
      <select v-model="genderFilter">
        <option value="all">Alle Geschlechter</option>
        <option value="male">Mann</option>
        <option value="female">Frau</option>
      </select>

      <!-- EMAIL -->
      <select v-model="emailFilter">
        <option value="all">E-Mail: Alle</option>
        <option value="has">Mit E-Mail</option>
        <option value="none">Ohne E-Mail</option>
      </select>

      <!-- SELF PAYER -->
      <select v-model="selfFilter">
        <option value="all">Selbstzahler: Alle</option>
        <option value="yes">Ja</option>
        <option value="no">Nein</option>
      </select>

      <!-- SORT -->
      <select v-model="sortBy">
        <option value="lastname_asc">Nachname A–Z</option>
        <option value="lastname_desc">Nachname Z–A</option>

        <option value="firstname_asc">Vorname A–Z</option>
        <option value="firstname_desc">Vorname Z–A</option>
      </select>
    </div>

    <!-- TABLE -->
    <div class="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>Kundennr.</th>
            <th>Anrede</th>
            <th>Vorname</th>
            <th>Nachname</th>
            <th>E-Mail</th>
            <th>Telefon</th>
            <th>Mobil</th>
            <th></th>
            <!--nichts löschen, platzhalter für aktionen-->
          </tr>
        </thead>

        <tbody>
          <tr v-for="P in FilteredParticipants" :key="P.ParticipantId || P.Id">
            <td>{{ P.AgencyCustomerNumber }}</td>

            <td>
              {{
                P.Salutation === false || P.Salutation === 0 ? 'Herr' : 'Frau'
              }}
            </td>

            <td>{{ P.FirstName }}</td>
            <td>{{ P.LastName }}</td>
            <td>{{ P.Email }}</td>
            <td>{{ P.Phone }}</td>
            <td>{{ P.Mobile }}</td>

            <td>
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
  </div>
</template>
