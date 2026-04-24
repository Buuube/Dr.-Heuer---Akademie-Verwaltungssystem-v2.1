const API = 'http://localhost:3000/api/bookings';

export async function getBookings() {
  const res = await fetch(API);
  return res.json();
}

export async function createBooking(booking) {
  const res = await fetch(API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      participantId: booking.ParticipantId,
      isSigned: booking.IsSigned ?? false,
      plannedStartDate: booking.PlannedStartDate,
      plannedEndDate: booking.PlannedEndDate,
      bookingType: booking.BookingType,
      endReason: booking.EndReason ?? '',
      monthlyRate: booking.MonthlyRate ?? null,
      remarks: booking.Remarks ?? null,
      educationalGoal: booking.EducationalGoal ?? null,
      duration: booking.Duration ?? null,
      startTerm: booking.StartTerm ?? null,
      locationId: booking.LocationId ?? null,
    }),
  });

  if (!res.ok) throw new Error('Fehler beim Anlegen der Buchung');
  return res.json();
}

export async function updateBooking(booking) {
  const res = await fetch(`${API}/${booking.BookingId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      plannedStartDate: booking.PlannedStartDate,
      actualStartDate: booking.ActualStartDate,
      plannedEndDate: booking.PlannedEndDate,
      actualEndDate: booking.ActualEndDate,
      remarks: booking.Remarks,
      monthlyRate: booking.MonthlyRate,
      locationId: booking.LocationId,
      educationalGoal: booking.EducationalGoal,
      duration: booking.Duration,
      startTerm: booking.StartTerm,
    }),
  });

  if (!res.ok) throw new Error('Fehler beim Aktualisieren der Buchung');
  return res.json();
}

export async function addBookingItems(bookingId, items) {
  const res = await fetch(`${API}/${bookingId}/items`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items }),
  });
  if (!res.ok) throw new Error('Fehler beim Zuordnen der Module');
  return res.json();
}

export async function getBookingById(id) {
  const res = await fetch(`${API}/${id}`);
  return res.json();
}

export async function getBookingsByModule(moduleCodeId) {
  const res = await fetch(`${API}/by-module/${moduleCodeId}`);
  return res.json();
}

export async function deleteBooking(id, cancellationReasonId = null) {
  await fetch(`${API}/${id}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cancellationReasonId }),
  });
}
