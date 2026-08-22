import { useReveal } from '../../hooks/useReveal';

// Wrap any block to fade+slide it in the first time it scrolls into view.
// `delay` staggers siblings (e.g. cards in a grid) without extra markup.
export default function Reveal({ children, delay = 0, as: Tag = 'div', className = '', style, ...rest }) {
  const [ref, visible] = useReveal();
  return (
    <Tag
      ref={ref}
      className={`reveal ${visible ? 'is-visible' : ''} ${className}`.trim()}
      style={{ transitionDelay: visible ? `${delay}ms` : '0ms', ...style }}
      {...rest}
    >
      {children}
    </Tag>
  );
}
