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
const bottomMode = ref('list'); // 'list' | 'detail'
const listKey = ref(0);

const clone = (p) => JSON.parse(JSON.stringify(p));

const select = (p) => {
  selected.value = clone(p);
  bottomMode.value = 'detail';
  formMode.value = null;
};

const edit = (p) => {
  selected.value = clone(p);
  formMode.value = 'edit';
};

const createNew = () => {
  selected.value = null;
  formMode.value = 'new';
  bottomMode.value = 'list';
};

const save = async (formData) => {
  try {
    const isUpdate = !!(formData.Id || formData.ParticipantId);

    let saved;

    if (isUpdate) {
      saved = await updateParticipant(formData);
    } else {
      saved = await createParticipant(formData);
    }

    // Falls Backend PostalCode nur als ID zurückgibt, aus formData übernehmen
    if (saved && typeof saved.PostalCode !== 'object') {
      saved.PostalCode = formData.PostalCode;
      saved.City = formData.City;
    }

    selected.value = saved || formData;

    formMode.value = null;
    bottomMode.value = 'detail';
    listKey.value++;
  } catch (e) {
    console.error('Fehler beim Speichern:', e);
    alert('Fehler beim Speichern: ' + e.message);
  }
};

const closeForm = () => {
  formMode.value = null;
};

const closeDetail = () => {
  selected.value = null;
  bottomMode.value = 'list';
  formMode.value = null;
};

const remove = async (p) => {
  if (!confirm(`${p.FirstName} ${p.LastName} wirklich löschen?`)) return;
  try {
    const id = p.Id || p.ParticipantId;
    await deleteParticipant(id);
    selected.value = null;
    formMode.value = null;
    bottomMode.value = 'list';
    listKey.value++;
  } catch (e) {
    console.error('Fehler beim Löschen:', e);
    alert('Fehler beim Löschen: ' + e.message);
  }
};
</script>

<template>
  <div class="participant-layout">
    <!-- OBEN: Button oder Form -->
    <div class="top-panel">
      <div v-if="formMode === null" class="top-panel-cta">
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

    <!-- UNTEN: Liste oder Detail -->
    <div class="bottom-panel">
      <ParticipantList
        v-if="bottomMode === 'list'"
        :key="listKey"
        :onEdit="edit"
        :onSelect="select"
        :onDelete="remove"
      />

      <ParticipantDetail
        v-if="bottomMode === 'detail'"
        :Participant="selected"
        @edit="edit"
        @close="closeDetail"
      />
    </div>
  </div>
</template>
