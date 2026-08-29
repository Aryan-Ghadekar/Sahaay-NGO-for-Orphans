import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Loader } from '../../components/common/AsyncState';
import { useFetch } from '../../hooks/useFetch';
import { getVolunteerProfile, updateVolunteerProfile } from '../../api/endpoints/volunteer';
import { imageToDataUrl } from '../../utils/imageToDataUrl';
import { validateVolunteerForm, sanitizePhoneInput } from '../../utils/volunteerValidation';
import { VOLUNTEER_NAV } from '../../constants/nav';
import './VolunteerProfile.css';

const AVAILABILITY_OPTIONS = ['Weekdays', 'Weekends', 'Flexible'];
const TODAY = new Date().toISOString().slice(0, 10);

export default function VolunteerProfile() {
  const { data: profile, loading } = useFetch(getVolunteerProfile, []);
  const [form, setForm] = useState(null);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle'); // idle | saving | saved | error

  useEffect(() => {
    if (profile) {
      setForm({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        dateOfBirth: profile.dateOfBirth || '',
        mobileNumber: profile.mobileNumber || '',
        location: profile.location || '',
        address: profile.address || '',
        skills: (profile.skills || []).join(', '),
        qualification: profile.qualification || '',
        availability: profile.availability || 'Flexible',
        photoDataUrl: profile.photoDataUrl || '',
      });
    }
  }, [profile]);

  const set = (field) => (e) => {
    const raw = e.target.value;
    const value = field === 'mobileNumber' ? sanitizePhoneInput(raw) : raw;
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((er) => ({ ...er, [field]: undefined }));
    setStatus('idle');
  };

  const onPhoto = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const photoDataUrl = await imageToDataUrl(file);
    setForm((f) => ({ ...f, photoDataUrl }));
    setStatus('idle');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateVolunteerForm(form);
    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
      return;
    }
    setStatus('saving');
    try {
      await updateVolunteerProfile(form);
      setStatus('saved');
    } catch {
      setStatus('error');
    }
  };

  const err = (field) => errors[field] && <span className="field-error">{errors[field]}</span>;
  const cls = (field) => `input${errors[field] ? ' input-error' : ''}`;

  return (
    <DashboardLayout items={VOLUNTEER_NAV}>
      <h2 className="dashboard-title">Profile</h2>
      <p className="dashboard-subtitle" style={{ marginBottom: 28 }}>
        Keep this up to date — it's what NGO staff see when matching you to events.
      </p>

      {loading || !form ? <Loader /> : (
        <form className="admin-form card" style={{ maxWidth: 640 }} onSubmit={handleSubmit}>
          <div className="volunteer-profile-grid">
            <div className="field"><label>First name</label>
              <input className={cls('firstName')} value={form.firstName} onChange={set('firstName')} />
              {err('firstName')}
            </div>
            <div className="field"><label>Last name</label>
              <input className={cls('lastName')} value={form.lastName} onChange={set('lastName')} />
              {err('lastName')}
            </div>
            <div className="field"><label>Date of birth</label>
              <input className={cls('dateOfBirth')} type="date" max={TODAY} value={form.dateOfBirth} onChange={set('dateOfBirth')} />
              {err('dateOfBirth')}
            </div>
            <div className="field"><label>Mobile number</label>
              <input className={cls('mobileNumber')} inputMode="numeric" maxLength={10} placeholder="10-digit mobile number" value={form.mobileNumber} onChange={set('mobileNumber')} />
              {err('mobileNumber')}
            </div>
            <div className="field"><label>Location</label>
              <input className={cls('location')} placeholder="e.g. Pune Center" value={form.location} onChange={set('location')} />
              {err('location')}
            </div>
            <div className="field"><label>Availability</label>
              <select className="input" value={form.availability} onChange={set('availability')}>
                {AVAILABILITY_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
          </div>
          <div className="field"><label>Address</label>
            <input className={cls('address')} value={form.address} onChange={set('address')} />
            {err('address')}
          </div>
          <div className="field"><label>Skills</label>
            <input className={cls('skills')} placeholder="e.g. Teaching, First Aid" value={form.skills} onChange={set('skills')} />
            {err('skills')}
          </div>
          <div className="field"><label>Qualification</label>
            <input className={cls('qualification')} placeholder="e.g. Bachelor's in Education · 3 yrs experience" value={form.qualification} onChange={set('qualification')} />
            {err('qualification')}
          </div>
          <div className="field">
            <label>Photo</label>
            <input className="input" type="file" accept="image/*" onChange={onPhoto} />
            {form.photoDataUrl && <img className="volunteer-photo-preview" src={form.photoDataUrl} alt="Profile preview" />}
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
