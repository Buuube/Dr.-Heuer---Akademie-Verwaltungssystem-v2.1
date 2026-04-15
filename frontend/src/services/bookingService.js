const API = 'http://localhost:3000/api/bookings';

export async function getBookings() {
  return [
    {
      Id: 1,
      ParticipantName: 'Anna Schmidt',
      StartDate: '2026-05-01',
      EndDate: '2026-10-31',
      IsCancelled: false,
      CancellationReasonId: null,
    },
    {
      Id: 2,
      ParticipantName: 'Max Müller',
      StartDate: '2026-06-01',
      EndDate: '2026-11-30',
      IsCancelled: true,
      CancellationReasonId: 3,
    },
  ];
}

export async function saveBooking(booking) {
  const isUpdate = !!booking.Id;

  const url = isUpdate ? `${API}/${booking.Id}` : API;
  const method = isUpdate ? 'PUT' : 'POST';

  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(booking),
  });

  if (!res.ok) throw new Error('Fehler beim Speichern der Buchung');
  return res.json();
}

export async function deleteBooking(id) {
  await fetch(`${API}/${id}`, { method: 'DELETE' });
}
