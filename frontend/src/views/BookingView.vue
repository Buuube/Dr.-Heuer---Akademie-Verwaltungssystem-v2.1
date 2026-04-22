<script setup>
import { ref } from 'vue';
import BookingList from '../components/bookings/BookingList.vue';
import BookingForm from '../components/bookings/BookingForm.vue';
import BookingDetail from '../components/bookings/BookingDetail.vue';

const Selected = ref(null);
const Mode = ref('list');
const ListKey = ref(0);

const Select = (B) => {
  Selected.value = JSON.parse(JSON.stringify(B));
  Mode.value = 'detail';
};

const Edit = (B) => {
  if (B) {
    Selected.value = JSON.parse(JSON.stringify(B));
  }
  Mode.value = 'list';
};

const Save = () => {
  Selected.value = null;
  Mode.value = 'list';
  ListKey.value++;
};

const Close = () => {
  Selected.value = null;
  Mode.value = 'list';
};
</script>

<template>
  <div class="participant-layout">
    <div class="form">
      <BookingForm :Booking="Selected" @save="Save" @cancel="Close" />
    </div>

    <div class="list-panel">
      <BookingList
        :key="ListKey"
        v-if="Mode === 'list'"
        :OnEdit="Edit"
        :OnSelect="Select"
      />

      <BookingDetail
        v-if="Mode === 'detail'"
        :Booking="Selected"
        @edit="Edit"
        @close="Close"
      />
    </div>
  </div>
</template>
