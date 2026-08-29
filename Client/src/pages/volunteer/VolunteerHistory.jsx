import DashboardLayout from '../../components/layout/DashboardLayout';
import SimpleTable from '../../components/common/SimpleTable';
import { Loader } from '../../components/common/AsyncState';
import { useFetch } from '../../hooks/useFetch';
import { getApplications, getCertificates } from '../../api/endpoints/volunteer';
import { VOLUNTEER_NAV } from '../../constants/nav';

const APPLICATION_COLUMNS = [
  { key: 'event', label: 'Event' },
  { key: 'date', label: 'Applied' },
  { key: 'status', label: 'Status', render: (a) => <span className={`tag ${a.status === 'Completed' ? 'tag-neutral' : 'tag-outline'}`}>{a.status}</span> },
];

const HOURS_COLUMNS = [
  { key: 'event', label: 'Event' },
  { key: 'date', label: 'Date' },
  { key: 'hours', label: 'Hours' },
  {
    key: 'certificateIssued',
    label: 'Certificate',
    render: (r) => <span className={`tag ${r.certificateIssued ? 'tag-sage' : r.eligible ? 'tag-accent' : 'tag-outline'}`}>{r.certificateIssued ? 'Issued' : r.eligible ? 'Eligible' : 'Not yet'}</span>,
  },
];

// Your whole volunteering record in one place — applications (what you
// signed up for) and logged hours/certificates (what actually happened)
// side by side, rather than duplicating either page's job.
export default function VolunteerHistory() {
  const { data: applications, loading: appsLoading } = useFetch(getApplications, []);
  const { data: hoursLog, loading: hoursLoading } = useFetch(getCertificates, []);

  return (
    <DashboardLayout items={VOLUNTEER_NAV}>
      <h2 className="dashboard-title">History</h2>
      <p className="dashboard-subtitle" style={{ marginBottom: 28 }}>Your full volunteering record with Sahaay.</p>

      <h3 className="dashboard-subheading">Applications</h3>
      {appsLoading ? <Loader /> : (
        <div style={{ marginBottom: 36 }}>
          <SimpleTable columns={APPLICATION_COLUMNS} rows={applications} emptyMessage="No applications yet." />
        </div>
      )}

      <h3 className="dashboard-subheading">Hours &amp; Certificates</h3>
      {hoursLoading ? <Loader /> : <SimpleTable columns={HOURS_COLUMNS} rows={hoursLog} emptyMessage="No hours recorded yet." />}
    </DashboardLayout>
  );
}
