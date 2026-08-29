import DashboardLayout from '../../components/layout/DashboardLayout';
import { Loader } from '../../components/common/AsyncState';
import { useFetch } from '../../hooks/useFetch';
import { getCertificates } from '../../api/endpoints/volunteer';
import { downloadCertificate } from '../../utils/certificateImage';
import { VOLUNTEER_NAV } from '../../constants/nav';

function statusTag(row) {
  if (row.certificateIssued) return <span className="tag tag-sage">Certificate Issued</span>;
  if (row.eligible) return <span className="tag tag-accent">Eligible — awaiting issue</span>;
  return <span className="tag tag-outline">{row.hours} / {row.minHoursRequired} hrs</span>;
}

// Read-only for volunteers — staff/admin log hours and issue certificates
// (see Server's POST /api/staff/attendance and /api/staff/certificates);
// this just reports hours logged per event and lets a volunteer download
// the certificate once one has been issued.
export default function VolunteerCertificates() {
  const { data, loading } = useFetch(getCertificates, []);

  return (
    <DashboardLayout items={VOLUNTEER_NAV}>
      <h2 className="dashboard-title">Certificates</h2>
      <p className="dashboard-subtitle" style={{ marginBottom: 28 }}>
        Hours are logged by NGO staff once an event has happened. Meeting an event's minimum
        hours makes you eligible for a certificate — staff or admin issue it from their side,
        and you can download it here.
      </p>

      {loading ? <Loader /> : !data.length ? (
        <p className="dashboard-note">No hours logged yet.</p>
      ) : (
        <table className="table">
          <thead><tr><th>Event</th><th>Date</th><th>Status</th><th>Action</th></tr></thead>
          <tbody>
            {data.map((row) => (
              <tr key={row.id}>
                <td>{row.event}</td>
                <td>{row.date}</td>
                <td>{statusTag(row)}</td>
                <td>
                  {row.certificateIssued && (
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => downloadCertificate({
                        volunteerName: row.volunteerName,
                        eventTitle: row.event,
                        hours: row.hours,
                        issuedAt: row.issuedAt,
                      })}
                    >
                      Download
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </DashboardLayout>
  );
}
