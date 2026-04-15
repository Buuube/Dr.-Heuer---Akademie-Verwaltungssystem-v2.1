<script setup>
const props = defineProps({
  Participant: Object,
});

const emit = defineEmits(['edit', 'close']);
</script>

<template>
  <div v-if="Participant">
    <h3>Teilnehmer Details</h3>

    <p><b>Kundennummer:</b> {{ Participant.AgencyCustomerNumber }}</p>
    <p><b>Berater:</b> {{ Participant.EmploymentAgentId }}</p>

    <hr />

    <p><b>Name:</b> {{ Participant.FirstName }} {{ Participant.LastName }}</p>
    <p><b>Email:</b> {{ Participant.Email }}</p>

    <hr />

    <p>
      <b>Adresse:</b> {{ Participant.Street }} {{ Participant.HouseNumber }}
    </p>
    <p><b>PLZ:</b> {{ Participant.PostalCode?.Code }}</p>
    <p><b>Ort:</b> {{ Participant.PostalCode?.City }}</p>

    <p><b>Umschulungsort:</b> {{ Participant.Location?.Name }}</p>

    <hr />

    <p><b>Selbstzahler:</b> {{ Participant.IsSelfPayer ? 'Ja' : 'Nein' }}</p>
    <p><b>Beschäftigt:</b> {{ Participant.IsEmployed ? 'Ja' : 'Nein' }}</p>

    <p><b>Arbeitgeber:</b> {{ Participant.Employer || '-' }}</p>

    <hr />

    <button @click="emit('edit')">Bearbeiten</button>
    <button @click="emit('close')">Schließen</button>
  </div>
</template>
