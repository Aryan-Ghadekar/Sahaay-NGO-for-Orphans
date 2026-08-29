import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import StatCard from '../../components/common/StatCard';
import ImagePlaceholder from '../../components/common/ImagePlaceholder';
import Reveal from '../../components/common/Reveal';
import { Loader } from '../../components/common/AsyncState';
import { useFetch } from '../../hooks/useFetch';
import { getVolunteerProfile, getRecommendedEvent, getApplications, applyToEvent } from '../../api/endpoints/volunteer';
import { VOLUNTEER_NAV } from '../../constants/nav';
import './VolunteerDashboard.css';

export default function VolunteerDashboard() {
  const navigate = useNavigate();
  const { data: profile, loading: profileLoading } = useFetch(getVolunteerProfile, []);
  const { data: recommended, loading: recommendedLoading } = useFetch(getRecommendedEvent, []);
  const { data: applications, loading: applicationsLoading } = useFetch(getApplications, []);
  const [applyState, setApplyState] = useState('idle'); // idle | applying | applied | error

  const handleApply = async () => {
    if (!recommended?.eventId) return;
    setApplyState('applying');
    try {
      await applyToEvent(recommended.eventId);
      setApplyState('applied');
    } catch {
      setApplyState('error');
    }
  };

  return (
    <DashboardLayout items={VOLUNTEER_NAV}>
      <h2 className="dashboard-title">Welcome back, Volunteer</h2>

      <div className="volunteer-top">
        {profileLoading ? <Loader /> : (
          <Reveal className="card volunteer-profile-card">
            <ImagePlaceholder label="Photo" shape="circle" style={{ width: 88, height: 88, margin: '0 auto' }} />
            <p className="card-title">Volunteer Profile</p>
            <div className="volunteer-profile-card__tags">
              {profile.skills.map((s) => <span className="tag tag-sage" key={s}>{s}</span>)}
              <span className="tag tag-outline">{profile.availability}</span>
            </div>
            <p className="volunteer-profile-card__meta">{profile.qualification}</p>
            <button className="btn btn-secondary btn-block" onClick={() => navigate('/volunteer/profile')}>Edit Profile</button>
          </Reveal>
        )}
        {!profileLoading && (
          <Reveal delay={80} className="volunteer-stats">
            {profile.stats.map((s) => <StatCard key={s.label} value={s.value} label={s.label} />)}
          </Reveal>
        )}
      </div>

      <h3 className="dashboard-subheading">Recommended for You</h3>
      {recommendedLoading ? <Loader /> : !recommended ? (
        <p className="dashboard-note">No new recommendations right now — check back soon.</p>
      ) : (
        <Reveal className="card recommended-card">
          <div>
            <p className="card-title">{recommended.title} · {recommended.match}</p>
            <p className="recommended-card__meta">{recommended.meta}</p>
            <div className="recommended-card__facets">
              <span className="tag tag-outline">Skills ✓</span>
              <span className="tag tag-outline">Availability ✓</span>
              <span className="tag tag-outline">Location ✓</span>
            </div>
          </div>
          <button className="btn btn-primary" onClick={handleApply} disabled={applyState !== 'idle'}>
            {applyState === 'applying' ? 'Applying…' : applyState === 'applied' ? 'Applied' : 'Apply'}
          </button>
        </Reveal>
      )}

      <h3 className="dashboard-subheading">My Applications</h3>
      {applicationsLoading ? <Loader /> : (
        <table className="table">
          <thead><tr><th>Event</th><th>Match Score</th><th>Date</th><th>Status</th></tr></thead>
          <tbody>
            {applications.map((a) => (
              <tr key={a.id}>
                <td>{a.event}</td>
                <td>{a.match}</td>
                <td>{a.date}</td>
                <td><span className={`tag ${a.status === 'Approved' ? 'tag-sage' : a.status === 'Completed' ? 'tag-neutral' : 'tag-outline'}`}>{a.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </DashboardLayout>
  );
}
