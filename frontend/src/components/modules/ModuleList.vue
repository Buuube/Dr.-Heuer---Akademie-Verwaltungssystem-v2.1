<script setup>
import { ref, onMounted } from 'vue';
import { getModules } from '@/services/moduleService';

const props = defineProps({
  CourseId: Number,
  OnEdit: Function,
  OnDelete: Function,
});

const modules = ref([]);

onMounted(async () => {
  modules.value = await getModules(props.CourseId);
});
</script>

<template>
  <div>
    <h2>Module</h2>
    <table>
      <thead>
        <tr>
          <th>Modulnummer</th>
          <th>Externe Nummer</th>
          <th>Name</th>
          <th>Dauer</th>
          <th>Kosten</th>
          <th>Std./Tag</th>
          <th>Praktikum</th>

          <th>Aktionen</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="module in modules" :key="module.ModuleCode">
          <td>{{ module.ModuleCode }}</td>
          <td>{{ module.ExternalModuleCode }}</td>
          <td>{{ module.Name }}</td>
          <td>{{ module.Duration }}</td>
          <td>{{ module.EstimatedCost }}</td>
          <td>{{ module.DailyTeachingHours }}</td>

          <td>
            <span v-if="module.HasInternship">✔</span>
            <span v-else></span>
          </td>

          <td>
            <button class="btn-edit" @click="props.OnEdit(module)">
              Bearbeiten
            </button>

            <button
              class="btn-delete"
              @click="props.OnDelete(module.ModuleCode)"
            >
              Löschen
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
