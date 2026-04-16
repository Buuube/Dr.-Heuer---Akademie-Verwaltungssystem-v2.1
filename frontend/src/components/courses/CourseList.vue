<script setup>
import { ref, computed, onMounted } from 'vue';
import { getCourses } from '@/services/courseService';

const props = defineProps({
  OnEdit: Function,
  OnDelete: Function,
  OnSelect: Function,
  OnCreate: Function,
});

const courses = ref([]);
const search = ref('');
const filterStatus = ref('all');
// all | active | expired

const isActive = (endDate) => new Date(endDate) >= new Date();

const formatDate = (date) =>
  new Date(date).toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

const sortKey = ref('');
const sortDir = ref(1); // 1 = asc, -1 = desc

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
    const active = isActive(course.ApprovalEndDate);
    const matchesStatus =
      filterStatus.value === 'all' ||
      (filterStatus.value === 'active' && active) ||
      (filterStatus.value === 'expired' && !active);
    return matchesSearch && matchesStatus;
  });

  if (!sortKey.value) return filtered;

  return [...filtered].sort((a, b) => {
    let valA, valB;
    if (sortKey.value === '_active') {
      valA = isActive(a.ApprovalEndDate) ? 1 : 0;
      valB = isActive(b.ApprovalEndDate) ? 1 : 0;
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
  <div>
    <div class="list-header">
      <h2>Kurse</h2>
      <button class="btn-create" @click="props.OnCreate()">+ Neuer Kurs</button>
    </div>
    <div class="toolbar">
      <input
        v-model="search"
        placeholder="Suche nach Nummer, Name, Berater..."
      />
      <select v-model="filterStatus">
        <option value="all">Alle</option>
        <option value="active">Aktiv</option>
        <option value="expired">Abgelaufen</option>
      </select>
    </div>
    <table>
      <thead>
        <tr>
          <th @click="toggleSort('ApprovalNumber')" class="sortable">
            Zulassungsnummer {{ sortIcon('ApprovalNumber') }}
          </th>
          <th @click="toggleSort('Name')" class="sortable">
            Bezeichnung {{ sortIcon('Name') }}
          </th>
          <th @click="toggleSort('Advisor')" class="sortable">
            Berater {{ sortIcon('Advisor') }}
          </th>
          <th>Gültig von</th>
          <th>Gültig bis</th>
          <th @click="toggleSort('_active')" class="sortable">
            Status {{ sortIcon('_active') }}
          </th>
          <th>Aktionen</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="course in filteredCourses"
          :key="course.CourseId"
          class="clickable-row"
          @click="props.OnSelect(course)"
        >
          <td>{{ course.ApprovalNumber }}</td>
          <td>{{ course.Name }}</td>
          <td>{{ course.Advisor }}</td>
          <td>{{ formatDate(course.ApprovalStartDate) }}</td>
          <td>{{ formatDate(course.ApprovalEndDate) }}</td>
          <td>
            <span
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
            <button
              class="btn-icon"
              title="Bearbeiten"
              @click.stop="props.OnEdit(course)"
            >
              ✏️
            </button>
            <button
              class="btn-icon btn-icon--delete"
              title="Löschen"
              @click.stop="props.OnDelete(course.CourseId)"
            >
              🗑️
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.badge-active {
  background: #2ecc71;
  color: white;
  padding: 2px 10px;
  border-radius: 12px;
  font-size: 0.85em;
}

.badge-expired {
  background: #e74c3c;
  color: white;
  padding: 2px 10px;
  border-radius: 12px;
  font-size: 0.85em;
}

.sortable {
  cursor: pointer;
  user-select: none;
}

.sortable:hover {
  opacity: 0.75;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.btn-create {
  padding: 6px 16px;
  background: #2ecc71;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.btn-create:hover {
  opacity: 0.85;
}

.clickable-row {
  cursor: pointer;
}

.clickable-row:hover {
  opacity: 0.8;
}

.btn-icon {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.1em;
  padding: 2px 6px;
}

.btn-icon--delete:hover {
  filter: brightness(1.5);
}
</style>
