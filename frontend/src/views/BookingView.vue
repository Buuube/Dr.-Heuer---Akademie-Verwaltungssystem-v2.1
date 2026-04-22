<script setup>
import { ref } from 'vue';
import BookingList from '../components/bookings/BookingList.vue';
import BookingForm from '../components/bookings/BookingForm.vue';
import BookingDetail from '../components/bookings/BookingDetail.vue';
import { deleteBooking } from '../services/bookingService';

const selected = ref(null);
const formMode = ref(null);
const showDetail = ref(false);
const listKey = ref(0);

const confirmPending = ref(null);
const confirmReasonInput = ref('');

const clone = (b) => JSON.parse(JSON.stringify(b));

const select = (b) => {
  selected.value = clone(b);
  showDetail.value = true;
  formMode.value = null;
};

const edit = (b) => {
  if (b) selected.value = clone(b);
  formMode.value = 'edit';
  showDetail.value = false;
};

const createNew = () => {
  selected.value = null;
  formMode.value = 'new';
  showDetail.value = false;
};

const save = () => {
  formMode.value = null;
  showDetail.value = false;
  selected.value = null;
  listKey.value++;
};

const closeForm = () => {
  formMode.value = null;
};

const closeDetail = () => {
  selected.value = null;
  showDetail.value = false;
};

const remove = (b) => {
  confirmPending.value = b;
  confirmReasonInput.value = '';
};

const confirmRemove = async () => {
  const reason = confirmReasonInput.value
    ? Number(confirmReasonInput.value)
    : null;
  await deleteBooking(confirmPending.value.BookingId, reason);
  confirmPending.value = null;
  selected.value = null;
  showDetail.value = false;
  listKey.value++;
};
</script>

<template>
  <div class="course-layout">
    <!-- OBEN: Button oder Form -->
    <div class="top-panel">
      <div v-if="formMode === null" class="top-panel-cta">
        <button class="btn-new_part" @click="createNew">
          Neue Buchung anlegen
        </button>
      </div>

      <BookingForm
        v-if="formMode !== null"
        :Booking="selected"
        :title="formMode === 'edit' ? 'Buchung bearbeiten' : 'Buchung anlegen'"
        @save="save"
        @cancel="closeForm"
      />
    </div>

    <!-- UNTEN: Liste oder Detail -->
    <div class="bottom-panel">
      <BookingList
        v-if="!showDetail"
        :key="listKey"
        :onEdit="edit"
        :onSelect="select"
        :onDelete="remove"
      />

      <BookingDetail
        v-if="showDetail"
        :Booking="selected"
        @edit="edit(selected)"
        @close="closeDetail"
      />
    </div>

    <!-- Bestätigungs-Modal Löschen -->
    <div v-if="confirmPending" class="modal-overlay">
      <div class="modal">
        <p>Buchung #{{ confirmPending.BookingId }} wirklich löschen?</p>
        <div class="modal-input">
          <label>Stornierungsgrund-ID (optional)</label>
          <input
            v-model="confirmReasonInput"
            placeholder="z.B. 1"
            type="number"
          />
        </div>
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
  margin: 0 0 16px 0;
  font-size: 14px;
}

.modal-input {
  margin-bottom: 20px;
}

.modal-input label {
  display: block;
  font-size: 11px;
  color: rgba(215, 230, 255, 0.6);
  margin-bottom: 6px;
}

.modal-input input {
  width: 100%;
  padding: 8px 10px;
  border-radius: 10px;
  border: 1px solid rgba(124, 247, 255, 0.15);
  background: rgba(0, 0, 0, 0.25);
  color: #d7e6ff;
  outline: none;
  box-sizing: border-box;
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
