// Validation for the beneficiary intake form — shared by the "Add a Record"
// card and each row's "Full Details" edit panel so the two can't drift.
const NAME_RE = /^[A-Za-z][A-Za-z ]*$/;
const PHONE_RE = /^[0-9]{10}$/;

const NAME_ERROR = 'Only letters and spaces are allowed, no numbers or special characters.';
const PHONE_ERROR = 'Enter a valid 10-digit phone number (digits only).';

function requiredName(value, label) {
  const v = (value || '').trim();
  if (!v) return `${label} is required.`;
  if (!NAME_RE.test(v)) return NAME_ERROR;
  return null;
}

function requiredPhone(value, label) {
  const v = (value || '').trim();
  if (!v) return `${label} is required.`;
  if (!PHONE_RE.test(v)) return PHONE_ERROR;
  return null;
}

function requiredText(value, label) {
  return (value || '').trim() ? null : `${label} is required.`;
}

export function validateOrphanForm(form) {
  const errors = {};

  const firstNameError = requiredName(form.firstName, 'First name');
  if (firstNameError) errors.firstName = firstNameError;

  const lastNameError = requiredName(form.lastName, 'Last name');
  if (lastNameError) errors.lastName = lastNameError;

  if (!form.dateOfBirth) {
    errors.dateOfBirth = 'Date of birth is required.';
  } else {
    const dob = new Date(form.dateOfBirth);
    if (Number.isNaN(dob.getTime())) errors.dateOfBirth = 'Enter a valid date.';
    else if (dob > new Date()) errors.dateOfBirth = 'Date of birth cannot be in the future.';
  }

  const contactError = requiredPhone(form.contactNumber, 'Contact number');
  if (contactError) errors.contactNumber = contactError;

  const guardianError = requiredName(form.guardianName, 'Guardian / caretaker name');
  if (guardianError) errors.guardianName = guardianError;

  const addressError = requiredText(form.address, 'Address / location');
  if (addressError) errors.address = addressError;

  const historyError = requiredText(form.backgroundNotes, 'History');
  if (historyError) errors.backgroundNotes = historyError;

  const broughtByNameError = requiredName(form.broughtByName, "Brought-by person's name");
  if (broughtByNameError) errors.broughtByName = broughtByNameError;

  const broughtByRelationError = requiredText(form.broughtByRelation, 'Relation to the child');
  if (broughtByRelationError) errors.broughtByRelation = broughtByRelationError;

  const broughtByContactError = requiredPhone(form.broughtByContact, 'Contact number');
  if (broughtByContactError) errors.broughtByContact = broughtByContactError;

  if (!form.photoDataUrl) errors.photoDataUrl = "The orphan's photo is required.";
  if (!form.broughtByPhotoDataUrl) errors.broughtByPhotoDataUrl = "The brought-by person's photo is required.";

  return errors;
}

// Strips everything but digits and caps the length as the user types, so a
// phone field can never end up holding letters or more than 10 digits.
export function sanitizePhoneInput(value) {
  return (value || '').replace(/\D/g, '').slice(0, 10);
}
