<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { getBookings } from '../../services/bookingService';
import { getParticipants } from '../../services/participantService';
import { getModule } from '../../services/moduleService';

const props = defineProps({
  onEdit: Function,
  onSelect: Function,
  onDelete: Function,
});

const Bookings = ref([]);
const Participants = ref([]);
const AllModules = ref([]);

const Search = ref('');
const FilterSigned = ref('all');
const FilterExpired = ref('all');
const FilterModuleCode = ref('');
const sortKey = ref('');
const sortDir = ref(1);
const pageSize = ref(10);
const currentPage = ref(1);

const today = new Date();

const toggleSort = (key) => {
  if (sortKey.value === key) {
    sortDir.value *= -1;
  } else {
    sortKey.value = key;
    sortDir.value = 1;
  }
};

const sortIcon = (key) => {
  if (sortKey.value !== key) return '↕';
  return sortDir.value === 1 ? '↑' : '↓';
};

const ParticipantMap = computed(() => {
  const map = {};
  for (const p of Participants.value) {
    map[p.ParticipantId ?? p.Id] = `${p.FirstName} ${p.LastName}`;
  }
  return map;
});

const participantName = (id) => ParticipantMap.value[id] ?? id;

const formatDate = (date) => {
  if (!date) return '-';
  return new Date(date).toISOString().slice(0, 10);
};

const Load = async () => {
  Bookings.value = await getBookings();
  Participants.value = await getParticipants();
  AllModules.value = await getModule();
};

onMounted(Load);

watch(
  [
    Search,
    FilterSigned,
    FilterExpired,
    FilterModuleCode,
    sortKey,
    sortDir,
    pageSize,
  ],
  () => {
    currentPage.value = 1;
  }
);

const FilteredBookings = computed(() => {
  let list = [...Bookings.value];

  if (Search.value) {
    const s = Search.value.toLowerCase();
    list = list.filter((b) =>
      `${participantName(b.ParticipantId)} ${b.EducationalGoal ?? ''} ${b.BookingId}`
        .toLowerCase()
        .includes(s)
    );
  }

  if (FilterSigned.value !== 'all') {
    list = list.filter((b) => String(b.IsSigned) === FilterSigned.value);
  }

  if (FilterExpired.value === 'active') {
    list = list.filter(
      (b) => !b.ActualEndDate || new Date(b.ActualEndDate) >= today
    );
  }
  if (FilterExpired.value === 'expired') {
    list = list.filter(
      (b) => b.ActualEndDate && new Date(b.ActualEndDate) < today
    );
  }

  if (FilterModuleCode.value) {
    list = list.filter((b) => {
      if (!b.ModuleCodes) return false;
      return b.ModuleCodes.split(',').includes(FilterModuleCode.value);
    });
  }

  if (sortKey.value) {
    list.sort((a, b) => {
      let valA = a[sortKey.value] ?? '';
      let valB = b[sortKey.value] ?? '';
      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();
      return valA < valB ? -sortDir.value : valA > valB ? sortDir.value : 0;
    });
  }

  return list;
});

const totalCount = computed(() => FilteredBookings.value.length);
const totalPages = computed(() =>
  Math.max(1, Math.ceil(FilteredBookings.value.length / pageSize.value))
);
const PagedBookings = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  return FilteredBookings.value.slice(start, start + pageSize.value);
});
</script>

<template>
  <div class="list-panel">
    <h3>Buchungen</h3>

    <div class="toolbar">
      <input
        v-model="Search"
        placeholder="Suche nach Teilnehmer, Bildungsziel …"
      />

      <select v-model="FilterSigned">
        <option value="all">Unterschrift: -</option>
        <option value="true">Unterschrieben</option>
        <option value="false">Nicht unterschrieben</option>
      </select>

      <select v-model="FilterExpired">
        <option value="all">Status: -</option>
        <option value="active">Aktiv</option>
        <option value="expired">Abgelaufen</option>
      </select>

      <select v-model="FilterModuleCode">
        <option value="">Modul: -</option>
        <option
          v-for="M in AllModules"
          :key="M.ModuleCodeId"
          :value="M.ModuleCodeId"
        >
          {{ M.ModuleCodeId }} — {{ M.Name ?? M.ModuleCodeId }}
        </option>
      </select>
    </div>

    <div class="table-wrapper">
      <table>
        <thead>
          <tr>
            <th @click="toggleSort('BookingId')" class="sortable">
              ID <span class="sort-icon">{{ sortIcon('BookingId') }}</span>
            </th>
            <th>Teilnehmer</th>
            <th @click="toggleSort('PlannedStartDate')" class="sortable">
              Start (geplant)
              <span class="sort-icon">{{ sortIcon('PlannedStartDate') }}</span>
            </th>
            <th @click="toggleSort('PlannedEndDate')" class="sortable">
              Ende (geplant)
              <span class="sort-icon">{{ sortIcon('PlannedEndDate') }}</span>
            </th>
            <th>Laufzeit</th>
            <th @click="toggleSort('MonthlyRate')" class="sortable">
              Rate (mtl.)
              <span class="sort-icon">{{ sortIcon('MonthlyRate') }}</span>
            </th>
            <th>Bildungsziel</th>
            <th>Module</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="B in PagedBookings" :key="B.BookingId">
            <td>{{ B.BookingId }}</td>
            <td>{{ participantName(B.ParticipantId) }}</td>
            <td>{{ formatDate(B.PlannedStartDate) }}</td>
            <td>{{ formatDate(B.PlannedEndDate) }}</td>
            <td>{{ B.Duration || '-' }}</td>
            <td>{{ B.MonthlyRate || '-' }}</td>
            <td>{{ B.EducationalGoal || '-' }}</td>
            <td style="font-size: 11px; color: var(--muted)">
              {{ B.ModuleCodes || '-' }}
            </td>
            <td>
              <button class="btn-detail" @click="props.onSelect?.(B)">
                Details
              </button>
              <button class="btn-edit" @click="props.onEdit?.(B)">
                Bearbeiten
              </button>
              <button class="btn-delete" @click="props.onDelete?.(B)">
                Löschen
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

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

<style scoped>
th:nth-child(1),
td:nth-child(1) {
  width: 55px;
}
th:nth-child(2),
td:nth-child(2) {
  width: 150px;
}
th:nth-child(3),
td:nth-child(3) {
  width: 120px;
}
th:nth-child(4),
td:nth-child(4) {
  width: 120px;
}
th:nth-child(5),
td:nth-child(5) {
  width: 80px;
}
th:nth-child(6),
td:nth-child(6) {
  width: 90px;
}
th:nth-child(7),
td:nth-child(7) {
  width: 140px;
}
th:nth-child(8),
td:nth-child(8) {
  width: 120px;
}
th:nth-child(9),
td:nth-child(9) {
  width: 220px;
  white-space: nowrap;
}
</style>
