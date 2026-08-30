export const staffOverview = [
  { value: 142, label: 'Active Volunteers' },
  { value: 1240, label: 'Total Children' },
  { value: 12, label: 'Ongoing Programs' },
  { value: 4, label: 'Upcoming Events' },
  { value: 9, label: 'Pending Applications' },
];

export const assignmentQueue = [
  { id: 'app-1024', name: 'Ananya Rao', match: '96%', skills: 'Teaching, Math', availability: 'Weekdays' },
  { id: 'app-1082', name: 'Karan Mehta', match: '91%', skills: 'Teaching', availability: 'Weekdays' },
  { id: 'app-1091', name: 'Sara Iyer', match: '87%', skills: 'Tutoring', availability: 'Weekends' },
];

// name is pre-masked here too, matching the real API's query-level masking
// (see Server/src/services/beneficiaries.service.js maskName).
export const orphanRecords = [
  { id: 'CHD-1042', name: 'ArXXXXX', ageGroup: '13–15', program: 'Education', attendance: '92%', progress: 'On Track' },
  { id: 'CHD-1078', name: 'RiXXXXX', ageGroup: '9–12', program: 'Healthcare', attendance: '85%', progress: 'On Track' },
  { id: 'CHD-1103', name: 'SaXXXXX', ageGroup: '13–15', program: 'Education', attendance: '70%', progress: 'Needs Support' },
];

// Staff-facing volunteer view — no email, matching the real API's
// query-level masking (see Server/src/services/volunteers.service.js).
export const staffVolunteers = [
  { id: 'vol-1', name: 'Ananya Rao', skills: 'Teaching, Math', availability: 'Weekdays', location: 'Pune Center' },
  { id: 'vol-2', name: 'Karan Mehta', skills: 'Teaching', availability: 'Weekdays', location: 'Nashik Center' },
];

export const staffPrograms = [
  { id: 'prog-1', name: 'Education Support', category: 'Education', status: 'Active' },
  { id: 'prog-2', name: 'Healthcare Program', category: 'Healthcare', status: 'Active' },
  { id: 'prog-3', name: 'Digital Literacy', category: 'Education', status: 'Active' },
];

export const staffEvents = [
  { id: 'ev-1', title: 'Education Support Program', program: 'Education Support', status: 'Ongoing', date: 'August 2026', location: 'Pune Center', volunteersNeeded: 6 },
  { id: 'ev-2', title: 'Health Camp for Children', program: 'Healthcare Program', status: 'Upcoming', date: 'September 2026', location: 'Mumbai Center', volunteersNeeded: 8 },
];

export const allAssignments = [
  { id: 'app-1024', event: 'Education Support Program', name: 'Ananya Rao', match: '96%', skills: 'Teaching, Math', availability: 'Weekdays', date: 'Aug 10, 2026' },
  { id: 'app-1082', event: 'Health Camp for Children', name: 'Karan Mehta', match: '91%', skills: 'Teaching', availability: 'Weekdays', date: 'Aug 15, 2026' },
];

export const eventDetail = {
  id: 'ev-1', title: 'Education Support Program', program: 'Education Support',
  status: 'Ongoing', statusRaw: 'ongoing', eventDate: 'August 2026', location: 'Pune Center',
  budgetAmount: 50000, budgetAmountDisplay: '₹50,000',
  fundsRaised: 32000, fundsRaisedDisplay: '₹32,000',
  fundsUsed: 18000, fundsUsedDisplay: '₹18,000',
  progressPct: 60,
  checklist: [
    { key: 'venue_confirmed', label: 'Venue confirmed', isDone: true, auto: false },
    { key: 'budget_approved', label: 'Budget approved', isDone: true, auto: false },
    { key: 'materials_arranged', label: 'Materials / supplies arranged', isDone: false, auto: false },
    { key: 'invitations_sent', label: 'Invitations / announcements sent', isDone: false, auto: false },
    { key: 'volunteers_assigned', label: 'Volunteers assigned', isDone: true, auto: true, approvedCount: 6, neededCount: 6 },
  ],
  approvedVolunteers: [
    { id: 'vol-1', name: 'Ananya Rao', skills: 'Teaching, Math', availability: 'Weekdays' },
    { id: 'vol-2', name: 'Karan Mehta', skills: 'Teaching', availability: 'Weekdays' },
  ],
};

export const orphanVisits = [
  { id: 'visit-1', visitorName: 'Sunita Sharma', relation: 'Aunt', visitDate: '2026-08-10', notes: 'Brought clothes and books.' },
];

export const attendanceQueue = {
  pending: [
    { applicationId: 'app-2001', volunteerId: 'vol-1', eventId: 'ev-1', volunteer: 'Ananya Rao', event: 'Education Support Program', date: 'August 2026', checkedInAt: null },
    { applicationId: 'app-2002', volunteerId: 'vol-2', eventId: 'ev-2', volunteer: 'Karan Mehta', event: 'Health Camp for Children', date: 'September 2026', checkedInAt: new Date().toISOString() },
  ],
  recorded: [
    { id: 'att-1', volunteerId: 'vol-2', eventId: 'ev-3', volunteer: 'Karan Mehta', event: 'Digital Literacy Drive', hours: 4, minHoursRequired: 3, eligible: true, certificateIssued: false, date: 'July 2026' },
  ],
};
