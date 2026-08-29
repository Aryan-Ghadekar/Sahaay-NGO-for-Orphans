// Mirrors the server's calculateAge (Server/src/utils/format.js) so the
// "Add a Record" form can show the computed age live, before the record is
// ever saved.
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
