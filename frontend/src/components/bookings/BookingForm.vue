<script setup>
import { ref, watch } from 'vue';
import { saveBooking } from '../../services/bookingService';

const props = defineProps({
  Booking: Object,
});

const emit = defineEmits(['save', 'cancel']);

const Form = ref({
  ParticipantId: '',
  StartDate: '',
  EndDate: '',
  IsCancelled: false,
  CancellationReasonId: '',
});

watch(
  () => props.Booking,
  (Val) => {
    if (Val) {
      Form.value = { ...Val };
    } else {
      Form.value = {
        ParticipantId: '',
        StartDate: '',
        EndDate: '',
        IsCancelled: false,
        CancellationReasonId: '',
      };
    }
  }
);

const Submit = async () => {
  await saveBooking(Form.value);
  emit('save');
};
</script>

<template>
  <div class="form">
    <h3>Buchung</h3>

    <label>Teilnehmer (ID)</label>
    <input v-model="Form.ParticipantId" placeholder="Teilnehmer ID" />

    <label>Startdatum</label>
    <input v-model="Form.StartDate" type="date" />

    <label>Enddatum</label>
    <input v-model="Form.EndDate" type="date" />

    <label>
      <input type="checkbox" v-model="Form.IsCancelled" />
      Storniert
    </label>

    <template v-if="Form.IsCancelled">
      <label>Stornierungsgrund (ID)</label>
      <input v-model="Form.CancellationReasonId" placeholder="Grund ID" />
    </template>

    <br />
    <button @click="Submit">Speichern</button>
    <button @click="emit('cancel')">Abbrechen</button>
  </div>
</template>
