import Reveal from '../common/Reveal';
import StatCard from '../common/StatCard';
import './ImpactSection.css';

export default function ImpactSection({ breakdown }) {
  return (
    <section id="impact" className="impact container">
      <Reveal>
        <h2 className="section-title">See the Impact of Your Support</h2>
        <p className="impact__lead">
          Every donation flows into a program, an activity, and a measurable outcome for children
          in our care.
        </p>
      </Reveal>
      <div className="impact__grid">
        {breakdown.map((item, i) => (
          <Reveal delay={i * 60} key={item.kicker}>
            <div className="card card-hover">
              <p className="tag tag-sage" style={{ marginBottom: 14 }}>{item.kicker}</p>
              <StatCard value={item.value} label={item.body} />
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
