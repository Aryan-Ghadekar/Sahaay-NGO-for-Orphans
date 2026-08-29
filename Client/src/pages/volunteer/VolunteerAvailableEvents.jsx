import { useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Loader } from '../../components/common/AsyncState';
import { useFetch } from '../../hooks/useFetch';
import { getAvailableEvents, applyToEvent } from '../../api/endpoints/volunteer';
import { VOLUNTEER_NAV } from '../../constants/nav';

export default function VolunteerAvailableEvents() {
  const { data, loading, refetch } = useFetch(getAvailableEvents, []);
  const [applyingId, setApplyingId] = useState(null);

  const handleApply = async (eventId) => {
    setApplyingId(eventId);
    try {
      await applyToEvent(eventId);
      refetch();
    } finally {
      setApplyingId(null);
    }
  };

  return (
    <DashboardLayout items={VOLUNTEER_NAV}>
      <h2 className="dashboard-title">Available Events</h2>
      <p className="dashboard-subtitle" style={{ marginBottom: 28 }}>
        Every upcoming opportunity, ranked by how well it matches your skills.
      </p>

      {loading ? <Loader /> : !data.length ? (
        <p className="dashboard-note">No upcoming events right now — check back soon.</p>
      ) : (
        <table className="table">
          <thead><tr><th>Event</th><th>Program</th><th>Location</th><th>Date</th><th>Match</th><th></th></tr></thead>
          <tbody>
            {data.map((e) => (
              <tr key={e.id}>
                <td>{e.title}</td>
                <td>{e.program}</td>
                <td>{e.location}</td>
                <td>{e.date}</td>
                <td>{e.match}</td>
                <td>
                  <button
                    className="btn btn-primary btn-sm"
                    disabled={e.applied || applyingId === e.id}
                    onClick={() => handleApply(e.id)}
                  >
                    {e.applied ? 'Applied' : applyingId === e.id ? 'Applying…' : 'Apply'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </DashboardLayout>
  );
}
