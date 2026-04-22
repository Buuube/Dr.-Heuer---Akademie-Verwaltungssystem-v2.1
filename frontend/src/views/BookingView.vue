<script setup>
import { ref } from 'vue';
import BookingList from '../components/bookings/BookingList.vue';
import BookingForm from '../components/bookings/BookingForm.vue';
import BookingDetail from '../components/bookings/BookingDetail.vue';

const selected = ref(null);
const formMode = ref(null); // null | 'new' | 'edit'
const showDetail = ref(false);
const listKey = ref(0);

const clone = (b) => JSON.parse(JSON.stringify(b));

const select = (b) => {
  selected.value = clone(b);
  showDetail.value = true;
  formMode.value = null;
};

const edit = (b) => {
  selected.value = clone(b);
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

const remove = async (b) => {
  if (!confirm(`Buchung #${b.BookingId} wirklich löschen?`)) return;
  const { deleteBooking } = await import('../services/bookingService');
  const reason = prompt(
    'Stornierungsgrund-ID (leer lassen zum direkten Löschen):'
  );
  if (reason === null) return;
  await deleteBooking(b.BookingId, reason ? Number(reason) : null);
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
  </div>
</template>
