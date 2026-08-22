import './ImagePlaceholder.css';

// Stand-in for real photography until content/CMS integration lands. Once a
// backend/CMS supplies media, swap this for an <img src={url}> — every call
// site already passes a `label` describing what belongs there.
export default function ImagePlaceholder({ label = 'Image', shape = 'rounded', className = '', style }) {
  return (
    <div className={`img-placeholder img-placeholder--${shape} ${className}`.trim()} style={style}>
      <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <path d="m21 15-5-5L5 21" />
      </svg>
      <span>{label}</span>
    </div>
  );
}
