<script setup>
const props = defineProps({
  Booking: Object,
});

const emit = defineEmits(['edit', 'close']);
</script>

<template>
  <div v-if="Booking">
    <h3>Buchung Details</h3>

    <p><b>Teilnehmer:</b> {{ Booking.ParticipantName }}</p>

    <hr />

    <p><b>Startdatum:</b> {{ Booking.StartDate }}</p>
    <p><b>Enddatum:</b> {{ Booking.EndDate }}</p>

    <hr />

    <p><b>Storniert:</b> {{ Booking.IsCancelled ? 'Ja' : 'Nein' }}</p>
    <p v-if="Booking.IsCancelled">
      <b>Stornierungsgrund:</b> {{ Booking.CancellationReasonId || '-' }}
    </p>

    <hr />

    <button @click="emit('edit')">Bearbeiten</button>
    <button @click="emit('close')">Schließen</button>
  </div>
</template>
