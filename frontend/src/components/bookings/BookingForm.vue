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
import { getRooms } from '../../services/roomService';
import { getLocations } from '../../services/locationService';

const props = defineProps({
  Booking: Object,
  title: { type: String, default: 'Buchung anlegen' },
});
const emit = defineEmits(['save', 'cancel']);

const Step = ref('form');
const errors = ref({});
const sessionErrors = ref([]);

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
const Rooms = ref([]);
const Locations = ref([]);

// Teilnehmer-Suche
const ParticipantSearch = ref('');
const ShowParticipantDropdown = ref(false);

const FilteredParticipants = computed(() => {
  const s = ParticipantSearch.value.toLowerCase();
  if (!s) return Participants.value.slice(0, 20);
  return Participants.value
    .filter((P) => `${P.FirstName} ${P.LastName}`.toLowerCase().includes(s))
    .slice(0, 20);
});

const selectParticipant = (P) => {
  Form.value.ParticipantId = P.ParticipantId;
  ParticipantSearch.value = `${P.FirstName} ${P.LastName}`;
  ShowParticipantDropdown.value = false;
};

// Modul-Auswahl
const BuchungsModus = ref('kurs');
const SelectedCourseId = ref('');
const SelectedSingleModuleId = ref('');

const ModulesForCourse = computed(() =>
  AllModules.value.filter(
    (M) => String(M.CourseId) === String(SelectedCourseId.value)
  )
);

const ResolvedModules = computed(() => {
  if (BuchungsModus.value === 'kurs') return ModulesForCourse.value;
  if (!SelectedSingleModuleId.value) return [];
  return AllModules.value.filter(
    (M) => M.ModuleCodeId === SelectedSingleModuleId.value
  );
});

watch(BuchungsModus, () => {
  SelectedCourseId.value = '';
  SelectedSingleModuleId.value = '';
  errors.value = {};
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
  try {
    Rooms.value = await getRooms();
  } catch {
    Rooms.value = [];
  }
  try {
    Locations.value = await getLocations();
  } catch {
    Locations.value = [];
  }
});

watch(
  () => props.Booking,
  (Val) => {
    errors.value = {};
    if (Val) {
      Form.value = {
        ...createEmptyForm(),
        ...Val,
        PlannedStartDate: Val.PlannedStartDate?.slice(0, 10) ?? '',
        PlannedEndDate: Val.PlannedEndDate?.slice(0, 10) ?? '',
        ActualStartDate: Val.ActualStartDate?.slice(0, 10) ?? '',
        ActualEndDate: Val.ActualEndDate?.slice(0, 10) ?? '',
      };
      if (Val.ParticipantId && Participants.value.length > 0) {
        const P = Participants.value.find(
          (p) => p.ParticipantId === Val.ParticipantId
        );
        if (P) ParticipantSearch.value = `${P.FirstName} ${P.LastName}`;
      }
    } else {
      Form.value = createEmptyForm();
      ParticipantSearch.value = '';
    }
    Step.value = 'form';
  },
  { immediate: true }
);

watch(Participants, () => {
  if (Form.value.ParticipantId && !ParticipantSearch.value) {
    const P = Participants.value.find(
      (p) => p.ParticipantId === Form.value.ParticipantId
    );
    if (P) ParticipantSearch.value = `${P.FirstName} ${P.LastName}`;
  }
});

const validateForm = () => {
  const e = {};
  if (!Form.value.ParticipantId)
    e.ParticipantId = 'Teilnehmer ist erforderlich';
  if (!Form.value.BookingType) e.BookingType = 'Buchungstyp ist erforderlich';
  if (!Form.value.PlannedStartDate)
    e.PlannedStartDate = 'Startdatum ist erforderlich';
  if (!Form.value.PlannedEndDate)
    e.PlannedEndDate = 'Enddatum ist erforderlich';
  if (BuchungsModus.value === 'kurs' && !SelectedCourseId.value)
    e.SelectedCourseId = 'Kurs ist erforderlich';
  if (BuchungsModus.value === 'einzeln' && !SelectedSingleModuleId.value)
    e.SelectedSingleModuleId = 'Modul ist erforderlich';
  errors.value = e;
  return Object.keys(e).length === 0;
};

