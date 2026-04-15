<script setup>
import { ref, onMounted } from 'vue';
import { getCourses } from '@/services/courseService';

const props = defineProps({
  OnEdit: Function,
  OnDelete: Function,
});

const courses = ref([]);

onMounted(async () => {
  courses.value = await getCourses();
});
</script>

<template>
  <div>
    <h2>Kurse</h2>
    <table>
      <thead>
        <tr>
          <th>Zert.-Nr.</th>
          <th>Name</th>
          <th>Berater</th>
          <th>Gültig von</th>
          <th>Gültig bis</th>
          <th>Std./Tag</th>
          <th>Kosten/UE</th>
          <th>UE-Dauer</th>

          <th>Aktionen</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="course in courses" :key="course.CourseId">
          <td>{{ course.ApprovalNumber }}</td>
          <td>{{ course.Name }}</td>
          <td>{{ course.Advisor }}</td>
          <td>{{ course.ApprovalStartDate }}</td>
          <td>{{ course.ApprovalEndDate }}</td>
          <td>{{ course.DailyTeachingHours }}</td>
          <td>{{ course.CostPerTeachingUnit }}</td>
          <td>{{ course.TeachingUnitDuration }}</td>

          <td>
            <button class="btn-edit" @click="props.OnEdit(course)">
              Bearbeiten
            </button>

            <button class="btn-delete" @click="props.OnDelete(course.CourseId)">
              Löschen
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
