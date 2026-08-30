import { useState } from 'react';
import { useParams } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import EventDetailView from '../../components/events/EventDetailView';
import { useFetch } from '../../hooks/useFetch';
import { getEventDetail, updateEventChecklist } from '../../api/endpoints/staff';
import { STAFF_NAV } from '../../constants/nav';

export default function StaffEventDetail() {
  const { id } = useParams();
  const { data, loading, refetch } = useFetch(() => getEventDetail(id), [id]);
  const [busyKey, setBusyKey] = useState(null);

  const toggle = async (itemKey, isDone) => {
    setBusyKey(itemKey);
    try {
      await updateEventChecklist(id, { itemKey, isDone });
      refetch();
    } finally {
      setBusyKey(null);
    }
  };

  return (
    <DashboardLayout items={STAFF_NAV}>
      <h2 className="dashboard-title">Event Details</h2>
      <p className="dashboard-subtitle" style={{ marginBottom: 28 }}>
        Track readiness, funds, and who's assigned to this event.
      </p>
      <EventDetailView event={data} loading={loading} onToggleChecklistItem={toggle} busyKey={busyKey} />
    </DashboardLayout>
  );
}
