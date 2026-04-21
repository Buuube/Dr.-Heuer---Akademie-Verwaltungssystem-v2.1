export const validateParticipant = (f) => {
  const errors = {};
  let valid = true;

  const setError = (key, msg) => {
    errors[key] = msg;
    valid = false;
  };

  if (!f.AgencyCustomerNumber) {
    setError('AgencyCustomerNumber', 'Kundennummer erforderlich');
  } else if (!/^\d{3}[A-Za-z]\d{6}$/.test(f.AgencyCustomerNumber)) {
    setError('AgencyCustomerNumber', 'Kundennummer Beispiel: 123A456789');
  }

  if (f.ContactSource && f.ContactSource.length > 200) {
    setError('ContactSource', 'Maximal 200 Zeichen erlaubt');
  }

  if (!f.LastName) setError('LastName', 'Nachname ist erforderlich');

  const dob = new Date(f.DateOfBirth);
  const minDate = new Date('1900-01-01');
  if (!f.DateOfBirth) {
    setError('DateOfBirth', 'Geburtsdatum ist erforderlich');
  } else if (dob < minDate || dob > new Date()) {
    setError('DateOfBirth', 'Geburtsdatum muss zwischen 1900 und heute liegen');
  }

  if (f.PlaceOfBirth && f.PlaceOfBirth.length > 100) {
    setError('PlaceOfBirth', 'Maximal 100 Zeichen erlaubt');
  }

  if (!f.Email) {
    setError('Email', 'E-Mail ist erforderlich');
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.Email)) {
    setError('Email', 'Ungültige E-Mail-Adresse');
  }

  if (!f.Street) {
    setError('Street', 'Straße ist erforderlich');
  } else if (f.Street && f.Street.length > 80) {
    setError('Street', 'Maximal 80 Zeichen erlaubt');
  }

  if (!f.HouseNumber) {
    setError('HouseNumber', 'Hausnummer ist erforderlich');
  } else if (f.HouseNumber && f.HouseNumber.length > 20) {
    setError('HouseNumber', 'Maximal 20 Zeichen erlaubt');
  }

  if (!f.PostalCode) {
    setError('PostalCode', 'PLZ ist erforderlich');
  } else if (!/^\d{5}$/.test(f.PostalCode)) {
    setError('PostalCode', 'PLZ muss 5 Ziffern haben');
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

  if (f.Employer && f.Employer.length > 255) {
    setError('Employer', 'Maximal 255 Zeichen erlaubt');
  }

  if (f.Fax && !/^[0-9+\-\/\s]{3,20}$/.test(f.Fax)) {
    setError('Fax', 'Ungültiges Fax-Format');
  }

  if (f.IsEmployed) {
    if (!f.EmploymentStartDate) {
      setError('EmploymentStartDate', 'Startdatum ist erforderlich');
    } else {
      const start = new Date(f.EmploymentStartDate);
      if (start > new Date()) {
        setError(
          'EmploymentStartDate',
          'Startdatum darf nicht in der Zukunft liegen'
        );
      }
    }
  }

  return { valid, errors };
};
