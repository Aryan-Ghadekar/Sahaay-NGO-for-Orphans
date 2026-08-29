// Validation for the volunteer profile form — same rules as the orphan
// intake form (see orphanValidation.js): letters-only names, 10-digit
// phone numbers, non-future birth date, everything required.
const NAME_RE = /^[A-Za-z][A-Za-z ]*$/;
const PHONE_RE = /^[0-9]{10}$/;

const NAME_ERROR = 'Only letters and spaces are allowed, no numbers or special characters.';
const PHONE_ERROR = 'Enter a valid 10-digit phone number (digits only).';

export function validateVolunteerForm(form) {
  const errors = {};

  const firstName = (form.firstName || '').trim();
  if (!firstName) errors.firstName = 'First name is required.';
  else if (!NAME_RE.test(firstName)) errors.firstName = NAME_ERROR;

  const lastName = (form.lastName || '').trim();
  if (!lastName) errors.lastName = 'Last name is required.';
  else if (!NAME_RE.test(lastName)) errors.lastName = NAME_ERROR;

  if (!form.dateOfBirth) {
    errors.dateOfBirth = 'Date of birth is required.';
  } else {
    const dob = new Date(form.dateOfBirth);
    if (Number.isNaN(dob.getTime())) errors.dateOfBirth = 'Enter a valid date.';
    else if (dob > new Date()) errors.dateOfBirth = 'Date of birth cannot be in the future.';
  }

  const mobileNumber = (form.mobileNumber || '').trim();
  if (!mobileNumber) errors.mobileNumber = 'Mobile number is required.';
  else if (!PHONE_RE.test(mobileNumber)) errors.mobileNumber = PHONE_ERROR;

  if (!(form.location || '').trim()) errors.location = 'Location is required.';
  if (!(form.address || '').trim()) errors.address = 'Address is required.';
  if (!(form.qualification || '').trim()) errors.qualification = 'Qualification is required.';
  if (!(form.skills || '').trim()) errors.skills = 'At least one skill is required.';

  return errors;
}

export function sanitizePhoneInput(value) {
  return (value || '').replace(/\D/g, '').slice(0, 10);
}
