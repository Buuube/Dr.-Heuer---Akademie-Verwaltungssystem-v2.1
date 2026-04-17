<script setup>
const props = defineProps({
  Booking: Object,
});

const emit = defineEmits(['edit', 'close']);
</script>

<template>
  <div v-if="Booking">
    <h3>Buchung Details</h3>

    <p><b>Buchungs-ID:</b> {{ Booking.BookingId }}</p>
    <p><b>Teilnehmer ID:</b> {{ Booking.ParticipantId }}</p>
    <p><b>Typ:</b> {{ Booking.BookingType }}</p>

    <hr />

    <p><b>Start (geplant):</b> {{ Booking.PlannedStartDate }}</p>
    <p><b>Ende (geplant):</b> {{ Booking.PlannedEndDate }}</p>
    <p><b>Start (tatsächlich):</b> {{ Booking.ActualStartDate || '-' }}</p>
    <p><b>Ende (tatsächlich):</b> {{ Booking.ActualEndDate || '-' }}</p>

    <hr />

    <p><b>Monatliche Rate:</b> {{ Booking.MonthlyRate || '-' }}</p>
    <p><b>Bemerkungen:</b> {{ Booking.Remarks || '-' }}</p>
    <p><b>Unterschrieben:</b> {{ Booking.IsSigned ? 'Ja' : 'Nein' }}</p>

    <hr />

    <button @click="emit('edit')">Bearbeiten</button>
    <button @click="emit('close')">Schließen</button>
  </div>
</template>
