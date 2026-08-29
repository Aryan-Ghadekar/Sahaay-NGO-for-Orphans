import { useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Loader } from '../../components/common/AsyncState';
import { useFetch } from '../../hooks/useFetch';
import { getAllAssignments, assignApplication } from '../../api/endpoints/staff';
import { STAFF_NAV } from '../../constants/nav';

export default function StaffAssignments() {
  const { data, loading } = useFetch(getAllAssignments, []);
  const [assignedIds, setAssignedIds] = useState(new Set());

  const handleAssign = async (id) => {
    setAssignedIds((prev) => new Set(prev).add(id));
    try {
      await assignApplication(id);
    } catch {
      setAssignedIds((prev) => { const next = new Set(prev); next.delete(id); return next; });
    }
  };

  return (
    <DashboardLayout items={STAFF_NAV}>
      <h2 className="dashboard-title">Assignments</h2>
      <p className="dashboard-subtitle" style={{ marginBottom: 28 }}>
        Every volunteer application still waiting on a decision, across all events.
      </p>

      {loading ? <Loader /> : !data.length ? (
        <p className="dashboard-note">No pending applications right now.</p>
      ) : (
        <table className="table">
          <thead>
            <tr><th>Volunteer</th><th>Event</th><th>Match Score</th><th>Skills</th><th>Availability</th><th>Applied</th><th>Action</th></tr>
          </thead>
          <tbody>
            {data.map((r) => {
              const assigned = assignedIds.has(r.id);
              return (
                <tr key={r.id}>
                  <td>{r.name}</td><td>{r.event}</td><td>{r.match}</td><td>{r.skills}</td><td>{r.availability}</td><td>{r.date}</td>
                  <td>
                    <button className="btn btn-secondary btn-sm" disabled={assigned} onClick={() => handleAssign(r.id)}>
                      {assigned ? 'Assigned' : 'Assign'}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </DashboardLayout>
  );
}
