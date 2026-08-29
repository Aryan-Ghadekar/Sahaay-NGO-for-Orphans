import { useEffect, useState } from 'react';
import Photo from '../common/Photo';
import Reveal from '../common/Reveal';
import { photos } from '../../assets/photos';
import './StorySection.css';

const ROTATE_MS = 7000;

// Representative composite stories, not literal transcripts of a named
// child — same practice most NGO sites follow with stock photography (see
// the note on childPortrait's alt text). Swap in real testimonials once
// they exist.
const STORIES = [
  {
    photo: photos.childPortrait,
    quote: "Before Sahaay, I didn't think I'd get to finish school. Now I go every day, and I want to become a teacher — so I can give another child what was given to me.",
    by: '— Priya, age 12, Pune Center',
    note: "Priya is one of 1,240 children whose story is still being written. Every donation, every volunteer hour, every program you support becomes someone's next chapter.",
  },
  {
    photo: photos.childrenWithLaptops,
    quote: "I'd never touched a computer before the Digital Literacy Drive. Now I help my little sister with her homework on it every evening.",
    by: '— Rahul, age 14, Nashik Center',
    note: 'Rahul is one of dozens of children the Digital Literacy program has reached this year — skills that open doors far beyond the classroom.',
  },
  {
    photo: photos.schoolgirlsOutdoor,
    quote: 'The health camp caught something my family could never have afforded to catch on our own. I did not miss a single day of school after that.',
    by: '— Meera, age 10, Mumbai Center',
    note: 'Every health camp is free for the children in our care, funded entirely by donations like yours.',
  },
  {
    photo: photos.volunteerWithChildren,
    quote: "I came to volunteer for a weekend. Three years later, I still show up every Saturday — these kids taught me more than I ever taught them.",
    by: '— Ananya, Volunteer, Pune Center',
    note: 'Sahaay has 560+ volunteers like Ananya — ordinary people who kept coming back.',
  },
];

// Everything above this section is proof (mission statements, counted
// stats) — this is the one place the page slows down to make the case in
// human terms instead of numbers, before Programs turns that feeling back
// into concrete ways to act. Auto-rotates through several stories so a
// returning visitor doesn't see the same face every time.
export default function StorySection() {
  const [index, setIndex] = useState(0);
  const [cycle, setCycle] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const t = setTimeout(() => {
      setIndex((i) => (i + 1) % STORIES.length);
      setCycle((c) => c + 1);
    }, ROTATE_MS);
    return () => clearTimeout(t);
  }, [index, paused]);

  const goTo = (i) => {
    setIndex(i);
    setCycle((c) => c + 1);
  };

  const story = STORIES[index];

  return (
    <section className="story-wrap" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <div className="story">
        <Reveal className="story__frame">
          <div className="story__media" key={`media-${index}-${cycle}`}>
            <Photo src={story.photo} alt={story.by.replace('— ', 'Photo representing ')} shape="rounded" />
          </div>
          <div className="story__copy" key={`copy-${index}-${cycle}`}>
            <span className="story__mark" aria-hidden="true">“</span>
            <p className="story__quote">{story.quote}</p>
            <p className="story__by">{story.by}</p>
            <p className="story__note">{story.note}</p>
          </div>
        </Reveal>

        <div className="story__progress" role="tablist" aria-label="Featured stories">
          {STORIES.map((s, i) => (
            <button
              key={i}
              role="tab"
              aria-selected={i === index}
              aria-label={`Story ${i + 1} of ${STORIES.length}`}
              className={`story__dot ${i < index ? 'is-complete' : ''} ${i === index ? 'is-active' : ''}`}
              onClick={() => goTo(i)}
            >
              {i === index && (
                <span
                  key={cycle}
                  className="story__dot-fill"
                  style={{ animationDuration: `${ROTATE_MS}ms`, animationPlayState: paused ? 'paused' : 'running' }}
                />
              )}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
