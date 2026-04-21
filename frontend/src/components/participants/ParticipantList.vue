<script setup>
import { ref, computed, watch, onMounted } from 'vue';
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
const genderFilter = ref('all');
const emailFilter = ref('all');
const selfFilter = ref('all');
const sortBy = ref('lastname_asc');

/* =========================
   PAGINATION
========================= */
const pageSize = ref(10);
const currentPage = ref(1);

/* =========================
   LOAD
========================= */
const Load = async () => {
  const result = await getParticipants();
  Participants.value = Array.isArray(result) ? result : [];
};

onMounted(Load);

// Seite zurücksetzen wenn Filter/Suche sich ändert
watch([Search, genderFilter, emailFilter, selfFilter, sortBy, pageSize], () => {
  currentPage.value = 1;
});

/* =========================
   FILTER + SORT
========================= */
const FilteredParticipants = computed(() => {
  let list = [...Participants.value];

  // SEARCH — Vorname, Nachname, E-Mail, Kundennummer
  const search = Search.value.toLowerCase();
  if (search) {
    list = list.filter((p) =>
      `${p.FirstName} ${p.LastName} ${p.Email} ${p.AgencyCustomerNumber}`
        .toLowerCase()
        .includes(search)
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
  if (emailFilter.value === 'has') list = list.filter((p) => !!p.Email);
  if (emailFilter.value === 'none') list = list.filter((p) => !p.Email);

  // SELF PAYER
  if (selfFilter.value === 'yes') list = list.filter((p) => p.IsSelfPayer);
  if (selfFilter.value === 'no') list = list.filter((p) => !p.IsSelfPayer);

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

/* =========================
   PAGINATION COMPUTED
========================= */
const totalPages = computed(() =>
  Math.max(1, Math.ceil(FilteredParticipants.value.length / pageSize.value))
);

const PagedParticipants = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  return FilteredParticipants.value.slice(start, start + pageSize.value);
});

const totalCount = computed(() => FilteredParticipants.value.length);
</script>

<template>
  <div class="list-panel">
    <h3>Teilnehmer Liste</h3>

    <!-- SEARCH + FILTER -->
    <div class="toolbar">
      <input
        v-model="Search"
        placeholder="Suche nach Name, E-Mail, Kundennr. …"
      />

      <!-- GENDER -->
      <select v-model="genderFilter">
        <option value="all">Geschlecht: -</option>
        <option value="male">Geschlecht: Mann</option>
        <option value="female">Geschlecht: Frau</option>
      </select>

      <!-- EMAIL -->
      <select v-model="emailFilter">
        <option value="all">E-Mail: -</option>
        <option value="has">E-Mail: vorhanden</option>
        <option value="none">E-Mail: nicht vorhanden</option>
      </select>

      <!-- SELF PAYER -->
      <select v-model="selfFilter">
        <option value="all">Selbstzahler: -</option>
        <option value="yes">Selbstzahler: Ja</option>
        <option value="no">Selbstzahler: Nein</option>
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
          </tr>
        </thead>

        <tbody>
          <tr v-for="P in PagedParticipants" :key="P.ParticipantId || P.Id">
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

    <!-- PAGINATION -->
    <div class="pagination">
      <div class="pagination-info">
        {{ totalCount }} Einträge – Seite {{ currentPage }} von {{ totalPages }}
      </div>

      <div class="pagination-controls">
        <button :disabled="currentPage === 1" @click="currentPage = 1">
          «
        </button>
        <button :disabled="currentPage === 1" @click="currentPage--">‹</button>
        <button :disabled="currentPage === totalPages" @click="currentPage++">
          ›
        </button>
        <button
          :disabled="currentPage === totalPages"
          @click="currentPage = totalPages"
        >
          »
        </button>
      </div>

      <div class="pagination-size">
        <select v-model="pageSize">
          <option :value="10">10 pro Seite</option>
          <option :value="25">25 pro Seite</option>
          <option :value="50">50 pro Seite</option>
        </select>
      </div>
    </div>
  </div>
</template>