const SessionResults = ref([]);

const checkSessions = async () => {
  if (!validateForm()) return;

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
  sessionErrors.value = [];
  try {
    const created = await createModuleSession(SR.newSession);
    SR.selectedSessionId = created.ModuleSessionId;
    SR.sessions = [created];
    SR.showCreateForm = false;
    SR.sessionCreated = true;
  } catch (e) {
    sessionErrors.value = ['Fehler beim Erstellen der Session: ' + e.message];
  }
};

const AllSessionsResolved = computed(() =>
  SessionResults.value.every((SR) => SR.selectedSessionId !== null)
);

const Submit = async () => {
  sessionErrors.value = [];
  try {
    let bookingId;

    if (Form.value.BookingId) {
      const updated = await updateBooking(Form.value);
      bookingId = updated.BookingId;
    } else {
      const created = await createBooking(Form.value);
      bookingId = created.BookingId;
    }

    const items = SessionResults.value.map((SR) => ({
      moduleCodeId: SR.moduleCodeId,
      moduleSessionId: SR.selectedSessionId,
    }));

    if (items.length > 0) {
      await addBookingItems(bookingId, items);
    }

    emit('save');
    Step.value = 'form';
  } catch (e) {
    sessionErrors.value = ['Fehler beim Speichern: ' + e.message];
  }
};
</script>

