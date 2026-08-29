export const adminOverview = [
  { value: '₹9.4L', label: 'Total Donations' },
  { value: 560, label: 'Total Volunteers' },
  { value: 1240, label: 'Total Children' },
  { value: 12, label: 'Active Programs' },
  { value: 4, label: 'Ongoing Events' },
  { value: 3, label: 'Upcoming Events' },
  { value: 61, label: 'Completed Events' },
  { value: 95, label: 'Students Impacted' },
  { value: 9, label: 'Pending Applications' },
];

export const siteImages = {
  hero_image: null,
  volunteer_cta_image: null,
};

export const team = [
  { id: 'demo-staff-1', full_name: 'Meera Nair', email: 'meera@sahaay.org', role: 'staff', created_at: '2026-03-01' },
  { id: 'demo-admin-1', full_name: 'You', email: 'you@sahaay.org', role: 'admin', created_at: '2026-01-15' },
];

export const impactRecordForm = {
  donationId: 'demo-donation-1',
  donation: '₹5,000',
  program: 'Education Support',
  activity: 'School Kit Distribution',
  outcome: '',
  impact: '',
};

export const adminPrograms = [
  { id: 'prog-1', name: 'Education Support', category: 'Education', description: 'Learning resources for children.', isActive: true, status: 'Active' },
  { id: 'prog-2', name: 'Healthcare Program', category: 'Healthcare', description: 'Health check-ups and care.', isActive: true, status: 'Active' },
  { id: 'prog-3', name: 'Digital Literacy', category: 'Education', description: 'Computer skills for teenagers.', isActive: true, status: 'Active' },
  { id: 'prog-4', name: 'Community Outreach', category: 'Community', description: 'Mentoring and sports activities.', isActive: false, status: 'Completed' },
];

export const adminEvents = [
  { id: 'ev-1', title: 'Education Support Program', description: 'Weekly tutoring sessions.', programId: 'prog-1', program: 'Education Support', statusRaw: 'ongoing', status: 'Ongoing', eventDate: '2026-08-05', date: 'August 2026', location: 'Pune Center', volunteersNeeded: 6, expectedImpact: '40 students tutored', image: null },
  { id: 'ev-2', title: 'Digital Literacy Drive', description: 'Computer basics workshop.', programId: 'prog-3', program: 'Digital Literacy', statusRaw: 'ongoing', status: 'Ongoing', eventDate: '2026-08-12', date: 'August 2026', location: 'Nashik Center', volunteersNeeded: 4, expectedImpact: '25 teenagers trained', image: null },
  { id: 'ev-3', title: 'Health Camp for Children', description: 'Free pediatric check-ups.', programId: 'prog-2', program: 'Healthcare Program', statusRaw: 'upcoming', status: 'Upcoming', eventDate: '2026-09-10', date: 'September 2026', location: 'Mumbai Center', volunteersNeeded: 8, expectedImpact: '60 check-ups', image: null },
];

export const adminVolunteers = [
  { id: 'vol-1', name: 'Ananya Rao', email: 'ananya@example.com', skills: 'Teaching, Math', availability: 'Weekdays', location: 'Pune Center' },
  { id: 'vol-2', name: 'Karan Mehta', email: 'karan@example.com', skills: 'Teaching', availability: 'Weekdays', location: 'Nashik Center' },
];

export const adminOrphans = [
  { id: 'ben-1', childCode: 'CHD-1042', name: 'Arjun Sharma', ageGroup: '13–15', programId: 'prog-1', program: 'Education Support', attendancePct: 92, attendance: '92%', progress: 'on_track', progressLabel: 'On Track', contactNumber: '+91 98200 11122', guardianName: 'Sunita Sharma (Aunt)', address: 'Wadala, Mumbai', backgroundNotes: 'Lost both parents in 2022; lives with maternal aunt.' },
  { id: 'ben-2', childCode: 'CHD-1078', name: 'Riya Iyer', ageGroup: '9–12', programId: 'prog-2', program: 'Healthcare Program', attendancePct: 85, attendance: '85%', progress: 'on_track', progressLabel: 'On Track', contactNumber: '+91 98450 33344', guardianName: 'Care home warden', address: 'Sahaay Care Home, Pune', backgroundNotes: 'Under regular pediatric follow-up for asthma.' },
  { id: 'ben-3', childCode: 'CHD-1103', name: 'Saanvi Patil', ageGroup: '13–15', programId: 'prog-1', program: 'Education Support', attendancePct: 70, attendance: '70%', progress: 'needs_support', progressLabel: 'Needs Support', contactNumber: '', guardianName: 'Care home warden', address: 'Sahaay Care Home, Nashik', backgroundNotes: 'Attendance dropped after a family visit; flagged for counseling.' },
];

export const adminDonors = [
  { id: 'donor-1', name: 'Aryan Ghadekar', email: 'aryan@example.com', totalDonated: '₹18,500', donationCount: 6 },
];

export const adminDonations = [
  { id: 'don-1', donor: 'Aryan Ghadekar', program: 'Education Support', amount: '₹5,000', date: 'August 2026', status: 'Used', verified: true, proofUrl: null, note: '', outcome: '120 school kits distributed', impact: '95 students supported' },
  { id: 'don-2', donor: 'Aryan Ghadekar', program: 'Healthcare Program', amount: '₹3,000', date: 'June 2026', status: 'Allocated', verified: false, proofUrl: null, note: 'Paid via UPI', outcome: null, impact: null },
];

export const unallocatedFunds = [
  { id: 'don-3', donor: 'Aryan Ghadekar', amount: '₹2,000', date: 'July 2026' },
];

export const impactRecordDrafts = [
  { donationId: 'demo-donation-1', donor: 'Aryan Ghadekar', donation: '₹5,000', program: 'Education Support', activity: 'School Kit Distribution', outcome: '', impact: '' },
  { donationId: 'demo-donation-2', donor: 'Priya Sharma', donation: '₹50,000', program: 'Healthcare Program', activity: '', outcome: '', impact: '' },
];
