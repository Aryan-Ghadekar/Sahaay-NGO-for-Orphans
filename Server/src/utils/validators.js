// Boundary-level checks mirroring the client-side validation on the
// beneficiary intake form — the browser already blocks bad input, this is
// just the backend not trusting it.
const NAME_RE = /^[A-Za-z][A-Za-z ]*$/;
const PHONE_RE = /^[0-9]{10}$/;

export function isValidName(value) {
  return typeof value === 'string' && NAME_RE.test(value.trim());
}

export function isValidPhone(value) {
  return typeof value === 'string' && PHONE_RE.test(value.trim());
}