<template>
  <div class="form">
    <!-- ═══ SCHRITT 1: Grunddaten + Modulauswahl ═══ -->
    <template v-if="Step === 'form'">
      <h3>{{ props.title }}</h3>

      <div v-if="Object.keys(errors).length > 0" class="error-box">
        Bitte korrigiere die markierten Felder
      </div>

      <div class="form-grid">
        <!-- Gruppe: Buchung -->
        <div class="form-group">
          <div class="form-group-title">Buchung</div>

          <label>Teilnehmer</label>
          <div style="position: relative">
            <input
              v-model="ParticipantSearch"
              placeholder="Name suchen..."
              :class="{ 'input-error': errors.ParticipantId }"
              @focus="ShowParticipantDropdown = true"
              @blur="setTimeout(() => (ShowParticipantDropdown = false), 150)"
              autocomplete="off"
            />
            <div
              v-if="ShowParticipantDropdown && FilteredParticipants.length > 0"
              style="
                position: absolute;
                top: 100%;
                left: 0;
                right: 0;
                z-index: 50;
                background: var(--dropdown-bg, rgba(5, 8, 20, 0.97));
                border: 1px solid var(--border);
                border-radius: 10px;
                max-height: 200px;
                overflow-y: auto;
                box-shadow: 0 0 20px rgba(74, 163, 255, 0.2);
              "
            >
              <div
                v-for="P in FilteredParticipants"
                :key="P.ParticipantId"
                @mousedown="selectParticipant(P)"
                style="
                  padding: 8px 12px;
                  font-size: 13px;
                  cursor: pointer;
                  border-bottom: 1px solid rgba(124, 247, 255, 0.06);
                  color: var(--text);
                "
                @mouseover="
                  $event.currentTarget.style.background = 'rgba(74,163,255,0.1)'
                "
                @mouseleave="
                  $event.currentTarget.style.background = 'transparent'
                "
              >
                {{ P.FirstName }} {{ P.LastName }}
              </div>
            </div>
          </div>
          <div v-if="errors.ParticipantId" class="error">
            {{ errors.ParticipantId }}
          </div>

          <label>Buchungstyp</label>
          <select
            v-model="Form.BookingType"
            :class="{ 'input-error': errors.BookingType }"
          >
            <option disabled value="">Bitte wählen</option>
            <option value="U">Umschulung</option>
            <option value="W">Weiterbildung</option>
            <option value="E">Einzelmodul</option>
          </select>
          <div v-if="errors.BookingType" class="error">
            {{ errors.BookingType }}
          </div>

          <label>Bildungsziel</label>
          <input
            v-model="Form.EducationalGoal"
            placeholder="z.B. Fachinformatiker AE"
          />

          <label>Starttermin</label>
          <input v-model="Form.StartTerm" placeholder="z.B. Mai 2026" />

          <label>Laufzeit</label>
          <input v-model="Form.Duration" placeholder="z.B. 24 Monate" />

          <label>Location</label>
          <select v-model="Form.LocationId">
            <option value="">Keine</option>
            <option
              v-for="L in Locations"
              :key="L.LocationId"
              :value="L.LocationId"
            >
              {{ L.Name }}
            </option>
          </select>
        </div>

        <!-- Gruppe: Zeitraum -->
        <div class="form-group">
          <div class="form-group-title">Zeitraum</div>

          <label>Start (geplant)</label>
          <input
            v-model="Form.PlannedStartDate"
            type="date"
            :class="{ 'input-error': errors.PlannedStartDate }"
          />
          <div v-if="errors.PlannedStartDate" class="error">
            {{ errors.PlannedStartDate }}
          </div>

          <label>Ende (geplant)</label>
          <input
            v-model="Form.PlannedEndDate"
            type="date"
            :class="{ 'input-error': errors.PlannedEndDate }"
          />
          <div v-if="errors.PlannedEndDate" class="error">
            {{ errors.PlannedEndDate }}
          </div>

          <label>Start (tatsächlich)</label>
          <input
            v-model="Form.ActualStartDate"
            type="date"
            :disabled="!Form.BookingId"
            :class="{ disabled: !Form.BookingId }"
          />

          <label>Ende (tatsächlich)</label>
          <input
            v-model="Form.ActualEndDate"
            type="date"
            :disabled="!Form.BookingId"
            :class="{ disabled: !Form.BookingId }"
          />
        </div>

        <!-- Gruppe: Finanzen -->
        <div class="form-group">
          <div class="form-group-title">Finanzen</div>

          <label>Monatliche Rate</label>
          <input v-model="Form.MonthlyRate" type="number" placeholder="0.00" />

          <label>Bemerkungen</label>
          <input v-model="Form.Remarks" placeholder="Bemerkungen" />

          <label class="checkbox">
            <input type="checkbox" v-model="Form.IsSigned" />
            <span>Vertrag unterschrieben</span>
          </label>
        </div>

        <!-- Gruppe: Module -->
        <div class="form-group">
          <div class="form-group-title">Module</div>

          <label>Buchungsmodus</label>
          <select v-model="BuchungsModus">
            <option value="kurs">Kurs buchen (alle Module)</option>
            <option value="einzeln">Einzelnes Modul</option>
          </select>

          <!-- KURS-MODUS -->
          <template v-if="BuchungsModus === 'kurs'">
            <label>Kurs auswählen</label>
            <select
              v-model="SelectedCourseId"
              size="8"
              :class="{ 'input-error': errors.SelectedCourseId }"
              style="height: 200px"
            >
              <option
                v-for="C in Courses"
                :key="C.CourseId"
                :value="C.CourseId"
              >
                {{ C.Name }}
              </option>
            </select>
            <div v-if="errors.SelectedCourseId" class="error">
              {{ errors.SelectedCourseId }}
            </div>

            <div
              v-if="ModulesForCourse.length > 0"
              style="margin-top: 6px; font-size: 12px; color: var(--muted)"
            >
              {{ ModulesForCourse.length }} Module enthalten
            </div>
          </template>

          <!-- EINZELMODUL-MODUS -->
          <template v-if="BuchungsModus === 'einzeln'">
            <label>Modul auswählen</label>
            <select
              v-model="SelectedSingleModuleId"
              size="8"
              :class="{ 'input-error': errors.SelectedSingleModuleId }"
              style="height: 200px"
            >
              <option
                v-for="M in AllModules"
                :key="M.ModuleCodeId"
                :value="M.ModuleCodeId"
              >
                {{ M.ModuleCodeId }} — {{ M.Name ?? M.ModuleCodeId }}
              </option>
            </select>
            <div v-if="errors.SelectedSingleModuleId" class="error">
              {{ errors.SelectedSingleModuleId }}
            </div>
          </template>
        </div>
      </div>

      <div class="form-actions">
        <button class="btn-submit" @click="checkSessions">Weiter →</button>
        <button class="btn-cancel" @click="emit('cancel')">Abbrechen</button>
      </div>
    </template>

    <!-- ═══ SCHRITT 2: Session-Auswahl pro Modul ═══ -->
    <template v-if="Step === 'sessions'">
      <h3>Sessions prüfen</h3>

      <div v-if="sessionErrors.length > 0" class="error-box">
        <div v-for="e in sessionErrors" :key="e">{{ e }}</div>
      </div>

      <div style="padding: 16px 20px">
        <div
          v-for="SR in SessionResults"
          :key="SR.moduleCodeId"
          style="
            margin-bottom: 16px;
            padding-bottom: 16px;
            border-bottom: 1px solid var(--border);
          "
        >
          <div
            style="
              font-size: 13px;
              font-weight: 600;
              margin-bottom: 8px;
              color: var(--cyan);
            "
          >
            {{ SR.moduleCodeId }} — {{ SR.moduleName }}
          </div>

          <!-- Mehrere Sessions → Auswahl -->
          <template v-if="SR.sessions.length > 1">
            <label style="font-size: 11px; color: var(--muted)"
              >Session auswählen</label
            >
            <select
              v-model="SR.selectedSessionId"
              style="
                width: 100%;
                padding: 8px;
                border-radius: 10px;
                border: 1px solid var(--border-input);
                background: var(--bg-input);
                color: var(--text);
                margin-top: 4px;
              "
            >
              <option disabled :value="null">Bitte wählen</option>
              <option
                v-for="S in SR.sessions"
                :key="S.ModuleSessionId"
                :value="S.ModuleSessionId"
              >
                {{ new Date(S.StartDate).toISOString().slice(0, 10) }} –
                {{ new Date(S.EndDate).toISOString().slice(0, 10) }}
              </option>
            </select>
          </template>

          <!-- Genau eine Session → automatisch gewählt -->
          <template v-else-if="SR.sessions.length === 1">
            <div style="font-size: 12px; color: var(--muted)">
              ✔ Session:
              {{
                new Date(SR.sessions[0].StartDate).toISOString().slice(0, 10)
              }}
              –
              {{ new Date(SR.sessions[0].EndDate).toISOString().slice(0, 10) }}
            </div>
          </template>

          <!-- Keine Session → Erstellen-Dialog -->
          <template v-else-if="SR.showCreateForm">
            <div style="font-size: 12px; color: orange; margin-bottom: 8px">
              ⚠ Keine Session für diesen Zeitraum gefunden.
            </div>

            <div v-if="!SR.sessionCreated" class="form-grid" style="padding: 0">
              <div class="form-group">
                <label>Startdatum Session</label>
                <input v-model="SR.newSession.startDate" type="date" />
                <label>Enddatum Session</label>
                <input v-model="SR.newSession.endDate" type="date" />
                <label>Anmeldefrist</label>
                <input
                  v-model="SR.newSession.registrationDeadline"
                  type="date"
                />
              </div>
              <div class="form-group">
                <label>Unterrichtsstart</label>
                <input v-model="SR.newSession.teachingStartTime" type="time" />
                <label>Unterrichtsende</label>
                <input v-model="SR.newSession.teachingEndTime" type="time" />
              </div>
              <div class="form-group">
                <label>Raum</label>
                <select v-model="SR.newSession.roomId">
                  <option disabled value="">Bitte wählen</option>
                  <option v-for="R in Rooms" :key="R.RoomId" :value="R.RoomId">
                    {{ R.Description }}
                  </option>
                </select>
                <label>Kosten</label>
                <input
                  v-model="SR.newSession.cost"
                  type="number"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div v-if="!SR.sessionCreated" style="padding: 8px 0">
              <button
                class="btn-submit"
                @click="createSessionForModule(SR)"
                style="width: auto; padding: 8px 20px"
              >
                Session erstellen
              </button>
            </div>
            <div v-else style="font-size: 12px; color: #2ecc71">
              ✔ Session erstellt
            </div>
          </template>
        </div>
      </div>

      <div class="form-actions">
        <button
          class="btn-submit"
          @click="Submit"
          :disabled="!AllSessionsResolved"
        >
          Buchung speichern
        </button>
        <button class="btn-cancel" @click="Step = 'form'">← Zurück</button>
      </div>
    </template>
  </div>
</template>
