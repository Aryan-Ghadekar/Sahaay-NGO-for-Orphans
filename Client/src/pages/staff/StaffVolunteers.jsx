import { useEffect, useRef, useState } from 'react';
import jsQR from 'jsqr';
import DashboardLayout from '../../components/layout/DashboardLayout';
import SimpleTable from '../../components/common/SimpleTable';
import { Loader } from '../../components/common/AsyncState';
import { useFetch } from '../../hooks/useFetch';
import { getVolunteers, getAttendanceQueue, markAttendance, issueCertificate, scanQrCode } from '../../api/endpoints/staff';
import { downloadCertificate } from '../../utils/certificateImage';
import { STAFF_NAV } from '../../constants/nav';

// No email column — deliberately: the API this calls never selects it
// (see Server/src/services/volunteers.service.js listAllVolunteersMasked),
// so there's nothing here to accidentally leak.
const VOLUNTEER_COLUMNS = [
  { key: 'name', label: 'Name' },
  { key: 'skills', label: 'Skills' },
  { key: 'availability', label: 'Availability' },
  { key: 'location', label: 'Location' },
];

// Camera-based QR scanner: one scan checks a volunteer in, the next scan
// of the same code checks them out — the server decides which based on
// their attendance state, this just decodes whatever QR is in frame and
// posts the raw string. A busyRef gate stops a code held in front of the
// camera from firing dozens of scans a second; the rAF loop keeps running
// while "busy" (cheap no-op check) so resuming after "Scan Next" needs no
// extra restart logic.
function QrScanner({ onScanned }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const rafRef = useRef(null);
  const busyRef = useRef(false);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null); // { ok: boolean, message: string }

  useEffect(() => {
    if (!scanning) return undefined;
    let cancelled = false;

    const tick = () => {
      if (!busyRef.current) {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (video && canvas && video.readyState === video.HAVE_ENOUGH_DATA) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height);
          if (code?.data) {
            busyRef.current = true;
            handleDecoded(code.data);
          }
        }
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    const handleDecoded = async (applicationId) => {
      try {
        const res = await scanQrCode(applicationId);
        if (res.action === 'checked_in') {
          setResult({ ok: true, message: `Checked in: ${res.volunteer} at ${new Date(res.checkedInAt).toLocaleTimeString()}` });
        } else {
          setResult({ ok: true, message: `Checked out: ${res.volunteer} — ${res.hours} hrs logged` });
        }
        onScanned();
      } catch (err) {
        setResult({ ok: false, message: err?.message || 'Scan failed — try again.' });
      }
    };

    (async () => {
      if (!navigator.mediaDevices?.getUserMedia) {
        setError('Camera access is not available — make sure you\'re on HTTPS (or localhost) in a supported browser.');
        setScanning(false);
        return;
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        rafRef.current = requestAnimationFrame(tick);
      } catch {
        setError('Could not access the camera — check that permission was granted.');
        setScanning(false);
      }
    })();

    return () => {
      cancelled = true;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };
  }, [scanning]);

  const start = () => {
    setError('');
    setResult(null);
    busyRef.current = false;
    setScanning(true);
  };
  const stop = () => setScanning(false);
  const scanNext = () => {
    setResult(null);
    busyRef.current = false;
  };

  return (
    <div className="card" style={{ maxWidth: 420, marginBottom: 36 }}>
      <h3 className="dashboard-subheading" style={{ marginTop: 0 }}>Scan Volunteer QR</h3>
      {!scanning ? (
        <button className="btn btn-primary" onClick={start}>Start Scanning</button>
      ) : (
        <>
          <video ref={videoRef} muted playsInline style={{ width: '100%', borderRadius: 8, background: '#000' }} />
          <canvas ref={canvasRef} style={{ display: 'none' }} />
          <button className="btn btn-secondary btn-sm" style={{ marginTop: 8 }} onClick={stop}>Stop Scanning</button>
        </>
      )}
      {error && <p className="login-card__error" style={{ marginTop: 8 }}>{error}</p>}
      {result && (
        <div style={{ marginTop: 8 }}>
          <p className={result.ok ? 'admin-form__success' : 'login-card__error'}>{result.message}</p>
          <button className="btn btn-secondary btn-sm" onClick={scanNext}>Scan Next</button>
        </div>
      )}
    </div>
  );
}

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
        {row.checkedInAt && (
          <p className="dashboard-note" style={{ margin: '0 0 6px' }}>
            Checked in at {new Date(row.checkedInAt).toLocaleTimeString()} — awaiting checkout scan.
          </p>
        )}
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

export default function StaffVolunteers() {
  const { data: volunteers, loading: volunteersLoading } = useFetch(getVolunteers, []);
  const { data: attendance, loading: attendanceLoading, refetch } = useFetch(getAttendanceQueue, []);

  return (
    <DashboardLayout items={STAFF_NAV}>
      <h2 className="dashboard-title">Volunteers</h2>
      <p className="dashboard-note" style={{ marginBottom: 28 }}>
        Operational view — contact details are restricted to Administrators. Scan a volunteer's
        QR code on arrival and departure to log their hours automatically, or enter hours by hand
        for volunteers without one.
      </p>

      {volunteersLoading ? <Loader /> : (
        <div style={{ marginBottom: 36 }}>
          <SimpleTable columns={VOLUNTEER_COLUMNS} rows={volunteers} emptyMessage="No volunteers have signed up yet." />
        </div>
      )}

      <QrScanner onScanned={refetch} />

      {attendanceLoading ? <Loader /> : (
        <>
          <h3 className="dashboard-subheading">Awaiting Hours</h3>
          {attendance.pending.length === 0 ? (
            <p className="dashboard-note" style={{ marginBottom: 36 }}>Nothing to log right now.</p>
          ) : (
            <table className="table" style={{ marginBottom: 40 }}>
              <thead><tr><th>Volunteer</th><th>Event</th><th>Date</th><th>Hours</th><th>Save</th></tr></thead>
              <tbody>
                {attendance.pending.map((row) => <PendingRow key={row.applicationId} row={row} onMarked={refetch} />)}
              </tbody>
            </table>
          )}

          <h3 className="dashboard-subheading">Recently Recorded</h3>
          {attendance.recorded.length === 0 ? (
            <p className="dashboard-note">No hours recorded yet.</p>
          ) : (
            <table className="table">
              <thead><tr><th>Volunteer</th><th>Event</th><th>Hours / Required</th><th>Date</th><th>Certificate</th><th>Action</th></tr></thead>
              <tbody>
                {attendance.recorded.map((r) => <RecordedRow key={r.id} row={r} onChanged={refetch} />)}
              </tbody>
            </table>
          )}
        </>
      )}
    </DashboardLayout>
  );
}
