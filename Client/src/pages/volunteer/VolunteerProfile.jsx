import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Loader } from '../../components/common/AsyncState';
import { useFetch } from '../../hooks/useFetch';
import { getVolunteerProfile, updateVolunteerProfile } from '../../api/endpoints/volunteer';
import { VOLUNTEER_NAV } from '../../constants/nav';

const AVAILABILITY_OPTIONS = ['Weekdays', 'Weekends', 'Flexible'];

export default function VolunteerProfile() {
  const { data: profile, loading } = useFetch(getVolunteerProfile, []);
  const [form, setForm] = useState(null);
  const [status, setStatus] = useState('idle'); // idle | saving | saved | error

  useEffect(() => {
    if (profile) {
      setForm({
        skills: (profile.skills || []).join(', '),
        qualification: profile.qualification || '',
        availability: profile.availability || 'Flexible',
        location: profile.location || '',
      });
    }
  }, [profile]);

  const set = (field) => (e) => { setForm((f) => ({ ...f, [field]: e.target.value })); setStatus('idle'); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('saving');
    try {
      await updateVolunteerProfile(form);
      setStatus('saved');
    } catch {
      setStatus('error');
    }
  };

  return (
    <DashboardLayout items={VOLUNTEER_NAV}>
      <h2 className="dashboard-title">Profile</h2>
      <p className="dashboard-subtitle" style={{ marginBottom: 28 }}>
        Keep this up to date — it's what NGO staff see when matching you to events.
      </p>

      {loading || !form ? <Loader /> : (
        <form className="admin-form card" style={{ maxWidth: 480 }} onSubmit={handleSubmit}>
          <div className="field"><label>Skills</label>
            <input className="input" placeholder="e.g. Teaching, First Aid" value={form.skills} onChange={set('skills')} />
          </div>
          <div className="field"><label>Qualification</label>
            <input className="input" placeholder="e.g. Bachelor's in Education · 3 yrs experience" value={form.qualification} onChange={set('qualification')} />
          </div>
          <div className="field"><label>Availability</label>
            <select className="input" value={form.availability} onChange={set('availability')}>
              {AVAILABILITY_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
          <div className="field"><label>Location</label>
            <input className="input" placeholder="e.g. Pune Center" value={form.location} onChange={set('location')} />
          </div>
          {status === 'error' && <p className="login-card__error">Couldn't save — try again.</p>}
          {status === 'saved' && <p className="admin-form__success">Saved.</p>}
          <button className="btn btn-primary btn-block" type="submit" disabled={status === 'saving'}>
            {status === 'saving' ? 'Saving…' : 'Save Profile'}
          </button>
        </form>
      )}
    </DashboardLayout>
  );
}
