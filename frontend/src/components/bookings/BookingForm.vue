<script setup>
import { ref, watch, computed, onMounted } from 'vue';
import { createBooking, updateBooking } from '../../services/bookingService';
import { getParticipants } from '../../services/participantService';
import { getCourses } from '../../services/courseService';
import { getModule } from '../../services/moduleService';

const props = defineProps({
  Booking: Object,
});

const emit = defineEmits(['save', 'cancel']);

const createEmptyForm = () => ({
  ParticipantId: '',
  IsSigned: false,
  PlannedStartDate: '',
  PlannedEndDate: '',
  ActualStartDate: '',
  ActualEndDate: '',
  BookingType: '',
  EndReason: '',
  Remarks: '',
  MonthlyRate: '',
  LocationId: '',
  SelectedModuleIds: [],
});

const Form = ref(createEmptyForm());
const Participants = ref([]);
const Courses = ref([]);
const AllModules = ref([]);

// "kurs" oder "einzeln"
const BuchungsModus = ref('kurs');
const SelectedCourseId = ref('');

// Module die zum gewählten Kurs gehören
const ModulesForCourse = computed(() => {
  if (!SelectedCourseId.value) return [];
  return AllModules.value.filter(
    (M) => String(M.CourseId) === String(SelectedCourseId.value)
  );
});

// Wenn Kurs gewählt wird → alle Module dieses Kurses automatisch setzen
watch(SelectedCourseId, (val) => {
  if (BuchungsModus.value === 'kurs' && val) {
    Form.value.SelectedModuleIds = ModulesForCourse.value.map(
      (M) => M.ModuleCodeId
    );
  }
});

// Wenn Modus wechselt → Auswahl zurücksetzen
watch(BuchungsModus, () => {
  SelectedCourseId.value = '';
  Form.value.SelectedModuleIds = [];
});

onMounted(async () => {
  Participants.value = await getParticipants();
  Courses.value = await getCourses();
  AllModules.value = await getModule();
});

watch(
  () => props.Booking,
  (Val) => {
    Form.value = Val
      ? { ...createEmptyForm(), ...Val, SelectedModuleIds: [] }
      : createEmptyForm();
  }
);

const Submit = async () => {
  if (Form.value.BookingId) {
    await updateBooking(Form.value);
  } else {
    await createBooking(Form.value);
  }
  emit('save');
};
</script>

<template>
  <div class="form">
    <h3>Buchung</h3>

    <label>Teilnehmer</label>
    <select v-model="Form.ParticipantId">
      <option disabled value="">Bitte wählen</option>
      <option
        v-for="P in Participants"
        :key="P.ParticipantId"
        :value="P.ParticipantId"
      >
        {{ P.FirstName }} {{ P.LastName }}
      </option>
    </select>

    <label>Buchungstyp</label>
    <select v-model="Form.BookingType">
      <option disabled value="">Bitte wählen</option>
      <option value="U">Umschulung</option>
      <option value="W">Weiterbildung</option>
      <option value="E">Einzelmodul</option>
    </select>

    <label>Start (geplant)</label>
    <input v-model="Form.PlannedStartDate" type="date" />

    <label>Ende (geplant)</label>
    <input v-model="Form.PlannedEndDate" type="date" />

    <label>Start (tatsächlich)</label>
    <input v-model="Form.ActualStartDate" type="date" />

    <label>Ende (tatsächlich)</label>
    <input v-model="Form.ActualEndDate" type="date" />

    <label>Monatliche Rate</label>
    <input v-model="Form.MonthlyRate" type="number" placeholder="0.00" />

    <label>Bemerkungen</label>
    <input v-model="Form.Remarks" placeholder="Bemerkungen" />

    <label class="checkbox">
      <input type="checkbox" v-model="Form.IsSigned" />
      <span>Vertrag unterschrieben</span>
    </label>

    <hr />

    <!-- MODULZUORDNUNG -->
    <label>Buchungsmodus</label>
    <select v-model="BuchungsModus">
      <option value="kurs">Kurs buchen (alle Module)</option>
      <option value="einzeln">Einzelne Module auswählen</option>
    </select>

    <!-- KURS-MODUS -->
    <template v-if="BuchungsModus === 'kurs'">
      <label>Kurs</label>
      <select v-model="SelectedCourseId">
        <option disabled value="">Bitte wählen</option>
        <option v-for="C in Courses" :key="C.id" :value="C.id">
          {{ C.title }}
        </option>
      </select>

      <div v-if="ModulesForCourse.length > 0">
        <p>
          <b>Enthaltene Module ({{ ModulesForCourse.length }}):</b>
        </p>
        <ul>
          <li v-for="M in ModulesForCourse" :key="M.ModuleCodeId">
            {{ M.ModuleCodeId }} —
            {{ M.Title ?? M.ModuleName ?? M.ModuleCodeId }}
          </li>
        </ul>
      </div>
    </template>

    <!-- EINZELMODUL-MODUS -->
    <template v-if="BuchungsModus === 'einzeln'">
      <label>Module auswählen (Mehrfachauswahl mit Strg/Cmd)</label>
      <select v-model="Form.SelectedModuleIds" multiple>
        <option
          v-for="M in AllModules"
          :key="M.ModuleCodeId"
          :value="M.ModuleCodeId"
        >
          {{ M.ModuleCodeId }} — {{ M.Title ?? M.ModuleName ?? M.ModuleCodeId }}
        </option>
      </select>
    </template>

    <br />
    <button @click="Submit">Speichern</button>
    <button @click="emit('cancel')">Abbrechen</button>
  </div>
</template>
