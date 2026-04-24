<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { getModule } from '@/services/moduleService';
import { getExams } from '@/services/moduleExamService';

const props = defineProps({
  CourseId: Number,
  OnEdit: Function,
  OnDelete: Function,
  OnSelect: Function,
});

const modules = ref([]);
// const examCounts = ref({});
const filterStatus = ref('all');
const search = ref('');

const formatCurrency = (value) =>
  Number(value).toLocaleString('de-DE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }) + ' €';

const isDeactivated = (mod) => mod.IsDeleted === true || mod.IsDeleted === 1;

const pageSize = ref(10);
const currentPage = ref(1);

const sortKey = ref('_status');
const sortDir = ref(-1);

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

const filteredModules = computed(() => {
  const filtered = modules.value.filter((mod) => {
    const text =
      `${mod.ExternalModuleCode ?? ''} ${mod.Name ?? ''} ${mod.ModuleCodeId ?? ''}`.toLowerCase();
    const matchesSearch = text.includes(search.value.toLowerCase());
    if (filterStatus.value === 'active')
      return matchesSearch && !isDeactivated(mod);
    if (filterStatus.value === 'deactivated')
      return matchesSearch && isDeactivated(mod);
    return matchesSearch;
  });

  if (!sortKey.value) return filtered;

  return [...filtered].sort((a, b) => {
    let valA, valB;
    if (sortKey.value === '_status') {
      valA = isDeactivated(a) ? 0 : 1;
      valB = isDeactivated(b) ? 0 : 1;
    } else {
      valA = a[sortKey.value] ?? '';
      valB = b[sortKey.value] ?? '';
      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();
    }
    return valA < valB ? -sortDir.value : valA > valB ? sortDir.value : 0;
  });
});

watch([search, filterStatus, sortKey, sortDir, pageSize], () => {
  currentPage.value = 1;
});

const totalCount = computed(() => filteredModules.value.length);
const totalPages = computed(() =>
  Math.max(1, Math.ceil(filteredModules.value.length / pageSize.value))
);
const pagedModules = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  return filteredModules.value.slice(start, start + pageSize.value);
});

onMounted(async () => {
  modules.value = await getModule(props.CourseId);
});
</script>

<template>
  <div class="list-panel">
    <h3>Module</h3>

    <div class="toolbar">
      <input
        v-model="search"
        placeholder="Suche nach Name, Modul-Code oder externer Nummer..."
      />
      <select v-model="filterStatus">
        <option value="all">Alle Status</option>
        <option value="active">Aktiv</option>
        <option value="deactivated">Deaktiviert</option>
      </select>
    </div>

    <div class="table-wrapper">
      <table>
        <thead>
          <tr>
            <th @click="toggleSort('ExternalModuleCode')" class="sortable">
              Externe Nummer
              <span class="sort-icon">{{
                sortIcon('ExternalModuleCode')
              }}</span>
            </th>
            <th @click="toggleSort('ModuleCodeId')" class="sortable">
              Modul-Code
              <span class="sort-icon">{{ sortIcon('ModuleCodeId') }}</span>
            </th>
            <th @click="toggleSort('Name')" class="sortable">
              Name <span class="sort-icon">{{ sortIcon('Name') }}</span>
            </th>
            <th @click="toggleSort('Duration')" class="sortable">
              Dauer <span class="sort-icon">{{ sortIcon('Duration') }}</span>
            </th>
            <th @click="toggleSort('EstimatedCost')" class="sortable">
              Kosten
              <span class="sort-icon">{{ sortIcon('EstimatedCost') }}</span>
            </th>
            <th>Std./Tag</th>
            <th>Int. Prüfungen</th>
            <th>Ext. Prüfungen</th>
            <th
              :class="{ sortable: filterStatus === 'all' }"
              @click="filterStatus === 'all' && toggleSort('_status')"
            >
              Status
              <span v-if="filterStatus === 'all'" class="sort-icon">{{
                sortIcon('_status')
              }}</span>
            </th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="module in pagedModules" :key="module.ModuleCodeId">
            <td>{{ module.ExternalModuleCode }}</td>
            <td>{{ module.ModuleCodeId }}</td>
            <td>{{ module.Name }}</td>
            <td>{{ module.Duration }}</td>
            <td>{{ formatCurrency(module.EstimatedCost) }}</td>
            <td>{{ module.DailyTeachingHours }}</td>
            <td>{{ module.InternExamCount ?? '–' }}</td>
            <td>{{ module.ExternExamCount ?? '–' }}</td>
            <td>
              <span v-if="isDeactivated(module)" class="badge-deactivated"
                >Deaktiviert</span
              >
              <span v-else class="badge-active">Aktiv</span>
            </td>
            <td>
              <button class="btn-detail" @click="props.OnSelect(module)">
                Details
              </button>
              <button
                class="btn-edit"
                :disabled="isDeactivated(module)"
                @click="props.OnEdit(module)"
              >
                Bearbeiten
              </button>
              <button
                class="btn-delete"
                :disabled="isDeactivated(module)"
                @click="props.OnDelete(module.ModuleCodeId)"
              >
                Deaktivieren
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
  width: 185px;
}
th:nth-child(2),
td:nth-child(2) {
  width: 110px;
}
th:nth-child(3),
td:nth-child(3) {
  width: 160px;
}
th:nth-child(4),
td:nth-child(4) {
  width: 90px;
}
th:nth-child(5),
td:nth-child(5) {
  width: 110px;
}
th:nth-child(6),
td:nth-child(6) {
  width: 80px;
}
th:nth-child(7),
td:nth-child(7) {
  width: 120px;
  white-space: nowrap;
}
th:nth-child(8),
td:nth-child(8) {
  width: 120px;
  white-space: nowrap;
}
th:nth-child(9),
td:nth-child(9) {
  width: 110px;
}
th:nth-child(10),
td:nth-child(10) {
  width: 270px;
  white-space: nowrap;
}
</style>
