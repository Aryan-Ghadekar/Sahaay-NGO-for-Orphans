import { useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import SimpleTable from '../../components/common/SimpleTable';
import { Loader } from '../../components/common/AsyncState';
import { useFetch } from '../../hooks/useFetch';
import { getApplications } from '../../api/endpoints/volunteer';
import { generateApplicationQrDataUrl } from '../../utils/qrCode';
import { VOLUNTEER_NAV } from '../../constants/nav';

// Shown once an application is approved — the same code emailed at
// approval time, generated fresh client-side each time so this stays a
// pure fallback view (nothing new is issued or stored by opening it).
function CheckInQr({ applicationId }) {
  const [dataUrl, setDataUrl] = useState('');
  const [open, setOpen] = useState(false);

  const toggle = async () => {
    if (open) return setOpen(false);
    if (!dataUrl) setDataUrl(await generateApplicationQrDataUrl(applicationId));
    setOpen(true);
  };

  return (
    <div>
      <button className="btn btn-secondary btn-sm" onClick={toggle}>{open ? 'Hide QR' : 'View QR'}</button>
      {open && dataUrl && (
        <div style={{ marginTop: 8 }}>
          <img src={dataUrl} alt="Check-in QR code" width={140} height={140} />
          <p className="dashboard-note" style={{ margin: '4px 0 0', maxWidth: 200 }}>
            Show this to NGO staff at the venue — scanned once on arrival, once on departure.
          </p>
        </div>
      )}
    </div>
  );
}

const COLUMNS = [
  { key: 'event', label: 'Event' },
  { key: 'match', label: 'Match Score' },
  { key: 'date', label: 'Date' },
  {
    key: 'status',
    label: 'Status',
    render: (a) => (
      <span className={`tag ${a.status === 'Approved' ? 'tag-sage' : a.status === 'Completed' ? 'tag-neutral' : 'tag-outline'}`}>
        {a.status}
      </span>
    ),
  },
  {
    key: 'qr',
    label: 'Check-in QR',
    render: (a) => (a.status === 'Approved' ? <CheckInQr applicationId={a.id} /> : '—'),
  },
];

export default function VolunteerApplications() {
  const { data, loading } = useFetch(getApplications, []);
  return (
    <DashboardLayout items={VOLUNTEER_NAV}>
      <h2 className="dashboard-title">Applications</h2>
      <p className="dashboard-subtitle" style={{ marginBottom: 28 }}>Every event you've applied to, and where it stands.</p>
      {loading ? <Loader /> : <SimpleTable columns={COLUMNS} rows={data} emptyMessage="You haven't applied to any events yet." />}
    </DashboardLayout>
  );
}
