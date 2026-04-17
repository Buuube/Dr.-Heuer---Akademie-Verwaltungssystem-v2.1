export const validateParticipant = (f) => {
  const errors = {};
  let valid = true;

  const setError = (key, msg) => {
    errors[key] = msg;
    valid = false;
  };

  if (!f.FirstName) setError('FirstName', 'Vorname ist erforderlich');
  if (!f.LastName) setError('LastName', 'Nachname ist erforderlich');

  if (!f.Email) {
    setError('Email', 'E-Mail ist erforderlich');
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.Email)) {
    setError('Email', 'Ungültige E-Mail-Adresse');
  }

  if (!f.Street) setError('Street', 'Straße ist erforderlich');
  if (!f.HouseNumber) setError('HouseNumber', 'Hausnummer ist erforderlich');

  if (!f.PostalCode) {
    setError('PostalCode', 'PLZ ist erforderlich');
  } else if (!/^\d{5}$/.test(f.PostalCode)) {
    setError('PostalCode', 'PLZ muss 5 Ziffern haben');
  }

  if (!f.DateOfBirth) {
    setError('DateOfBirth', 'Geburtsdatum ist erforderlich');
  } else if (new Date(f.DateOfBirth) > new Date()) {
    setError('DateOfBirth', 'Geburtsdatum ungültig');
  }

  if (!f.PlaceOfBirth) {
    setError('PlaceOfBirth', 'Geburtsort ist erforderlich');
  }

  if (!f.Phone && !f.Mobile) {
    setError('PhoneMobile', 'Telefon oder Mobil erforderlich');
  }

  if (f.IsEmployed && !f.Employer) {
    setError('Employer', 'Arbeitgeber ist erforderlich');
  }

  if (f.Fax && !/^[0-9+\-\/\s]{3,20}$/.test(f.Fax)) {
    setError('Fax', 'Ungültiges Fax-Format');
  }

  return { valid, errors };
};
