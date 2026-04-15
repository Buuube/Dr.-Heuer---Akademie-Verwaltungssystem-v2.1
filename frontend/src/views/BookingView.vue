<script setup>
import { ref } from 'vue';
import BookingList from '../components/bookings/BookingList.vue';
import BookingForm from '../components/bookings/BookingForm.vue';
import BookingDetail from '../components/bookings/BookingDetail.vue';
import { saveBooking } from '../services/bookingService';

const Selected = ref(null);
const Mode = ref('list');
// list | detail

const Select = (B) => {
  Selected.value = structuredClone(B);
  Mode.value = 'detail';
};

const Edit = (B) => {
  Selected.value = structuredClone(B);
  Mode.value = 'list';
};

const CreateNew = () => {
  Selected.value = null;
};

const Save = async (B) => {
  await saveBooking(B);
  Selected.value = null;
  Mode.value = 'list';
};

const Close = () => {
  Selected.value = null;
  Mode.value = 'list';
};
</script>

<template>
  <div class="participant-layout">
    <!-- LINKS: FORM (IMMER SICHTBAR) -->
    <div class="form">
      <BookingForm :Booking="Selected" @save="Save" @cancel="Close" />
    </div>

    <!-- RECHTS -->
    <div class="list-panel">
      <BookingList v-if="Mode === 'list'" :OnEdit="Edit" :OnSelect="Select" />

      <BookingDetail
        v-if="Mode === 'detail'"
        :Booking="Selected"
        @edit="Edit"
        @close="Close"
      />
    </div>
  </div>
</template>
