import { useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Loader } from '../../components/common/AsyncState';
import { useFetch } from '../../hooks/useFetch';
import { getAttendanceQueue, markAttendance } from '../../api/endpoints/staff';
import { STAFF_NAV } from '../../constants/nav';

function PendingRow({ row, onMarked }) {
  const [hours, setHours] = useState('');
  const [saving, setSaving] = useState(false);

  const mark = async (attended) => {
    setSaving(true);
    try {
      await markAttendance({
        applicationId: row.applicationId,
        volunteerId: row.volunteerId,
        eventId: row.eventId,
        attended,
        hours: attended ? Number(hours) || 0 : 0,
      });
      onMarked();
    } finally {
      setSaving(false);
    }
  };

  return (
    <tr>
      <td>{row.volunteer}</td>
      <td>{row.event}</td>
      <td>{row.date}</td>
      <td>
        <input
          className="input"
          type="number"
          min="0"
          step="0.5"
          placeholder="Hours"
          style={{ width: 90 }}
          value={hours}
          onChange={(e) => setHours(e.target.value)}
          disabled={saving}
        />
      </td>
      <td style={{ display: 'flex', gap: 8 }}>
        <button className="btn btn-primary btn-sm" onClick={() => mark(true)} disabled={saving}>Present</button>
        <button className="btn btn-secondary btn-sm" onClick={() => mark(false)} disabled={saving}>Absent</button>
      </td>
    </tr>
  );
}

export default function StaffAttendance() {
  const { data, loading, refetch } = useFetch(getAttendanceQueue, []);

  return (
    <DashboardLayout items={STAFF_NAV}>
      <h2 className="dashboard-title">Attendance</h2>
      <p className="dashboard-subtitle" style={{ marginBottom: 28 }}>
        Mark attendance for approved volunteers once their event has happened.
      </p>

      {loading ? <Loader /> : (
        <>
          <h3 className="dashboard-subheading">Awaiting Attendance</h3>
          {data.pending.length === 0 ? (
            <p className="dashboard-note" style={{ marginBottom: 36 }}>Nothing to mark right now.</p>
          ) : (
            <table className="table" style={{ marginBottom: 40 }}>
              <thead><tr><th>Volunteer</th><th>Event</th><th>Date</th><th>Hours</th><th>Mark</th></tr></thead>
              <tbody>
                {data.pending.map((row) => <PendingRow key={row.applicationId} row={row} onMarked={refetch} />)}
              </tbody>
            </table>
          )}

          <h3 className="dashboard-subheading">Recently Recorded</h3>
          {data.recorded.length === 0 ? (
            <p className="dashboard-note">No attendance recorded yet.</p>
          ) : (
            <table className="table">
              <thead><tr><th>Volunteer</th><th>Event</th><th>Status</th><th>Hours</th><th>Date</th></tr></thead>
              <tbody>
                {data.recorded.map((r) => (
                  <tr key={r.id}>
                    <td>{r.volunteer}</td>
                    <td>{r.event}</td>
                    <td><span className={`tag ${r.attended ? 'tag-sage' : 'tag-outline'}`}>{r.attended ? 'Present' : 'Absent'}</span></td>
                    <td>{r.hours}</td>
                    <td>{r.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}
    </DashboardLayout>
  );
}
