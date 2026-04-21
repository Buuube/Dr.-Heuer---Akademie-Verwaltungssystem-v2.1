<script setup>
import { ref, computed, onMounted } from 'vue';
import { getModule } from '@/services/moduleService';
import { getExams } from '@/services/moduleExamService';

const props = defineProps({
  CourseId: Number,
  OnEdit: Function,
  OnDelete: Function,
  OnSelect: Function,
});

const modules = ref([]);
const examCounts = ref({});
const filterStatus = ref('all');
const search = ref('');

const formatCurrency = (value) =>
  Number(value).toLocaleString('de-DE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }) + ' €';

const isDeactivated = (mod) => mod.IsDeleted === true || mod.IsDeleted === 1;

const sortKey = ref('');
const sortDir = ref(1);

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
      `${mod.ExternalModuleCode ?? ''} ${mod.Name ?? ''}`.toLowerCase();
    const matchesSearch = text.includes(search.value.toLowerCase());
    if (filterStatus.value === 'active')
      return matchesSearch && !isDeactivated(mod);
    if (filterStatus.value === 'deactivated')
      return matchesSearch && isDeactivated(mod);
    return matchesSearch;
  });

  if (!sortKey.value) return filtered;

  return [...filtered].sort((a, b) => {
    let valA = a[sortKey.value] ?? '';
    let valB = b[sortKey.value] ?? '';
    if (typeof valA === 'string') valA = valA.toLowerCase();
    if (typeof valB === 'string') valB = valB.toLowerCase();
    return valA < valB ? -sortDir.value : valA > valB ? sortDir.value : 0;
  });
});

onMounted(async () => {
  modules.value = await getModule(props.CourseId);

  for (const mod of modules.value) {
    try {
      const exams = await getExams(mod.ModuleCode);
      examCounts.value[mod.ModuleCode] = {
        intern: exams.filter((e) => e.ExamType === 'intern').length,
        extern: exams.filter((e) => e.ExamType === 'extern').length,
      };
    } catch {
      examCounts.value[mod.ModuleCode] = { intern: 0, extern: 0 };
    }
  }
});
</script>

<template>
  <div class="list-panel">
    <h3>Module</h3>

    <div class="toolbar">
      <input
        v-model="search"
        placeholder="Suche nach Name oder externer Nummer..."
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
              Externe Nummer {{ sortIcon('ExternalModuleCode') }}
            </th>
            <th @click="toggleSort('Name')" class="sortable">
              Name {{ sortIcon('Name') }}
            </th>
            <th @click="toggleSort('Duration')" class="sortable">
              Dauer {{ sortIcon('Duration') }}
            </th>
            <th @click="toggleSort('EstimatedCost')" class="sortable">
              Kosten {{ sortIcon('EstimatedCost') }}
            </th>
            <th>Std./Tag</th>
            <th>Int. Prüfungen</th>
            <th>Ext. Prüfungen</th>
            <th
              :class="{ sortable: filterStatus === 'all' }"
              @click="filterStatus === 'all' && toggleSort('_status')"
            >
              Status {{ filterStatus === 'all' ? sortIcon('_status') : '' }}
            </th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="module in filteredModules"
            :key="module.ModuleCode"
            class="clickable-row"
            @click="props.OnSelect(module)"
          >
            <td>{{ module.ExternalModuleCode }}</td>
            <td>{{ module.Name }}</td>
            <td>{{ module.Duration }}</td>
            <td>{{ formatCurrency(module.EstimatedCost) }}</td>
            <td>{{ module.DailyTeachingHours }}</td>
            <td>{{ examCounts[module.ModuleCode]?.intern ?? '–' }}</td>
            <td>{{ examCounts[module.ModuleCode]?.extern ?? '–' }}</td>
            <td>
              <span v-if="isDeactivated(module)" class="badge-deactivated"
                >Deaktiviert</span
              >
              <span v-else class="badge-active">Aktiv</span>
            </td>
            <td>
              <button
                class="btn-edit"
                :disabled="isDeactivated(module)"
                @click.stop="props.OnEdit(module)"
              >
                Bearbeiten
              </button>
              <button
                class="btn-delete"
                :disabled="isDeactivated(module)"
                @click.stop="props.OnDelete(module.ModuleCode)"
              >
                Deaktivieren
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.sortable {
  cursor: pointer;
  user-select: none;
}

.sortable:hover {
  color: #7cf7ff;
}

.clickable-row {
  cursor: pointer;
}

.badge-active {
  background: rgba(46, 204, 113, 0.15);
  color: #2ecc71;
  border: 1px solid rgba(46, 204, 113, 0.3);
  padding: 3px 10px;
  border-radius: 12px;
  font-size: 0.85em;
}

.badge-deactivated {
  background: rgba(120, 180, 255, 0.08);
  color: rgba(215, 230, 255, 0.5);
  border: 1px solid rgba(120, 180, 255, 0.15);
  padding: 3px 10px;
  border-radius: 12px;
  font-size: 0.85em;
}

th:nth-child(1),
td:nth-child(1) {
  width: 185px;
}
th:nth-child(2),
td:nth-child(2) {
  width: auto;
}
th:nth-child(3),
td:nth-child(3) {
  width: 90px;
}
th:nth-child(4),
td:nth-child(4) {
  width: 110px;
}
th:nth-child(5),
td:nth-child(5) {
  width: 80px;
}
th:nth-child(6),
td:nth-child(6) {
  width: 120px;
  white-space: nowrap;
}
th:nth-child(7),
td:nth-child(7) {
  width: 120px;
  white-space: nowrap;
}
th:nth-child(8),
td:nth-child(8) {
  width: 110px;
}
th:nth-child(9),
td:nth-child(9) {
  width: 200px;
}
</style>
