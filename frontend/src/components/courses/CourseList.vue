<script setup>
import { ref, computed, onMounted } from 'vue';
import { getCourses } from '@/services/courseService';

const props = defineProps({
  OnEdit: Function,
  OnDelete: Function,
  OnSelect: Function,
});

const courses = ref([]);
const search = ref('');
const filterStatus = ref('all');

const isActive = (endDate) => new Date(endDate) >= new Date();

const formatDate = (date) =>
  new Date(date).toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

const sortKey = ref('_active');
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

const filteredCourses = computed(() => {
  const filtered = courses.value.filter((course) => {
    const text =
      `${course.ApprovalNumber} ${course.Name} ${course.Advisor}`.toLowerCase();
    const matchesSearch = text.includes(search.value.toLowerCase());
    const deactivated = course.IsDeleted === true || course.IsDeleted === 1;
    const active = !deactivated && isActive(course.ApprovalEndDate);
    const expired = !deactivated && !isActive(course.ApprovalEndDate);
    const matchesStatus =
      filterStatus.value === 'all' ||
      (filterStatus.value === 'active' && active) ||
      (filterStatus.value === 'expired' && expired) ||
      (filterStatus.value === 'deactivated' && deactivated);
    return matchesSearch && matchesStatus;
  });

  if (!sortKey.value) return filtered;

  return [...filtered].sort((a, b) => {
    let valA, valB;
    if (sortKey.value === '_active') {
      const deactivatedA = a.IsDeleted === true || a.IsDeleted === 1;
      const deactivatedB = b.IsDeleted === true || b.IsDeleted === 1;
      valA = deactivatedA ? -1 : isActive(a.ApprovalEndDate) ? 1 : 0;
      valB = deactivatedB ? -1 : isActive(b.ApprovalEndDate) ? 1 : 0;
    } else {
      valA = a[sortKey.value] ?? '';
      valB = b[sortKey.value] ?? '';
    }
    return valA < valB ? -sortDir.value : valA > valB ? sortDir.value : 0;
  });
});

onMounted(async () => {
  courses.value = await getCourses();
});
</script>

<template>
  <div class="list-panel">
    <h3>Kurse</h3>

    <div class="toolbar">
      <input
        v-model="search"
        placeholder="Suche nach Nummer, Name, Berater..."
      />
      <select v-model="filterStatus">
        <option value="all">Alle Status</option>
        <option value="active">Aktiv</option>
        <option value="expired">Abgelaufen</option>
        <option value="deactivated">Deaktiviert</option>
      </select>
    </div>

    <div class="table-wrapper">
      <table>
        <thead>
          <tr>
            <th @click="toggleSort('ApprovalNumber')" class="sortable">
              Zulassungsnummer
              <span class="sort-icon">{{ sortIcon('ApprovalNumber') }}</span>
            </th>
            <th @click="toggleSort('Name')" class="sortable">
              Bezeichnung <span class="sort-icon">{{ sortIcon('Name') }}</span>
            </th>
            <th>Berater</th>
            <th>Gültig von</th>
            <th>Gültig bis</th>
            <th
              :class="{ sortable: filterStatus === 'all' }"
              @click="filterStatus === 'all' && toggleSort('_active')"
            >
              Status
              <span v-if="filterStatus === 'all'" class="sort-icon">{{
                sortIcon('_active')
              }}</span>
            </th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="course in filteredCourses" :key="course.CourseId">
            <td>{{ course.ApprovalNumber }}</td>
            <td>{{ course.Name }}</td>
            <td>{{ course.Advisor }}</td>
            <td>{{ formatDate(course.ApprovalStartDate) }}</td>
            <td>{{ formatDate(course.ApprovalEndDate) }}</td>
            <td>
              <span
                v-if="course.IsDeleted === true || course.IsDeleted === 1"
                class="badge-deactivated"
                >Deaktiviert</span
              >
              <span
                v-else
                :class="
                  isActive(course.ApprovalEndDate)
                    ? 'badge-active'
                    : 'badge-expired'
                "
              >
                {{ isActive(course.ApprovalEndDate) ? 'Aktiv' : 'Abgelaufen' }}
              </span>
            </td>
            <td>
              <button class="btn-detail" @click="props.OnSelect(course)">
                Details
              </button>
              <button
                class="btn-edit"
                :disabled="course.IsDeleted === true || course.IsDeleted === 1"
                @click="props.OnEdit(course)"
              >
                Bearbeiten
              </button>
              <button
                class="btn-delete"
                :disabled="course.IsDeleted === true || course.IsDeleted === 1"
                @click="props.OnDelete(course.CourseId)"
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
.badge-active {
  background: rgba(46, 204, 113, 0.15);
  color: #2ecc71;
  border: 1px solid rgba(46, 204, 113, 0.3);
  padding: 3px 10px;
  border-radius: 12px;
  font-size: 0.85em;
}

.badge-expired {
  background: rgba(231, 76, 60, 0.12);
  color: #ff4d6d;
  border: 1px solid rgba(255, 77, 109, 0.3);
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

.sortable {
  cursor: pointer;
  user-select: none;
}

.sortable:hover {
  color: #7cf7ff;
}

.sort-icon {
  font-size: 14px;
  margin-left: 4px;
  opacity: 0.8;
  vertical-align: middle;
}

th:nth-child(1),
td:nth-child(1) {
  width: 210px;
}
th:nth-child(2),
td:nth-child(2) {
  width: 180px;
}
th:nth-child(3),
td:nth-child(3) {
  width: 130px;
}
th:nth-child(4),
td:nth-child(4) {
  width: 105px;
}
th:nth-child(5),
td:nth-child(5) {
  width: 105px;
}
th:nth-child(6),
td:nth-child(6) {
  width: 110px;
}
th:nth-child(7),
td:nth-child(7) {
  width: 260px;
  white-space: nowrap;
}
</style>
