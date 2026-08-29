import { Routes, Route } from 'react-router-dom';
import Home from '../pages/public/Home';
import Login from '../pages/public/Login';
import Signup from '../pages/public/Signup';
import NotFound from '../pages/public/NotFound';
import DonorDashboard from '../pages/donor/DonorDashboard';
import VolunteerDashboard from '../pages/volunteer/VolunteerDashboard';
import VolunteerProfile from '../pages/volunteer/VolunteerProfile';
import VolunteerAvailableEvents from '../pages/volunteer/VolunteerAvailableEvents';
import VolunteerApplications from '../pages/volunteer/VolunteerApplications';
import VolunteerCertificates from '../pages/volunteer/VolunteerCertificates';
import VolunteerHistory from '../pages/volunteer/VolunteerHistory';
import StaffDashboard from '../pages/staff/StaffDashboard';
import StaffVolunteers from '../pages/staff/StaffVolunteers';
import StaffOrphans from '../pages/staff/StaffOrphans';
import StaffEvents from '../pages/staff/StaffEvents';
import StaffPrograms from '../pages/staff/StaffPrograms';
import StaffAssignments from '../pages/staff/StaffAssignments';
import StaffAttendance from '../pages/staff/StaffAttendance';
import StaffStatistics from '../pages/staff/StaffStatistics';
import AdminDashboard from '../pages/admin/AdminDashboard';
import AdminPrograms from '../pages/admin/AdminPrograms';
import AdminEvents from '../pages/admin/AdminEvents';
import AdminVolunteers from '../pages/admin/AdminVolunteers';
import AdminOrphans from '../pages/admin/AdminOrphans';
import AdminDonors from '../pages/admin/AdminDonors';
import AdminDonations from '../pages/admin/AdminDonations';
import AdminImpact from '../pages/admin/AdminImpact';
import AdminContent from '../pages/admin/AdminContent';
import AdminSettings from '../pages/admin/AdminSettings';
import ProtectedRoute from './ProtectedRoute';

const Staff = (el) => <ProtectedRoute allowedRole="staff">{el}</ProtectedRoute>;
const Admin = (el) => <ProtectedRoute allowedRole="admin">{el}</ProtectedRoute>;
const Volunteer = (el) => <ProtectedRoute allowedRole="volunteer">{el}</ProtectedRoute>;

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      <Route path="/donor" element={<ProtectedRoute allowedRole="donor"><DonorDashboard /></ProtectedRoute>} />
      <Route path="/volunteer" element={Volunteer(<VolunteerDashboard />)} />
      <Route path="/volunteer/profile" element={Volunteer(<VolunteerProfile />)} />
      <Route path="/volunteer/events" element={Volunteer(<VolunteerAvailableEvents />)} />
      <Route path="/volunteer/applications" element={Volunteer(<VolunteerApplications />)} />
      <Route path="/volunteer/certificates" element={Volunteer(<VolunteerCertificates />)} />
      <Route path="/volunteer/history" element={Volunteer(<VolunteerHistory />)} />

      <Route path="/staff" element={Staff(<StaffDashboard />)} />
      <Route path="/staff/volunteers" element={Staff(<StaffVolunteers />)} />
      <Route path="/staff/orphans" element={Staff(<StaffOrphans />)} />
      <Route path="/staff/events" element={Staff(<StaffEvents />)} />
      <Route path="/staff/programs" element={Staff(<StaffPrograms />)} />
      <Route path="/staff/assignments" element={Staff(<StaffAssignments />)} />
      <Route path="/staff/attendance" element={Staff(<StaffAttendance />)} />
      <Route path="/staff/statistics" element={Staff(<StaffStatistics />)} />

      <Route path="/admin" element={Admin(<AdminDashboard />)} />
      <Route path="/admin/website" element={Admin(<AdminContent />)} />
      <Route path="/admin/programs" element={Admin(<AdminPrograms />)} />
      <Route path="/admin/events" element={Admin(<AdminEvents />)} />
      <Route path="/admin/donors" element={Admin(<AdminDonors />)} />
      <Route path="/admin/volunteers" element={Admin(<AdminVolunteers />)} />
      <Route path="/admin/orphans" element={Admin(<AdminOrphans />)} />
      <Route path="/admin/donations" element={Admin(<AdminDonations />)} />
      <Route path="/admin/impact" element={Admin(<AdminImpact />)} />
      <Route path="/admin/content" element={Admin(<AdminContent />)} />
      <Route path="/admin/settings" element={Admin(<AdminSettings />)} />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
