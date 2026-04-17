<script setup>
import { ref, computed, onMounted } from 'vue';
import { getCourses } from '@/services/courseService';

const props = defineProps({
  OnEdit: Function,
  OnDelete: Function,
  OnSelect: Function,
  OnCreate: Function,
  OnSave: Function,
  showForm: Boolean,
});

const courses = ref([]);
const search = ref('');
const filterStatus = ref('all');
// all | active | expired | deactivated

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
  <div>
    <div class="list-header">
      <h2>Kurse</h2>
      <div class="header-buttons">
        <template v-if="props.showForm">
          <button class="btn-save" @click="props.OnSave()">Speichern</button>
          <button class="btn-cancel" @click="props.OnCreate()">
            Abbrechen
          </button>
        </template>
        <button v-else class="btn-create" @click="props.OnCreate()">
          + Neuer Kurs
        </button>
      </div>
    </div>
    <div class="toolbar">
      <input
        v-model="search"
        placeholder="Suche nach Nummer, Name, Berater..."
      />
      <select v-model="filterStatus" class="filter-select">
        <option value="all">Alle</option>
        <option value="active">Aktiv</option>
        <option value="expired">Abgelaufen</option>
        <option value="deactivated">Deaktiviert</option>
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
          <th>Berater</th>
          <th>Gültig von</th>
          <th>Gültig bis</th>
          <th
            :class="{ sortable: filterStatus === 'all' }"
            @click="filterStatus === 'all' && toggleSort('_active')"
          >
            Status {{ filterStatus === 'all' ? sortIcon('_active') : '' }}
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
              v-if="course.IsDeleted === true || course.IsDeleted === 1"
              class="badge-deactivated"
            >
              Deaktiviert
            </span>
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
            <button
              class="btn-icon"
              title="Bearbeiten"
              :disabled="course.IsDeleted === true || course.IsDeleted === 1"
              @click.stop="props.OnEdit(course)"
            >
              ✏️
            </button>
            <button
              class="btn-icon btn-icon--delete"
              title="Löschen"
              :disabled="course.IsDeleted === true || course.IsDeleted === 1"
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

.badge-deactivated {
  background: #95a5a6;
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

.header-buttons {
  display: flex;
  gap: 8px;
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

.btn-save {
  padding: 6px 16px;
  background: #2ecc71;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.btn-save:hover {
  opacity: 0.85;
}

.btn-cancel {
  padding: 6px 16px;
  background: none;
  border: 1px solid #666;
  border-radius: 4px;
  color: inherit;
  cursor: pointer;
}

.btn-cancel:hover {
  border-color: #aaa;
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

.btn-icon:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.filter-select {
  padding: 3px 6px;
  font-size: 0.85em;
  width: auto;
}
</style>
