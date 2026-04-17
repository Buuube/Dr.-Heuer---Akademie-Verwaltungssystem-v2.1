const API = 'http://localhost:3000/api/bookings';

export async function getBookings() {
  const res = await fetch(API);
  return res.json();
}

// Schritt 1: Buchung anlegen, Schritt 2: Module zuordnen
export async function createBooking(booking) {
  // Schritt 1 — Booking-Instanz erstellen
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
    }),
  });

  if (!res.ok) throw new Error('Fehler beim Anlegen der Buchung');
  const newBooking = await res.json();

  // Schritt 2 — Module zuordnen (falls welche ausgewählt wurden)
  if (booking.SelectedModuleIds?.length > 0) {
    await addBookingItems(newBooking.BookingId, booking.SelectedModuleIds);
  }

  return newBooking;
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
    }),
  });

  if (!res.ok) throw new Error('Fehler beim Aktualisieren der Buchung');

  // Module neu zuordnen falls geändert
  if (booking.SelectedModuleIds?.length > 0) {
    await addBookingItems(booking.BookingId, booking.SelectedModuleIds);
  }

  return res.json();
}

export async function addBookingItems(bookingId, moduleIds) {
  const res = await fetch(`${API}/${bookingId}/items`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ moduleIds }),
  });
  if (!res.ok) throw new Error('Fehler beim Zuordnen der Module');
  return res.json();
}

export async function deleteBooking(id, cancellationReasonId = null) {
  await fetch(`${API}/${id}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cancellationReasonId }),
  });
}
