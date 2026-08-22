import Reveal from '../common/Reveal';
import './ImpactFlow.css';

// Renders a donation's journey (Donation → Program → Activity → Outcome →
// Impact) as a vertical chain of connected nodes, each step animating in
// slightly after the one before it.
export default function ImpactFlow({ steps }) {
  return (
    <div className="impact-flow">
      {steps.map((step, i) => (
        <Reveal as="div" delay={i * 90} key={step.label} className="impact-flow__step">
          <div className={`impact-flow__node ${step.highlight ? 'impact-flow__node--highlight' : ''}`}>
            <span className="tag tag-accent">{step.label}</span>
            <span>{step.value}</span>
          </div>
          {i < steps.length - 1 && <div className="impact-flow__arrow">↓</div>}
        </Reveal>
      ))}
    </div>
  );
}
