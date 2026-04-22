<script setup>
const props = defineProps({
  Participant: Object,
  PostalCode: Object,
});

const emit = defineEmits(['edit', 'close']);
</script>

<template>
  <div v-if="Participant" class="detail-panel">
    <h3>Teilnehmer Details</h3>

    <div class="detail-grid">
      <!-- Verwaltung -->
      <div class="detail-group">
        <div class="detail-group-title">Verwaltung</div>
        <div class="detail-row">
          <span class="detail-label">Kundennummer</span
          ><span>{{ Participant.AgencyCustomerNumber || '-' }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Berater</span
          ><span>{{ Participant.EmploymentAgentId || '-' }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Erstkontakt</span>
          <span>
            {{
              Participant?.FirstContactDate
                ? new Date(Participant.FirstContactDate).toLocaleDateString(
                    'de-DE'
                  )
                : '-'
            }}</span
          >
        </div>
        <div class="detail-row">
          <span class="detail-label">Selbstzahler</span
          ><span>{{ Participant.IsSelfPayer ? 'Ja' : 'Nein' }}</span>
        </div>
      </div>

      <!-- Person -->
      <div class="detail-group">
        <div class="detail-group-title">Person</div>

        <div class="detail-row">
          <span class="detail-label">Anrede</span
          ><span>{{ Participant.Salutation ? 'Frau' : 'Mann' }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Name</span
          ><span>{{ Participant.FirstName }} {{ Participant.LastName }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Geburtsdatum</span
          ><span>
            {{
              Participant?.DateOfBirth
                ? new Date(Participant.DateOfBirth).toLocaleDateString('de-DE')
                : '-'
            }}</span
          >
        </div>
        <div class="detail-row">
          <span class="detail-label">Geburtsort</span
          ><span>{{ Participant.PlaceOfBirth || '-' }}</span>
        </div>
      </div>

      <!-- Adresse -->
      <div class="detail-group">
        <div class="detail-group-title">Adresse</div>
        <div class="detail-row">
          <span class="detail-label">Straße</span>
          <span>{{ Participant.Street }} {{ Participant.HouseNumber }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">PLZ / Ort</span>
          <span>
            {{
              typeof Participant.PostalCode === 'string'
                ? Participant.PostalCode
                : Participant.PostalCode?.Code
            }}
            {{
              typeof Participant.PostalCode === 'string'
                ? Participant.City
                : Participant.PostalCode?.City
            }}
          </span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Standort</span
          ><span>{{ Participant.Location?.Name || '-' }}</span>
        </div>
      </div>

      <!-- Kontakt -->
      <div class="detail-group">
        <div class="detail-group-title">Kontakt</div>
        <div class="detail-row">
          <span class="detail-label">E-Mail</span
          ><span>{{ Participant.Email || '-' }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Telefon</span
          ><span>{{ Participant.Phone || '-' }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Mobil</span
          ><span>{{ Participant.Mobile || '-' }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Fax</span
          ><span>{{ Participant.Fax || '-' }}</span>
        </div>
      </div>

      <!-- Beschäftigung -->
      <div class="detail-group">
        <div class="detail-group-title">Beschäftigung</div>
        <div class="detail-row">
          <span class="detail-label">Beschäftigt</span
          ><span>{{ Participant.IsEmployed ? 'Ja' : 'Nein' }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Arbeitgeber</span
          ><span>{{ Participant.Employer || '-' }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Startdatum</span>
          <span>
            {{
              Participant?.EmploymentStartDate
                ? new Date(Participant.EmploymentStartDate).toLocaleDateString(
                    'de-DE'
                  )
                : '-'
            }}</span
          >
        </div>
      </div>
    </div>

    <div class="detail-actions">
      <button class="btn-edit" @click="emit('edit', Participant)">
        Bearbeiten
      </button>
      <button class="btn-delete" @click="emit('close')">Schließen</button>
    </div>
  </div>
</template>
