import { Loader } from '../common/AsyncState';
import ProgressBar from '../common/ProgressBar';
import './EventDetailView.css';

// Presentational only — no DashboardLayout, no data fetching. Shared by
// StaffEventDetail.jsx and AdminEventDetail.jsx, which each supply the
// right nav and hit their own role's API endpoints.
export default function EventDetailView({ event, loading, onToggleChecklistItem, busyKey }) {
  if (loading || !event) return <Loader />;

  const doneCount = event.checklist.filter((i) => i.isDone).length;

  return (
    <div>
      <div className="card event-detail-header">
        <div>
          <h3 className="dashboard-subheading" style={{ marginTop: 0 }}>{event.title}</h3>
          <p className="dashboard-note" style={{ margin: 0 }}>
            {event.program} · {event.eventDate} · {event.location}
          </p>
        </div>
        <span className={`tag ${event.statusRaw === 'ongoing' ? 'tag-sage' : event.statusRaw === 'completed' ? 'tag-neutral' : 'tag-outline'}`}>
          {event.status}
        </span>
      </div>

      <div className="event-detail-stats">
        <div className="card event-detail-stat">
          <p className="dashboard-note" style={{ margin: '0 0 4px' }}>Budget</p>
          <p className="event-detail-stat__value">{event.budgetAmountDisplay}</p>
        </div>
        <div className="card event-detail-stat">
          <p className="dashboard-note" style={{ margin: '0 0 4px' }}>Funds Raised</p>
          <p className="event-detail-stat__value">{event.fundsRaisedDisplay}</p>
        </div>
        <div className="card event-detail-stat">
          <p className="dashboard-note" style={{ margin: '0 0 4px' }}>Funds Used</p>
          <p className="event-detail-stat__value">{event.fundsUsedDisplay}</p>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 24 }}>
        <h4 className="dashboard-subheading" style={{ marginTop: 0 }}>Readiness Checklist</h4>
        <ProgressBar value={doneCount} max={event.checklist.length} label={`${doneCount} of ${event.checklist.length} complete`} />
        <ul className="event-checklist">
          {event.checklist.map((item) => (
            <li key={item.key} className="event-checklist__item">
              {item.auto ? (
                <>
                  <span className={`tag ${item.isDone ? 'tag-sage' : 'tag-outline'}`}>{item.isDone ? '✓' : '…'}</span>
                  <span>{item.label}</span>
                  <span className="dashboard-note" style={{ margin: '0 0 0 auto' }}>{item.approvedCount} / {item.neededCount} assigned</span>
                </>
              ) : (
                <label className="event-checklist__checkbox">
                  <input
                    type="checkbox"
                    checked={item.isDone}
                    disabled={busyKey === item.key}
                    onChange={(e) => onToggleChecklistItem(item.key, e.target.checked)}
                  />
                  <span>{item.label}</span>
                </label>
              )}
            </li>
          ))}
        </ul>
      </div>

      <div className="card">
        <h4 className="dashboard-subheading" style={{ marginTop: 0 }}>Assigned Volunteers</h4>
        {event.approvedVolunteers.length === 0 ? (
          <p className="dashboard-note">No volunteers assigned yet.</p>
        ) : (
          <table className="table">
            <thead><tr><th>Name</th><th>Skills</th><th>Availability</th></tr></thead>
            <tbody>
              {event.approvedVolunteers.map((v) => (
                <tr key={v.id}><td>{v.name}</td><td>{v.skills}</td><td>{v.availability}</td></tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
