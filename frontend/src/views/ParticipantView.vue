<script setup>
import { ref } from 'vue';
import ParticipantList from '../components/participants/ParticipantList.vue';
import ParticipantForm from '../components/participants/ParticipantForm.vue';

const selected = ref(null);

const edit = (p) => {
  selected.value = p;
};

const reset = () => {
  selected.value = null;
};
</script>

<template>
  <div class="participant-layout">
    <div class="form">
      <ParticipantForm :participant="selected" @save="edit" @cancel="reset" />
    </div>

    <div class="list-panel">
      <ParticipantList :onEdit="edit" />
    </div>
  </div>
</template>
