import { useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Loader } from '../../components/common/AsyncState';
import { useFetch } from '../../hooks/useFetch';
import { getSiteImages, updateSiteImage } from '../../api/endpoints/admin';
import { imageToDataUrl } from '../../utils/imageToDataUrl';
import { photos } from '../../assets/photos';
import { ADMIN_NAV } from '../../constants/nav';
import './AdminContent.css';

const BLOCKS = [
  { key: 'hero_image', label: 'Hero Image', hint: 'The large photo on the homepage banner.', fallback: photos.classroomChildren },
  { key: 'volunteer_cta_image', label: 'Volunteer CTA Image', hint: 'The photo next to "Your contribution can become an opportunity."', fallback: photos.volunteerWithChildren },
];

function ImageBlock({ block, current, onSaved }) {
  const [preview, setPreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(false);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreview(await imageToDataUrl(file));
    setError(false);
  };

  const handleSave = async () => {
    if (!preview) return;
    setSaving(true);
    setError(false);
    try {
      await updateSiteImage({ key: block.key, imageDataUrl: preview });
      setPreview(null);
      onSaved();
    } catch {
      setError(true);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="card admin-content-block">
      <h3 className="dashboard-subheading">{block.label}</h3>
      <p className="dashboard-note" style={{ margin: '0 0 12px' }}>{block.hint}</p>
      <div className="admin-content-block__row">
        <img className="admin-content-block__preview" src={preview || current || block.fallback} alt={block.label} />
        <div className="admin-content-block__actions">
          <label className="btn btn-secondary btn-sm admin-content-block__upload">
            Choose Image
            <input type="file" accept="image/*" onChange={handleFile} hidden />
          </label>
          <button className="btn btn-primary btn-sm" onClick={handleSave} disabled={!preview || saving}>
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
      {!current && !preview && <p className="dashboard-note" style={{ margin: '8px 0 0' }}>Using the default photo — upload one to replace it.</p>}
      {error && <p className="login-card__error">Couldn&apos;t save that image — try again.</p>}
    </div>
  );
}

export default function AdminContent() {
  const { data: images, loading, refetch } = useFetch(getSiteImages, []);

  return (
    <DashboardLayout items={ADMIN_NAV}>
      <h2 className="dashboard-title">Public Website Content</h2>
      <p className="dashboard-subtitle" style={{ marginBottom: 28 }}>
        Replace the images visitors see on the public landing page. Programs and Events (including
        each event&apos;s own image) are managed on their own pages.
      </p>

      {loading ? <Loader /> : (
        <div className="admin-content-blocks">
          {BLOCKS.map((block) => (
            <ImageBlock key={block.key} block={block} current={images[block.key]} onSaved={refetch} />
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
