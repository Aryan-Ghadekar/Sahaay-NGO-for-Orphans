import { useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Loader } from '../../components/common/AsyncState';
import { useFetch } from '../../hooks/useFetch';
import { getAttendanceQueue, markAttendance, issueCertificate } from '../../api/endpoints/staff';
import { downloadCertificate } from '../../utils/certificateImage';
import { STAFF_NAV } from '../../constants/nav';

function PendingRow({ row, onMarked }) {
  const [hours, setHours] = useState('');
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      await markAttendance({
        applicationId: row.applicationId,
        volunteerId: row.volunteerId,
        eventId: row.eventId,
        hours: Number(hours) || 0,
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
      <td>
        <button className="btn btn-primary btn-sm" onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save Hours'}</button>
      </td>
    </tr>
  );
}

function RecordedRow({ row, onChanged }) {
  const [busy, setBusy] = useState(false);

  const issue = async () => {
    setBusy(true);
    try {
      await issueCertificate({ volunteerId: row.volunteerId, eventId: row.eventId });
      onChanged();
    } finally {
      setBusy(false);
    }
  };

  return (
    <tr>
      <td>{row.volunteer}</td>
      <td>{row.event}</td>
      <td>{row.hours} / {row.minHoursRequired}</td>
      <td>{row.date}</td>
      <td>
        {row.certificateIssued ? (
          <span className="tag tag-sage">Issued</span>
        ) : row.eligible ? (
          <span className="tag tag-accent">Eligible</span>
        ) : (
          <span className="tag tag-outline">Not yet</span>
        )}
      </td>
      <td style={{ display: 'flex', gap: 8 }}>
        {!row.certificateIssued && row.eligible && (
          <button className="btn btn-primary btn-sm" onClick={issue} disabled={busy}>{busy ? 'Issuing…' : 'Issue Certificate'}</button>
        )}
        {row.certificateIssued && (
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => downloadCertificate({ volunteerName: row.volunteer, eventTitle: row.event, hours: row.hours, issuedAt: row.issuedAt })}
          >
            Download
          </button>
        )}
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
        Log hours for approved volunteers once their event has happened. Meeting an event's
        minimum hours makes a volunteer eligible for a certificate — issue it from here.
      </p>

      {loading ? <Loader /> : (
        <>
          <h3 className="dashboard-subheading">Awaiting Hours</h3>
          {data.pending.length === 0 ? (
            <p className="dashboard-note" style={{ marginBottom: 36 }}>Nothing to log right now.</p>
          ) : (
            <table className="table" style={{ marginBottom: 40 }}>
              <thead><tr><th>Volunteer</th><th>Event</th><th>Date</th><th>Hours</th><th>Save</th></tr></thead>
              <tbody>
                {data.pending.map((row) => <PendingRow key={row.applicationId} row={row} onMarked={refetch} />)}
              </tbody>
            </table>
          )}

          <h3 className="dashboard-subheading">Recently Recorded</h3>
          {data.recorded.length === 0 ? (
            <p className="dashboard-note">No hours recorded yet.</p>
          ) : (
            <table className="table">
              <thead><tr><th>Volunteer</th><th>Event</th><th>Hours / Required</th><th>Date</th><th>Certificate</th><th>Action</th></tr></thead>
              <tbody>
                {data.recorded.map((r) => <RecordedRow key={r.id} row={r} onChanged={refetch} />)}
              </tbody>
            </table>
          )}
        </>
      )}
    </DashboardLayout>
  );
}
