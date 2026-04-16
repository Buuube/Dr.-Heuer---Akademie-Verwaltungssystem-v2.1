<script setup>
const props = defineProps({
  Participant: Object,
  PostalCode: Object,
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
    <p>
      <b>Geburtstag:</b> {{ Participant.DateOfBirth }} <b>Geburtsort:</b>
      {{ Participant.PlaceOfBirth }}
    </p>

    <hr />
    <p><b>Kontaktdaten</b></p>
    <p>
      <b>Email:</b> {{ Participant.Email }} <b>Mobil:</b>
      {{ Participant.Mobile }}
    </p>
    <p>
      <b>Telefon:</b> {{ Participant.Phone }} <b>Fax:</b> {{ Participant.Fax }}
    </p>
    <hr />

    <p>
      <b>Adresse:</b> {{ Participant.Street }} <b>Hausnummer:</b>
      {{ Participant.HouseNumber }}
    </p>

    <p>
      <b>PLZ:</b>
      {{
        typeof Participant.PostalCode === 'string'
          ? Participant.PostalCode
          : Participant.PostalCode?.Code
      }}

      <b>Ort:</b>
      {{
        typeof Participant.PostalCode === 'string'
          ? Participant.City
          : Participant.PostalCode?.City
      }}
    </p>

    <p><b>Umschulungsort:</b> {{ Participant.Location?.Name }}</p>

    <hr />

    <p><b>Selbstzahler:</b> {{ Participant.IsSelfPayer ? 'Ja' : 'Nein' }}</p>
    <p><b>Beschäftigt:</b> {{ Participant.IsEmployed ? 'Ja' : 'Nein' }}</p>

    <p><b>Arbeitgeber:</b> {{ Participant.Employer || '-' }}</p>

    <hr />

    <button class="btn-edit" @click="emit('edit', Participant)">
      Bearbeiten
    </button>
    <button class="btn-delete" @click="emit('close')">Schließen</button>
  </div>
</template>
