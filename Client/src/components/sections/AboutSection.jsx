import Reveal from '../common/Reveal';
import StatCard from '../common/StatCard';
import './AboutSection.css';

export default function AboutSection({ stats }) {
  return (
    <section id="about" className="about container">
      <Reveal>
        <p className="section-kicker">About Sahaay</p>
        <h2 className="section-title">Supporting orphans, building futures</h2>
      </Reveal>
      <div className="about__grid">
        <Reveal delay={80}>
          <h3 className="about__heading">Our Mission</h3>
          <p className="about__body">
            To give every orphaned child access to education, healthcare and a caring community —
            connecting donors and volunteers directly to the programs that need them.
          </p>
        </Reveal>
        <Reveal delay={160}>
          <h3 className="about__heading">Our Vision</h3>
          <p className="about__body">
            A future where no child's circumstances at birth determine the opportunities available
            to them.
          </p>
        </Reveal>
      </div>
      <Reveal delay={220} className="about__stats">
        {stats.map((s) => (
          <StatCard key={s.label} value={s.value} label={s.label} />
        ))}
      </Reveal>
    </section>
  );
}
