<script setup>
import { ref, watch } from 'vue';
import { getPostalCode } from '../../services/participantService';
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
  try {
    return new Date(val).toISOString().split('T')[0];
  } catch {
    return '';
  }
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
const errors = ref({});

watch(
  () => props.Participant,
  (val) => {
    errors.value = {};
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
    if (!val || String(val).length !== 5) return;
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
  const result = validateParticipant(form.value);
  errors.value = result.errors;
  if (!result.valid) return;
  emit('save', form.value);
};

const cancel = () => {
  emit('cancel');
};
</script>

<template>
  <div class="form">
    <h3>{{ props.title }}</h3>

    <div v-if="Object.keys(errors).length > 0" class="error-box form-row-full">
      Bitte korrigiere die markierten Felder
    </div>

    <div class="form-grid">
      <!-- Gruppe: Verwaltung -->
      <div class="form-group">
        <div class="form-group-title">Verwaltung</div>
        <label>Kundennummer</label>
        <input
          v-model="form.AgencyCustomerNumber"
          :class="{ 'input-error': errors.AgencyCustomerNumber }"
        />
        <div v-if="errors.AgencyCustomerNumber" class="error">
          {{ errors.AgencyCustomerNumber }}
        </div>

        <label>Berater</label>
        <input
          v-model="form.EmploymentAgentId"
          :class="{ 'input-error': errors.EmploymentAgentId }"
        />
        <div v-if="errors.EmploymentAgentId" class="error">
          {{ errors.EmploymentAgentId }}
        </div>

        <label>Erster Kontakt</label>
        <input
          v-model="form.FirstContactDate"
          type="date"
          :class="{ 'input-error': errors.FirstContactDate }"
        />
        <div v-if="errors.FirstContactDate" class="error">
          {{ errors.FirstContactDate }}
        </div>

        <label>Kontaktquelle</label>
        <input
          v-model="form.ContactSource"
          :class="{ 'input-error': errors.ContactSource }"
        />
        <div v-if="errors.ContactSource" class="error">
          {{ errors.ContactSource }}
        </div>
        <label class="checkbox">
          <input type="checkbox" v-model="form.IsSelfPayer" />
          <span>Selbstzahler</span>
        </label>
      </div>

      <!-- Gruppe: Person -->
      <div class="form-group">
        <div class="form-group-title">Person</div>
        <label>Anrede</label>
        <select v-model="form.Salutation">
          <option :value="false">Herr</option>
          <option :value="true">Frau</option>
        </select>

        <label>Vorname</label>
        <input
          v-model="form.FirstName"
          :class="{ 'input-error': errors.FirstName }"
        />
        <div v-if="errors.FirstName" class="error">{{ errors.FirstName }}</div>

        <label>Nachname</label>
        <input
          v-model="form.LastName"
          :class="{ 'input-error': errors.LastName }"
        />
        <div v-if="errors.LastName" class="error">{{ errors.LastName }}</div>

        <label>Geburtsdatum</label>
        <input
          v-model="form.DateOfBirth"
          type="date"
          :class="{ 'input-error': errors.DateOfBirth }"
        />
        <div v-if="errors.DateOfBirth" class="error">
          {{ errors.DateOfBirth }}
        </div>
        <label>Geburtsort</label>
        <input
          v-model="form.PlaceOfBirth"
          :class="{ 'input-error': errors.PlaceOfBirth }"
        />
        <div v-if="errors.PlaceOfBirth" class="error">
          {{ errors.PlaceOfBirth }}
        </div>
      </div>

      <!-- Gruppe: Adresse -->
      <div class="form-group">
        <div class="form-group-title">Adresse</div>
        <label>Straße</label>
        <input
          v-model="form.Street"
          :class="{ 'input-error': errors.Street }"
        />
        <div v-if="errors.Street" class="error">{{ errors.Street }}</div>
        <label>Hausnummer</label>
        <input
          v-model="form.HouseNumber"
          :class="{ 'input-error': errors.HouseNumber }"
        />
        <div v-if="errors.HouseNumber" class="error">
          {{ errors.HouseNumber }}
        </div>
        <label>PLZ</label>
        <input
          v-model="form.PostalCode"
          placeholder="44135"
          :class="{ 'input-error': errors.PostalCode }"
        />
        <div v-if="errors.PostalCode" class="error">
          {{ errors.PostalCode }}
        </div>
        <label>Wohnort</label>
        <input :value="form.City" disabled />
      </div>

      <!-- Gruppe: Kontakt -->
      <div class="form-group">
        <div class="form-group-title">Kontakt</div>
        <label>E-Mail</label>
        <input v-model="form.Email" :class="{ 'input-error': errors.Email }" />
        <div v-if="errors.Email" class="error">{{ errors.Email }}</div>
        <label>Telefon</label>
        <input v-model="form.Phone" />
        <label>Mobil</label>
        <input v-model="form.Mobile" />
        <div v-if="errors.PhoneMobile" class="error">
          {{ errors.PhoneMobile }}
        </div>
        <label>Fax</label>
        <input v-model="form.Fax" :class="{ 'input-error': errors.Fax }" />
        <div v-if="errors.Fax" class="error">{{ errors.Fax }}</div>
      </div>

      <!-- Gruppe: Beschäftigung -->
      <div class="form-group">
        <div class="form-group-title">Beschäftigung</div>

        <label class="checkbox">
          <input type="checkbox" v-model="form.IsEmployed" />
          <span>Beschäftigt</span>
        </label>

        <label>Arbeitgeber</label>
        <input
          v-model="form.Employer"
          :disabled="!form.IsEmployed"
          :class="{
            disabled: !form.IsEmployed,
            'input-error': errors.Employer,
          }"
        />
        <div v-if="errors.Employer" class="error">{{ errors.Employer }}</div>

        <!-- NEUE ZEILE: Selbstzahler + Startdatum nebeneinander -->
        <div class="inline-row">
          <div class="inline-field">
            <label>Startdatum</label>
            <input
              v-model="form.EmploymentStartDate"
              type="date"
              :disabled="!form.IsEmployed"
              :class="{
                disabled: !form.IsEmployed,
                'input-error': errors.EmploymentStartDate,
              }"
            />
            <div v-if="errors.EmploymentStartDate" class="error">
              {{ errors.EmploymentStartDate }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Aktionen -->
    <div class="form-actions">
      <button class="btn-submit" @click="submit">Speichern</button>
      <button class="btn-cancel" @click="cancel">Abbrechen</button>
    </div>
  </div>
</template>
