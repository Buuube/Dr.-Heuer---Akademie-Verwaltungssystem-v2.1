<script setup>
import { ref } from 'vue';

import ParticipantList from '../components/participants/ParticipantList.vue';
import ParticipantForm from '../components/participants/ParticipantForm.vue';
import ParticipantDetail from '../components/participants/ParticipantDetail.vue';

import { saveParticipant } from '../services/participantService';

const selected = ref(null);
const mode = ref('list');
// list | detail | edit

const select = (p) => {
  selected.value = structuredClone(p);
  mode.value = 'detail';
};

const edit = (p) => {
  selected.value = structuredClone(p);
  mode.value = 'list'; // optional oder 'edit' – aber Form ist ja immer da
};

const createNew = () => {
  selected.value = null; // wichtig!
};
// 👉 speichern
const save = async (p) => {
  await saveParticipant(p);
  selected.value = null;
  mode.value = 'list';
};

// 👉 schließen / zurück
const close = () => {
  selected.value = null;
  mode.value = 'list';
};
</script>

<template>
  <div class="participant-layout">
    <!-- LINKS: FORM (IMMER SICHTBAR) -->
    <div class="form">
      <ParticipantForm :participant="selected" @save="save" @cancel="close" />
    </div>

    <!-- RECHTS -->
    <div class="list-panel">
      <!-- LIST -->
      <ParticipantList
        v-if="mode === 'list'"
        :OnEdit="edit"
        :OnSelect="select"
      />

      <!-- DETAIL -->
      <ParticipantDetail
        v-if="mode === 'detail'"
        :Participant="selected"
        @edit="edit"
        @close="close"
      />
    </div>
  </div>
</template>
