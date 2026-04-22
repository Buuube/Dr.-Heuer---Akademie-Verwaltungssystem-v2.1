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
  } catch (e) {
    confirmPending.value = null;
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
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.65);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  backdrop-filter: blur(4px);
}

.modal {
  background: rgba(5, 8, 20, 0.97);
  border: 1px solid rgba(120, 180, 255, 0.18);
  border-radius: 18px;
  padding: 24px 28px;
  min-width: 300px;
  max-width: 420px;
  box-shadow: 0 0 40px rgba(74, 163, 255, 0.15);
  color: #d7e6ff;
}

.modal p {
  margin: 0 0 20px 0;
  font-size: 14px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.btn-confirm {
  padding: 8px 18px;
  border-radius: 10px;
  border: 1px solid rgba(255, 77, 109, 0.4);
  background: rgba(255, 77, 109, 0.12);
  color: #ff4d6d;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 1px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-confirm:hover {
  box-shadow: 0 0 14px rgba(255, 77, 109, 0.35);
  border-color: rgba(255, 77, 109, 0.65);
}

.btn-modal-cancel {
  padding: 8px 18px;
  border-radius: 10px;
  border: 1px solid rgba(124, 247, 255, 0.15);
  background: rgba(74, 163, 255, 0.06);
  color: rgba(215, 230, 255, 0.6);
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 1px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-modal-cancel:hover {
  border-color: rgba(124, 247, 255, 0.3);
  color: #7cf7ff;
}
</style>
