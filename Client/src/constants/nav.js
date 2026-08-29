// Sidebar nav for the Admin and NGO (staff) dashboards — one source of
// truth shared by the dashboard page and every sub-page under it, so a
// link and the route it points to can't drift apart.
export const ADMIN_NAV = [
  { to: '/admin', label: 'Dashboard', end: true },
  { to: '/admin/website', label: 'Public Website' },
  { to: '/admin/programs', label: 'NGOs / Programs' },
  { to: '/admin/events', label: 'Events' },
  { to: '/admin/donors', label: 'Donors' },
  { to: '/admin/volunteers', label: 'Volunteers' },
  { to: '/admin/orphans', label: 'Orphans' },
  { to: '/admin/donations', label: 'Donations' },
  { to: '/admin/impact', label: 'Impact' },
  { to: '/admin/content', label: 'Content' },
  { to: '/admin/settings', label: 'Settings' },
];

export const VOLUNTEER_NAV = [
  { to: '/volunteer', label: 'Dashboard', end: true },
  { to: '/volunteer/profile', label: 'Profile' },
  { to: '/volunteer/events', label: 'Available Events' },
  { to: '/volunteer/applications', label: 'Applications' },
  { to: '/volunteer/attendance', label: 'Attendance' },
  { to: '/volunteer/history', label: 'History' },
];

export const STAFF_NAV = [
  { to: '/staff', label: 'Dashboard', end: true },
  { to: '/staff/volunteers', label: 'Volunteers' },
  { to: '/staff/orphans', label: 'Orphans' },
  { to: '/staff/events', label: 'Events' },
  { to: '/staff/programs', label: 'Programs' },
  { to: '/staff/assignments', label: 'Assignments' },
  { to: '/staff/attendance', label: 'Attendance' },
  { to: '/staff/statistics', label: 'Statistics' },
];
