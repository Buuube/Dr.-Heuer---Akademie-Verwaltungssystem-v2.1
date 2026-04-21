<script setup>
import { ref, watch, computed, onMounted } from 'vue';
import {
  createBooking,
  updateBooking,
  addBookingItems,
} from '../../services/bookingService';
import { getParticipants } from '../../services/participantService';
import { getCourses } from '../../services/courseService';
import { getModule } from '../../services/moduleService';
import {
  getModuleSessions,
  createModuleSession,
} from '../../services/moduleSessionService';

const props = defineProps({ Booking: Object });
const emit = defineEmits(['save', 'cancel']);

// ─── Schritt-Steuerung ───────────────────────────────────────────
// 'form' → Grunddaten + Modulauswahl
// 'sessions' → Session-Prüfung + Auswahl/Erstellung pro Modul
const Step = ref('form');

// ─── Stammdaten ──────────────────────────────────────────────────
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
  EducationalGoal: '',
  Duration: '',
  StartTerm: '',
  LocationId: '',
});

const Form = ref(createEmptyForm());
const Participants = ref([]);
const Courses = ref([]);
const AllModules = ref([]);

const BuchungsModus = ref('kurs');
const SelectedCourseId = ref('');
const SelectedSingleModuleIds = ref([]);

const ModulesForCourse = computed(() =>
  AllModules.value.filter(
    (M) => String(M.CourseId) === String(SelectedCourseId.value)
  )
);

// Die tatsächlich gebuchten Module (abhängig vom Modus)
const ResolvedModules = computed(() => {
  if (BuchungsModus.value === 'kurs') return ModulesForCourse.value;
  return AllModules.value.filter((M) =>
    SelectedSingleModuleIds.value.includes(M.ModuleCodeId)
  );
});

watch(BuchungsModus, () => {
  SelectedCourseId.value = '';
  SelectedSingleModuleIds.value = [];
});

onMounted(async () => {
  try {
    Participants.value = await getParticipants();
  } catch {
    Participants.value = [];
  }
  try {
    Courses.value = await getCourses();
  } catch {
    Courses.value = [];
  }
  try {
    AllModules.value = await getModule();
  } catch {
    AllModules.value = [];
  }
});

watch(
  () => props.Booking,
  (Val) => {
    Form.value = Val ? { ...createEmptyForm(), ...Val } : createEmptyForm();
    Step.value = 'form';
  }
);

// ─── Session-Logik ───────────────────────────────────────────────
// Pro Modul: { moduleCodeId, moduleName, sessions, selectedSessionId, showCreateForm, newSession }
const SessionResults = ref([]);

const checkSessions = async () => {
  if (!Form.value.PlannedStartDate || !Form.value.PlannedEndDate) {
    alert('Bitte Start- und Enddatum angeben.');
    return;
  }
  if (ResolvedModules.value.length === 0) {
    alert('Bitte mindestens ein Modul auswählen.');
    return;
  }

  SessionResults.value = [];

  for (const M of ResolvedModules.value) {
    const sessions = await getModuleSessions(
      M.ModuleCodeId,
      Form.value.PlannedStartDate,
      Form.value.PlannedEndDate
    );

    SessionResults.value.push({
      moduleCodeId: M.ModuleCodeId,
      moduleName: M.Name ?? M.ModuleCodeId,
      sessions,
      // Wenn genau eine Session → automatisch vorauswählen
      selectedSessionId:
        sessions.length === 1 ? sessions[0].ModuleSessionId : null,
      showCreateForm: sessions.length === 0,
      newSession: {
        moduleCodeId: M.ModuleCodeId,
        startDate: Form.value.PlannedStartDate,
        endDate: Form.value.PlannedEndDate,
        teachingStartTime: '08:00',
        teachingEndTime: '16:00',
        roomId: '',
        cost: '',
        registrationDeadline: Form.value.PlannedStartDate,
      },
      sessionCreated: false,
    });
  }

  Step.value = 'sessions';
};

const createSessionForModule = async (SR) => {
  try {
    const created = await createModuleSession(SR.newSession);
    SR.selectedSessionId = created.ModuleSessionId;
    SR.sessions = [created];
    SR.showCreateForm = false;
    SR.sessionCreated = true;
  } catch (e) {
    alert('Fehler beim Erstellen der Session: ' + e.message);
  }
};

const cancelSessionCreate = () => {
  Step.value = 'form';
};

// Prüfen ob alle Module eine Session haben
const AllSessionsResolved = computed(() =>
  SessionResults.value.every((SR) => SR.selectedSessionId !== null)
);

// ─── Speichern ───────────────────────────────────────────────────
const Submit = async () => {
  try {
    let bookingId;

    if (Form.value.BookingId) {
      const updated = await updateBooking(Form.value);
      bookingId = updated.BookingId;
    } else {
      const created = await createBooking(Form.value);
      bookingId = created.BookingId;
    }

    // BookingModule Einträge anlegen
    const items = SessionResults.value.map((SR) => ({
      moduleCodeId: SR.moduleCodeId,
      moduleSessionId: SR.selectedSessionId,
    }));

    await addBookingItems(bookingId, items);
    emit('save');
    Step.value = 'form';
  } catch (e) {
    alert('Fehler beim Speichern: ' + e.message);
  }
};
</script>

