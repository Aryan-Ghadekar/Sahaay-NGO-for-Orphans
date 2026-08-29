import { useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Loader } from '../../components/common/AsyncState';
import { useFetch } from '../../hooks/useFetch';
import { getDonations, verifyDonation } from '../../api/endpoints/admin';
import { ADMIN_NAV } from '../../constants/nav';
import './AdminDonations.css';

function DonationRow({ row, onVerified }) {
  const [expanded, setExpanded] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const handleVerify = async () => {
    setVerifying(true);
    try {
      await verifyDonation(row.id);
      onVerified();
    } finally {
      setVerifying(false);
    }
  };

  return (
    <>
      <tr>
        <td>{row.donor}</td>
        <td>{row.program}</td>
        <td>{row.amount}</td>
        <td>{row.date}</td>
        <td><span className={`tag ${row.status === 'Used' ? 'tag-sage' : 'tag-outline'}`}>{row.status}</span></td>
        <td>
          {row.verified ? (
            <span className="tag tag-sage">Verified</span>
          ) : (
            <span className="tag tag-outline">Pending</span>
          )}
        </td>
        <td className="admin-donations__actions">
          {row.proofUrl && (
            <button className="btn btn-secondary btn-sm" onClick={() => setExpanded((v) => !v)}>
              {expanded ? 'Hide Proof' : 'View Proof'}
            </button>
          )}
          {!row.verified && (
            <button className="btn btn-primary btn-sm" onClick={handleVerify} disabled={verifying}>
              {verifying ? 'Verifying…' : 'Verify'}
            </button>
          )}
        </td>
      </tr>
      {expanded && row.proofUrl && (
        <tr>
          <td colSpan={7}>
            <div className="admin-donations__proof">
              <img src={row.proofUrl} alt={`Payment proof for ${row.donor}'s donation`} />
              {row.note && <p className="admin-donations__note">Donor note: {row.note}</p>}
              {row.impact && (
                <p className="admin-donations__note">
                  Impact: {row.impact} {row.impactAiGenerated && <span className="tag tag-accent">✨ AI-generated</span>}
                </p>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

export default function AdminDonations() {
  const { data, loading, refetch } = useFetch(getDonations, []);

  return (
    <DashboardLayout items={ADMIN_NAV}>
      <h2 className="dashboard-title">Donations</h2>
      <p className="dashboard-subtitle" style={{ marginBottom: 28 }}>
        Every donation across every donor. Check the payment screenshot against your bank
        statement, then mark it verified.
      </p>

      {loading ? <Loader /> : !data.length ? (
        <p className="dashboard-note">No donations yet.</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Donor</th><th>Program</th><th>Amount</th><th>Date</th><th>Status</th><th>Payment</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row) => <DonationRow key={row.id} row={row} onVerified={refetch} />)}
          </tbody>
        </table>
      )}
    </DashboardLayout>
  );
}
