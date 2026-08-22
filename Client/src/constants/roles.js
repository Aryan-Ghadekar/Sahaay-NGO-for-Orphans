// Single source of truth for role identifiers, their user-facing labels, and
// where a logged-in user of that role lands. Referenced by Login (role
// picker), Header (role badge), AppRoutes (ProtectedRoute allowedRole), and
// anywhere a role needs to be shown to a person rather than compared in code.
export const ROLES = [
  { value: 'donor', label: 'Donor', path: '/donor' },
  { value: 'volunteer', label: 'Volunteer', path: '/volunteer' },
  { value: 'staff', label: 'NGO', path: '/staff' },
  { value: 'admin', label: 'Administrator', path: '/admin' },
];

export const ROLE_LABELS = Object.fromEntries(ROLES.map((r) => [r.value, r.label]));
export const ROLE_PATHS = Object.fromEntries(ROLES.map((r) => [r.value, r.path]));
