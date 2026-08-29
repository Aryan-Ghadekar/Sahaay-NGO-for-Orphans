import './Photo.css';

// Real-photo counterpart to ImagePlaceholder — same shape API (reuses its
// rounded/rect/circle classes) so either one drops into the same slot.
export default function Photo({ src, alt, shape = 'rounded', className = '', style }) {
  return (
    <div className={`photo-frame img-placeholder--${shape} ${className}`} style={style}>
      <img src={src} alt={alt} />
    </div>
  );
}
