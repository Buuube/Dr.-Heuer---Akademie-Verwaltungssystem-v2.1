<script setup>
import { ref } from 'vue';

import ParticipantList from '../components/participants/ParticipantList.vue';
import ParticipantForm from '../components/participants/ParticipantForm.vue';
import ParticipantDetail from '../components/participants/ParticipantDetail.vue';

import {
  createParticipant,
  updateParticipant,
  deleteParticipant,
} from '../services/participantService';

const selected = ref(null);
const formMode = ref(null); // null | 'new' | 'edit'
const rightMode = ref('list'); // 'list' | 'detail'
const listKey = ref(0); // hochzählen → Liste neu laden

const clone = (p) => JSON.parse(JSON.stringify(p));

const select = (p) => {
  selected.value = clone(p);
  rightMode.value = 'detail';
  formMode.value = null;
};

const edit = (p) => {
  selected.value = clone(p);
  formMode.value = 'edit';
  // rightMode NICHT anfassen
};

const createNew = () => {
  selected.value = null;
  formMode.value = 'new';
  // rightMode NICHT anfassen
};

const save = async (formData) => {
  try {
    const isUpdate = !!(formData.Id || formData.ParticipantId);
    if (isUpdate) {
      await updateParticipant(formData);
    } else {
      await createParticipant(formData);
    }
    selected.value = null;
    formMode.value = null;
    rightMode.value = 'list';
    listKey.value++;
  } catch (e) {
    console.error('Fehler beim Speichern:', e);
    alert('Fehler beim Speichern: ' + e.message);
  }
};

const closeForm = () => {
  formMode.value = null;
  // selected NICHT leeren → Detail bleibt sichtbar
};

const closeDetail = () => {
  selected.value = null;
  rightMode.value = 'list';
  formMode.value = null;
};

// Ganzes Objekt P übergeben, damit ID sicher gefunden wird
const remove = async (p) => {
  if (!confirm(`${p.FirstName} ${p.LastName} wirklich löschen?`)) return;
  try {
    const id = p.Id || p.ParticipantId;
    await deleteParticipant(id);
    selected.value = null;
    formMode.value = null;
    rightMode.value = 'list';
    listKey.value++;
  } catch (e) {
    console.error('Fehler beim Löschen:', e);
    alert('Fehler beim Löschen: ' + e.message);
  }
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
        :key="(selected?.Id || selected?.ParticipantId) ?? formMode"
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
        :key="listKey"
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
