// Validation for the orphan visitor log form — a distinct subject from the
// beneficiary intake form (orphanValidation.js), even though it renders
// inside the same page/panel on both the staff and admin sides.
const NAME_RE = /^[A-Za-z][A-Za-z ]*$/;

export function validateVisitForm(form) {
  const errors = {};

  const name = (form.visitorName || '').trim();
  if (!name) errors.visitorName = 'Visitor name is required.';
  else if (!NAME_RE.test(name)) errors.visitorName = 'Only letters and spaces are allowed, no numbers or special characters.';

  if (!(form.relation || '').trim()) errors.relation = 'Relation to the child is required.';

  if (!form.visitDate) {
    errors.visitDate = 'Visit date is required.';
  } else {
    const date = new Date(form.visitDate);
    if (Number.isNaN(date.getTime())) errors.visitDate = 'Enter a valid date.';
    else if (date > new Date()) errors.visitDate = 'Visit date cannot be in the future.';
  }

  return errors;
}