<template>
  <div class="form">
    <!-- ═══ SCHRITT 1: Grunddaten + Modulauswahl ═══ -->
    <template v-if="Step === 'form'">
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

      <label>Bildungsziel</label>
      <input
        v-model="Form.EducationalGoal"
        placeholder="z.B. Fachinformatiker AE"
      />

      <label>Starttermin</label>
      <input v-model="Form.StartTerm" placeholder="z.B. Mai 2026" />

      <label>Laufzeit</label>
      <input v-model="Form.Duration" placeholder="z.B. 24 Monate" />

      <label>Monatliche Rate</label>
      <input v-model="Form.MonthlyRate" type="number" placeholder="0.00" />

      <label>Bemerkungen</label>
      <input v-model="Form.Remarks" placeholder="Bemerkungen" />

      <label class="checkbox">
        <input type="checkbox" v-model="Form.IsSigned" />
        <span>Vertrag unterschrieben</span>
      </label>

      <hr />

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
          <option v-for="C in Courses" :key="C.CourseId" :value="C.CourseId">
            {{ C.Name }}
          </option>
        </select>

        <div v-if="ModulesForCourse.length > 0">
          <p>
            <b>Enthaltene Module ({{ ModulesForCourse.length }}):</b>
          </p>
          <ul>
            <li v-for="M in ModulesForCourse" :key="M.ModuleCodeId">
              {{ M.ModuleCodeId }} — {{ M.Name ?? M.ModuleCodeId }}
            </li>
          </ul>
        </div>
      </template>

      <!-- EINZELMODUL-MODUS -->
      <template v-if="BuchungsModus === 'einzeln'">
        <label>Module auswählen (Mehrfachauswahl mit Strg/Cmd)</label>
        <select v-model="SelectedSingleModuleIds" multiple>
          <option
            v-for="M in AllModules"
            :key="M.ModuleCodeId"
            :value="M.ModuleCodeId"
          >
            {{ M.ModuleCodeId }} — {{ M.Name ?? M.ModuleCodeId }}
          </option>
        </select>
      </template>

      <br />
      <button @click="checkSessions">Weiter →</button>
      <button @click="emit('cancel')">Abbrechen</button>
    </template>

    <!-- ═══ SCHRITT 2: Session-Auswahl pro Modul ═══ -->
    <template v-if="Step === 'sessions'">
      <h3>Sessions prüfen</h3>

      <div
        v-for="SR in SessionResults"
        :key="SR.moduleCodeId"
        style="
          margin-bottom: 20px;
          border-bottom: 1px solid #444;
          padding-bottom: 10px;
        "
      >
        <p>
          <b>{{ SR.moduleCodeId }} — {{ SR.moduleName }}</b>
        </p>

        <!-- Mehrere Sessions → Auswahl -->
        <template v-if="SR.sessions.length > 1">
          <label>Bitte Session auswählen:</label>
          <select v-model="SR.selectedSessionId">
            <option disabled :value="null">Bitte wählen</option>
            <option
              v-for="S in SR.sessions"
              :key="S.ModuleSessionId"
              :value="S.ModuleSessionId"
            >
              {{ S.StartDate }} – {{ S.EndDate }} | Raum: {{ S.RoomId }}
            </option>
          </select>
        </template>

        <!-- Genau eine Session → automatisch gewählt -->
        <template v-else-if="SR.sessions.length === 1 && !SR.showCreateForm">
          <p>
            ✔ Session gefunden: {{ SR.sessions[0].StartDate }} –
            {{ SR.sessions[0].EndDate }}
          </p>
        </template>

        <!-- Keine Session → Erstellen-Dialog -->
        <template v-else-if="SR.showCreateForm">
          <p style="color: orange">
            ⚠ Keine Session für diesen Zeitraum gefunden.
          </p>

          <div v-if="!SR.sessionCreated">
            <label>Startdatum Session</label>
            <input v-model="SR.newSession.startDate" type="date" />

            <label>Enddatum Session</label>
            <input v-model="SR.newSession.endDate" type="date" />

            <label>Unterrichtsstart</label>
            <input v-model="SR.newSession.teachingStartTime" type="time" />

            <label>Unterrichtsende</label>
            <input v-model="SR.newSession.teachingEndTime" type="time" />

            <label>Raum ID</label>
            <input
              v-model="SR.newSession.roomId"
              type="number"
              placeholder="Raum ID"
            />

            <label>Kosten</label>
            <input
              v-model="SR.newSession.cost"
              type="number"
              placeholder="0.00"
            />

            <label>Anmeldefrist</label>
            <input v-model="SR.newSession.registrationDeadline" type="date" />

            <br />
            <button @click="createSessionForModule(SR)">
              Session erstellen
            </button>
          </div>

          <p v-else style="color: green">✔ Session erstellt</p>
        </template>
      </div>

      <br />
      <button @click="Submit" :disabled="!AllSessionsResolved">
        Buchung speichern
      </button>
      <button @click="cancelSessionCreate">← Zurück</button>
    </template>
  </div>
</template>
