<script setup>
import { ref, watch, onMounted } from 'vue';
import { getLocations, getPostalCode } from '../../services/participantService';
import { validateParticipant } from '../../utils/participantValidation';

const props = defineProps({
  Participant: Object,
  title: {
    type: String,
    default: 'Teilnehmer anlegen',
  },
});

const emit = defineEmits(['save', 'cancel']);

const formatDate = (val) => {
  if (!val) return '';
  return new Date(val).toISOString().split('T')[0];
};

const createEmptyForm = () => ({
  Salutation: false,
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
const errors = ref({});

const loadLocations = async () => {
  try {
    const result = await getLocations();
    Locations.value = Array.isArray(result) ? result : [];
  } catch (e) {
    console.error('Fehler beim Laden der Standorte:', e);
    Locations.value = [];
  }
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
        DateOfBirth: formatDate(val.DateOfBirth),
        FirstContactDate: formatDate(val.FirstContactDate),
        EmploymentStartDate: formatDate(val.EmploymentStartDate),
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

const validateForm = () => {
  const result = validateParticipant(form.value);
  errors.value = result.errors;
  return result.valid;
};

const submit = () => {
  const ok = validateForm();
  if (!ok) return;

  emit('save', form.value);
};

const cancel = () => {
  emit('cancel');
};
</script>

<template>
  <div class="form">
    <h3>{{ props.title }}</h3>

    <div v-if="!Object.keys(errors).length === false" class="error-box">
      Bitte korrigiere die markierten Felder
    </div>

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
      <div v-if="errors.FirstName" class="error">{{ errors.FirstName }}</div>

      <label>Nachname</label>
      <input v-model="form.LastName" />
      <div v-if="errors.LastName" class="error">{{ errors.LastName }}</div>

      <label>Geburtsdatum</label>
      <input v-model="form.DateOfBirth" type="date" />
      <div v-if="errors.DateOfBirth" class="error">
        {{ errors.DateOfBirth }}
      </div>

      <label>Geburtsort</label>
      <input v-model="form.PlaceOfBirth" />
      <div v-if="errors.PlaceOfBirth" class="error">
        {{ errors.PlaceOfBirth }}
      </div>
    </div>
    <hr />

    <div>
      <label>Straße</label>
      <input v-model="form.Street" />
      <div v-if="errors.Street" class="error">{{ errors.Street }}</div>

      <label>Hausnummer</label>
      <input v-model="form.HouseNumber" />
      <div v-if="errors.HouseNumber" class="error">
        {{ errors.HouseNumber }}
      </div>

      <label>PLZ</label>
      <input v-model="form.PostalCode" placeholder="44135" />
      <div v-if="errors.PostalCode" class="error">{{ errors.PostalCode }}</div>

      <label>Wohnort</label>
      <input :value="form.City" disabled />
    </div>

    <hr />

    <div>
      <label>E-Mail</label>
      <input v-model="form.Email" />
      <div v-if="errors.Email" class="error">{{ errors.Email }}</div>

      <label>Telefon</label>
      <input v-model="form.Phone" />

      <label>Mobil</label>
      <input v-model="form.Mobile" />

      <div v-if="errors.PhoneMobile" class="error">
        {{ errors.PhoneMobile }}
      </div>

      <label>Fax</label>
      <input v-model="form.Fax" />
      <div v-if="errors.Fax" class="error">{{ errors.Fax }}</div>
    </div>

    <hr />

    <div>
      <label class="checkbox">
        <input type="checkbox" v-model="form.IsEmployed" />
        <span>Beschäftigt</span>
      </label>

      <label>Arbeitgeber</label>
      <input v-model="form.Employer" :disabled="!form.IsEmployed" />

      <div v-if="errors.Employer" class="error">
        {{ errors.Employer }}
      </div>
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
