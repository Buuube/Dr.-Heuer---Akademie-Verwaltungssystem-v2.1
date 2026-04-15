<script setup>
import { ref, toRaw } from 'vue';

import ParticipantList from '../components/participants/ParticipantList.vue';
import ParticipantForm from '../components/participants/ParticipantForm.vue';
import ParticipantDetail from '../components/participants/ParticipantDetail.vue';

import { saveParticipant } from '../services/participantService';

const selected = ref(null);
const formMode = ref(null); // null | 'new' | 'edit'
const rightMode = ref('list'); // 'list' | 'detail'

const select = (p) => {
  selected.value = structuredClone(toRaw(p));
  rightMode.value = 'detail';
  formMode.value = null;
};

const edit = (p) => {
  selected.value = structuredClone(toRaw(p));
  formMode.value = 'edit';
  rightMode.value = rightMode.value;
};

const createNew = () => {
  selected.value = null;
  formMode.value = 'new';
  rightMode.value = 'list';
};

const save = async (p) => {
  await saveParticipant(p);
  selected.value = null;
  formMode.value = null;
  rightMode.value = 'list';
};

const closeForm = () => {
  formMode.value = null;
  // selected wird NICHT geleert → Detail bleibt sichtbar
};

const closeDetail = () => {
  selected.value = null;
  rightMode.value = 'list';
  formMode.value = null;
};
</script>

<template>
  <div class="participant-layout">
    <!-- LINKS: Button oder Form -->
    <div class="form-panel">
      <div v-if="formMode === null">
        <button class="btn-new_part" @click="createNew">
          Neuen Teilnehmer anlegen
        </button>
      </div>

      <ParticipantForm
        v-if="formMode !== null"
        :Participant="selected"
        :title="
          formMode === 'edit' ? 'Teilnehmer bearbeiten' : 'Teilnehmer anlegen'
        "
        @save="save"
        @cancel="closeForm"
      />
    </div>

    <!-- RECHTS: List oder Detail -->
    <div class="list-panel">
      <ParticipantList
        v-if="rightMode === 'list'"
        :onEdit="edit"
        :onSelect="select"
      />

      <ParticipantDetail
        v-if="rightMode === 'detail'"
        :Participant="selected"
        @edit="edit"
        @close="closeDetail"
      />
    </div>
  </div>
</template>
