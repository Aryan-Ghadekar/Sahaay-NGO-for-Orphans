import ImagePlaceholder from '../common/ImagePlaceholder';
import Reveal from '../common/Reveal';
import './StorySection.css';

// Everything above this section is proof (mission statements, counted
// stats) — this is the one place the page slows down to make the case in
// human terms instead of numbers, before Programs turns that feeling back
// into concrete ways to act.
export default function StorySection() {
  return (
    <section className="story-wrap">
      <div className="story">
        <Reveal className="story__media">
          <ImagePlaceholder label="Photo — a child from our program" shape="rounded" />
        </Reveal>
        <Reveal delay={100} className="story__copy">
          <span className="story__mark" aria-hidden="true">“</span>
          <p className="story__quote">
            Before Sahaay, I didn't think I'd get to finish school. Now I go every day, and I want
            to become a teacher — so I can give another child what was given to me.
          </p>
          <p className="story__by">— Priya, age 12, Pune Center</p>
          <p className="story__note">
            Priya is one of 1,240 children whose story is still being written. Every donation,
            every volunteer hour, every program you support becomes someone's next chapter.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
