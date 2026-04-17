<script setup>
import { ref, onMounted } from 'vue';
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

const formatCurrency = (value) =>
  Number(value).toLocaleString('de-DE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }) + ' €';

onMounted(async () => {
  modules.value = await getModules(props.CourseId);

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
  <div>
    <h2>Module</h2>
    <table>
      <thead>
        <tr>
          <th>Externe Nummer</th>
          <th>Name</th>
          <th>Dauer</th>
          <th>Kosten</th>
          <th>Std./Tag</th>
          <th>Int. Prüfungen</th>
          <th>Ext. Prüfungen</th>
          <th>Aktionen</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="module in modules"
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
            <button
              class="btn-icon"
              title="Bearbeiten"
              @click.stop="props.OnEdit(module)"
            >
              ✏️
            </button>
            <button
              class="btn-icon btn-icon--delete"
              title="Löschen"
              @click.stop="props.OnDelete(module.ModuleCode)"
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
