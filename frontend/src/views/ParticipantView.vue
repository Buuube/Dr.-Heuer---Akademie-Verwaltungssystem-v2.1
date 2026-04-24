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
const formMode = ref(null);
const bottomMode = ref('list');
const listKey = ref(0);
const confirmPending = ref(null);
const successMessage = ref(null);
const errorMessage = ref(null);

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
    errorMessage.value = 'Fehler beim Speichern: ' + e.message;
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

const remove = (p) => {
  confirmPending.value = p;
};

const confirmRemove = async () => {
  try {
    const id = confirmPending.value.Id || confirmPending.value.ParticipantId;
    await deleteParticipant(id);
    confirmPending.value = null;
    selected.value = null;
    formMode.value = null;
    bottomMode.value = 'list';
    listKey.value++;
    successMessage.value = 'Der Teilnehmer wurde erfolgreich gelöscht.';
  } catch (e) {
    confirmPending.value = null;
    errorMessage.value = 'Fehler beim Löschen: ' + e.message;
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

    <!-- Bestätigungs-Modal Löschen -->
    <div v-if="confirmPending" class="modal-overlay">
      <div class="modal">
        <p>
          {{ confirmPending.FirstName }} {{ confirmPending.LastName }} wirklich
          löschen?
        </p>
        <div class="modal-actions">
          <button class="btn-modal-cancel" @click="confirmPending = null">
            Abbrechen
          </button>
          <button class="btn-confirm" @click="confirmRemove">Löschen</button>
        </div>
      </div>
    </div>

    <!-- Erfolgs-Popup -->
    <div v-if="successMessage" class="modal-overlay">
      <div class="modal">
        <p>{{ successMessage }}</p>
        <div class="modal-actions">
          <button class="btn-success" @click="successMessage = null">OK</button>
        </div>
      </div>
    </div>

    <!-- Fehler-Popup -->
    <div v-if="errorMessage" class="modal-overlay">
      <div class="modal">
        <p>{{ errorMessage }}</p>
        <div class="modal-actions">
          <button class="btn-modal-cancel" @click="errorMessage = null">
            OK
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
