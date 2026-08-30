export const volunteerProfile = {
  name: 'Volunteer',
  firstName: 'Demo',
  lastName: 'Volunteer',
  dateOfBirth: '1998-05-14',
  mobileNumber: '9876543210',
  address: '221 MG Road, Pune',
  photoDataUrl: '',
  skills: ['Teaching', 'First Aid'],
  availability: 'Weekends',
  qualification: "Bachelor's in Education · 3 yrs experience",
  location: 'Pune Center',
  stats: [
    { value: 18, label: 'Total Events' },
    { value: 96, label: 'Volunteer Hours' },
    { value: 5, label: 'Certificates Earned' },
  ],
};

export const recommendedEvent = {
  eventId: 'demo-event-1',
  title: 'Mathematics Support',
  match: '96% Match',
  meta: 'Weekday afternoons · Pune Center · 4 volunteers needed',
  skillsMatch: true,
  availabilityMatch: true,
  locationMatch: true,
};

export const applications = [
  { id: 1, event: 'Education Support', match: '96%', date: 'Aug 10, 2026', status: 'Approved' },
  { id: 2, event: 'Digital Literacy', match: '91%', date: 'Aug 15, 2026', status: 'Under Review' },
  { id: 3, event: 'Community Event', match: '87%', date: 'Aug 20, 2026', status: 'Completed' },
];

export const availableEvents = [
  { id: 'demo-event-1', title: 'Mathematics Support', program: 'Education Support', location: 'Pune Center', date: 'September 2026', volunteersNeeded: 4, match: '96%', applied: false },
  { id: 'demo-event-2', title: 'Health Camp for Children', program: 'Healthcare Program', location: 'Mumbai Center', date: 'September 2026', volunteersNeeded: 8, match: '78%', applied: false },
];

export const certificates = [
  { id: 'att-1', event: 'Digital Literacy Drive', date: 'July 2026', hours: 4, minHoursRequired: 3, eligible: true, certificateIssued: true, issuedAt: 'Jul 28, 2026', volunteerName: 'Demo Volunteer' },
  { id: 'att-2', event: 'Community Volunteer Day', date: 'June 2026', hours: 3, minHoursRequired: 4, eligible: false, certificateIssued: false, issuedAt: null, volunteerName: 'Demo Volunteer' },
];
