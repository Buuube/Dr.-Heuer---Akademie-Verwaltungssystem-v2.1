<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  participant: Object,
});

const emit = defineEmits(['save', 'cancel']);

const form = ref({
  salutation: 0,
  firstName: '',
  lastName: '',
  street: '',
  houseNumber: '',
  postalCodeId: '',
  dateOfBirth: '',
  email: '',
  phone: '',
  mobile: '',
  isEmployed: false,
});

watch(
  () => props.participant,
  (val) => {
    if (val) {
      form.value = { ...val };
    } else {
      form.value = {
        salutation: 0,
        firstName: '',
        lastName: '',
        street: '',
        houseNumber: '',
        postalCodeId: '',
        dateOfBirth: '',
        email: '',
        phone: '',
        mobile: '',
        isEmployed: false,
      };
    }
  }
);

const submit = () => {
  emit('save', form.value);
};

const cancel = () => {
  emit('cancel');
};
</script>

<template>
  <div class="form">
    <h3>Teilnehmer</h3>

    <!-- Administrative Daten -->
    <div>
      <label>Kundennummer</label>
      <input v-model="form.agencyCustomerNumber" placeholder="12345678" />

      <label>Berater (ID oder Name)</label>
      <input v-model="form.employmentAgentId" placeholder="Agent ID" />

      <label>
        <input type="checkbox" v-model="form.isSelfPayer" />
        Selbstzahler
      </label>
    </div>

    <hr />

    <!-- Persönliche Daten -->
    <div>
      <label>Anrede</label>
      <select v-model="form.salutation">
        <option :value="0">Herr</option>
        <option :value="1">Frau</option>
      </select>

      <label>Vorname</label>
      <input v-model="form.firstName" placeholder="Max" />

      <label>Nachname</label>
      <input v-model="form.lastName" placeholder="Mustermann" />

      <label>Geburtsdatum</label>
      <input v-model="form.dateOfBirth" type="date" />

      <label>Geburtsort</label>
      <input v-model="form.placeOfBirth" placeholder="Köln" />
    </div>

    <hr />

    <!-- Adresse -->
    <div>
      <label>Straße</label>
      <input v-model="form.street" placeholder="Straße" />

      <label>Hausnummer</label>
      <input v-model="form.houseNumber" placeholder="Nr." />

      <label>PLZ</label>
      <input v-model="form.postalCodeId" placeholder="PLZ ID" />
    </div>

    <hr />

    <!-- Kontakt -->
    <div>
      <label>E-Mail</label>
      <input v-model="form.email" placeholder="E-Mail" />

      <label>Telefon</label>
      <input v-model="form.phone" placeholder="Telefon" />

      <label>Mobil</label>
      <input v-model="form.mobile" placeholder="Mobil" />

      <label>Fax</label>
      <input v-model="form.fax" placeholder="Fax" />
    </div>

    <hr />

    <!-- Beschäftigung -->
    <div>
      <label>
        <input type="checkbox" v-model="form.isEmployed" />
        Beschäftigt
      </label>

      <label>Arbeitgeber</label>
      <input v-model="form.employer" placeholder="Firma" />

      <label>Beschäftigungsstart</label>
      <input v-model="form.employmentStartDate" type="date" />
    </div>

    <hr />

    <!-- Meta -->
    <div>
      <label>Erster Kontakt</label>
      <input v-model="form.firstContactDate" type="date" />

      <label>Kontaktquelle</label>
      <input v-model="form.contactSource" placeholder="z.B. Website" />
    </div>

    <button @click="submit">Speichern</button>
    <button @click="cancel">Abbrechen</button>
  </div>
</template>
