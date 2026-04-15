<script setup>
import { ref, watch, onMounted } from 'vue';
import { getLocations, getPostalCode } from '../../services/participantService';

const props = defineProps({
  Participant: Object,
  title: {
    type: String,
    default: 'Teilnehmer anlegen',
  },
});

const emit = defineEmits(['save', 'cancel']);

const createEmptyForm = () => ({
  Salutation: 0,
  FirstName: '',
  LastName: '',
  Street: '',
  HouseNumber: '',
  PostalCode: '',
  PostalCodeId: '',
  City: '',
  LocationID: '',
  DateOfBirth: '',
  PlaceOfBirth: '',
  Email: '',
  Phone: '',
  Mobile: '',
  Fax: '',
  IsSelfPayer: false,
  AgencyCustomerNumber: '',
  EmploymentAgentId: '',
  FirstContactDate: '',
  ContactSource: '',
  IsEmployed: false,
  EmploymentStartDate: '',
  Employer: '',
});

const form = ref(createEmptyForm());
const Locations = ref([]);

const loadLocations = async () => {
  Locations.value = await getLocations();
};

onMounted(() => {
  loadLocations();
});

watch(
  () => props.Participant,
  (val) => {
    if (val) {
      form.value = {
        ...createEmptyForm(),
        ...val,
      };
    } else {
      form.value = createEmptyForm();
    }
  },
  { immediate: true }
);

watch(
  () => form.value.PostalCode,
  async (val) => {
    if (!val || val.length !== 5) return;

    try {
      const result = await getPostalCode(val);

      if (result) {
        form.value.PostalCodeId = result.Id;
        form.value.City = result.City;
      } else {
        form.value.City = 'Nicht gefunden';
      }
    } catch (e) {
      console.error(e);
    }
  }
);

watch(
  () => form.value.IsEmployed,
  (val) => {
    if (!val) {
      form.value.Employer = '';
      form.value.EmploymentStartDate = '';
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
    <h3>{{ props.title }}</h3>
    <div>
      <label>Kundennummer</label>
      <input v-model="form.AgencyCustomerNumber" />

      <label>Berater</label>
      <input v-model="form.EmploymentAgentId" />
    </div>

    <hr />

    <div>
      <label>Anrede</label>
      <select v-model="form.Salutation">
        <option :value="false">Herr</option>
        <option :value="true">Frau</option>
      </select>

      <label>Vorname</label>
      <input v-model="form.FirstName" />

      <label>Nachname</label>
      <input v-model="form.LastName" />

      <label>Geburtsdatum</label>
      <input v-model="form.DateOfBirth" type="date" />

      <label>Geburtsort</label>
      <input v-model="form.PlaceOfBirth" />
    </div>

    <hr />

    <div>
      <label>Straße</label>
      <input v-model="form.Street" />

      <label>Hausnummer</label>
      <input v-model="form.HouseNumber" />

      <label>PLZ</label>
      <input v-model="form.PostalCode" placeholder="44135" />

      <label>Wohnort</label>
      <input :value="form.City" disabled />
    </div>

    <hr />

    <div>
      <label>E-Mail</label>
      <input v-model="form.Email" />

      <label>Telefon</label>
      <input v-model="form.Phone" />

      <label>Mobil</label>
      <input v-model="form.Mobile" />

      <label>Fax</label>
      <input v-model="form.Fax" />
    </div>

    <hr />

    <div>
      <label class="checkbox">
        <input type="checkbox" v-model="form.IsEmployed" />
        <span>Beschäftigt</span>
      </label>

      <label>Arbeitgeber</label>
      <input
        v-model="form.Employer"
        :disabled="!form.IsEmployed"
        :class="{ disabled: !form.IsEmployed }"
      />
    </div>

    <hr />

    <div>
      <label>Erster Kontakt</label>
      <input v-model="form.FirstContactDate" type="date" />

      <label>Kontaktquelle</label>
      <input v-model="form.ContactSource" />
    </div>

    <button @click="submit">Speichern</button>
    <button @click="cancel">Abbrechen</button>
  </div>
</template>
