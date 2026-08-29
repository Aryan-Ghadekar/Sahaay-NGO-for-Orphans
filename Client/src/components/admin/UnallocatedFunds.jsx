import { useState } from 'react';
import { Loader } from '../common/AsyncState';
import { useFetch } from '../../hooks/useFetch';
import { getUnallocatedFunds, assignDonationProgram, getPrograms } from '../../api/endpoints/admin';

// Donations a donor left unrestricted ("wherever it's needed most") sit
// here until the admin earmarks them for a specific program — that
// assignment is what later lets the impact-record flow attach a real
// program/outcome narrative to the money.
function FundRow({ row, programs, onAssigned }) {
  const [programId, setProgramId] = useState('');
  const [assigning, setAssigning] = useState(false);

  const handleAssign = async () => {
    if (!programId) return;
    setAssigning(true);
    try {
      await assignDonationProgram(row.id, programId);
      onAssigned();
    } finally {
      setAssigning(false);
    }
  };

  return (
    <div className="admin-content-row">
      <span>{row.donor} — {row.amount} <span className="admin-team__email">· {row.date}</span></span>
      <div style={{ display: 'flex', gap: 8 }}>
        <select className="input" value={programId} onChange={(e) => setProgramId(e.target.value)} style={{ minWidth: 160 }}>
          <option value="">Assign to program…</option>
          {programs.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
        <button className="btn btn-secondary btn-sm" onClick={handleAssign} disabled={!programId || assigning}>
          {assigning ? 'Assigning…' : 'Assign'}
        </button>
      </div>
    </div>
  );
}

export default function UnallocatedFunds() {
  const { data: funds, loading: fundsLoading, error, refetch } = useFetch(getUnallocatedFunds, []);
  const { data: programs, loading: programsLoading } = useFetch(getPrograms, []);

  if (fundsLoading || programsLoading) return <Loader />;
  if (error) return <p className="dashboard-note" style={{ margin: 0 }}>Couldn&apos;t load unallocated funds.</p>;
  if (!funds.length) {
    return <p className="dashboard-note" style={{ margin: 0 }}>No unrestricted funds waiting on a program right now.</p>;
  }

  return (
    <div className="admin-content-list">
      {funds.map((row) => (
        <FundRow key={row.id} row={row} programs={programs || []} onAssigned={refetch} />
      ))}
    </div>
  );
}
