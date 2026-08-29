// Presentation formatting lives here, at the API boundary — controllers
// return display-ready strings so the frontend (which already expects
// pre-formatted values like "₹5,000" or "Under Review") needs no changes.

export function formatRupees(amount) {
  return `₹${Number(amount).toLocaleString('en-IN')}`;
}

// Indian lakh/crore shorthand for large aggregate totals, e.g. 940000 -> "₹9.4L".
export function formatRupeesShort(amount) {
  const n = Number(amount) || 0;
  if (n >= 1_00_00_000) return `₹${(n / 1_00_00_000).toFixed(1).replace(/\.0$/, '')}Cr`;
  if (n >= 1_00_000) return `₹${(n / 1_00_000).toFixed(1).replace(/\.0$/, '')}L`;
  return formatRupees(n);
}

export function formatMonthYear(isoDate) {
  if (!isoDate) return '';
  return new Date(isoDate).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
}

export function formatDayMonthYear(isoDate) {
  if (!isoDate) return '';
  return new Date(isoDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' });
}

const DONATION_STATUS_LABELS = { allocated: 'Allocated', used: 'Used' };
export function formatDonationStatus(status) {
  return DONATION_STATUS_LABELS[status] || status;
}

const APPLICATION_STATUS_LABELS = {
  under_review: 'Under Review',
  approved: 'Approved',
  rejected: 'Rejected',
  completed: 'Completed',
};
export function formatApplicationStatus(status) {
  return APPLICATION_STATUS_LABELS[status] || status;
}

const PROGRESS_LABELS = { on_track: 'On Track', needs_support: 'Needs Support' };
export function formatProgress(progress) {
  return PROGRESS_LABELS[progress] || progress;
}

const EVENT_STATUS_LABELS = { ongoing: 'Ongoing', upcoming: 'Upcoming', completed: 'Completed' };
export function formatEventStatus(status) {
  return EVENT_STATUS_LABELS[status] || status;
}

// Derives a display age from date_of_birth so it's always current — never
// stored, since a stored value would silently go stale as the child ages.
export function calculateAge(dateOfBirth) {
  if (!dateOfBirth) return null;
  const dob = new Date(dateOfBirth);
  if (Number.isNaN(dob.getTime())) return null;
  const today = new Date();
  let years = today.getFullYear() - dob.getFullYear();
  let months = today.getMonth() - dob.getMonth();
  if (today.getDate() < dob.getDate()) months -= 1;
  if (months < 0) {
    years -= 1;
    months += 12;
  }
  if (years < 1) return `${months} month${months === 1 ? '' : 's'}`;
  return `${years} yr${years === 1 ? '' : 's'}`;
}
