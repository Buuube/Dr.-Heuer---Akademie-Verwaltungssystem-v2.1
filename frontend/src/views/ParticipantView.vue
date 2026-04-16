<script setup>
import { ref } from 'vue';

import ParticipantList from '../components/participants/ParticipantList.vue';
import ParticipantForm from '../components/participants/ParticipantForm.vue';
import ParticipantDetail from '../components/participants/ParticipantDetail.vue';

import {
  saveParticipant,
  deleteParticipant,
} from '../services/participantService';

const selected = ref(null);
const formMode = ref(null); // null | 'new' | 'edit'
const rightMode = ref('list'); // 'list' | 'detail'

// Sicheres Klonen — funktioniert auch bei verschachtelten Objekten
const clone = (p) => JSON.parse(JSON.stringify(p));

const select = (p) => {
  selected.value = clone(p);
  rightMode.value = 'detail';
  formMode.value = null;
};

const edit = (p) => {
  selected.value = clone(p);
  formMode.value = 'edit';
  // rightMode wird NICHT angefasst → List oder Detail bleibt sichtbar
};

const createNew = () => {
  selected.value = null;
  formMode.value = 'new';
  // rightMode wird NICHT angefasst → List oder Detail bleibt sichtbar
};

const save = async (p) => {
  await saveParticipant(p);
  selected.value = null;
  formMode.value = null;
  rightMode.value = 'list';
};

const closeForm = () => {
  formMode.value = null;
  // selected wird NICHT geleert → Detail bleibt sichtbar falls offen
};

const closeDetail = () => {
  selected.value = null;
  rightMode.value = 'list';
  formMode.value = null;
};

const remove = async (id) => {
  if (!confirm('Teilnehmer wirklich löschen?')) return;
  await deleteParticipant(id);
  selected.value = null;
  formMode.value = null;
  rightMode.value = 'list';
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
        :key="selected?.Id || formMode"
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
        :onDelete="remove"
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
