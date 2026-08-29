import { useEffect, useRef, useState } from 'react';
import Reveal from '../common/Reveal';
import { loadYouTubeApi } from '../../utils/loadYouTubeApi';
import './VideoSection.css';

const VIDEO_ID = 'Eeh7itXHRSw';

export default function VideoSection() {
  const mountRef = useRef(null);
  const playerRef = useRef(null);
  const [ready, setReady] = useState(false);

  // The IFrame API replaces this div with the actual player iframe — React
  // never re-renders anything inside it, so handing control to an external
  // widget here is safe.
  useEffect(() => {
    let cancelled = false;
    loadYouTubeApi().then((YT) => {
      if (cancelled || !mountRef.current) return;
      playerRef.current = new YT.Player(mountRef.current, {
        videoId: VIDEO_ID,
        host: 'https://www.youtube-nocookie.com',
        playerVars: { mute: 1, playsinline: 1, rel: 0, modestbranding: 1 },
        events: { onReady: () => setReady(true) },
      });
    });
    return () => {
      cancelled = true;
      playerRef.current?.destroy?.();
    };
  }, []);

  // Hover-to-preview: muted autoplay on enter, pause on leave. Native
  // YouTube controls are still available for anyone who wants sound or to
  // watch the whole thing.
  const handleEnter = () => {
    if (!ready) return;
    playerRef.current.mute();
    playerRef.current.playVideo();
  };
  const handleLeave = () => {
    if (!ready) return;
    playerRef.current.pauseVideo();
  };

  return (
    <section className="video-section">
      <div className="container">
        <Reveal>
          <p className="section-kicker">See It In Action</p>
          <h2 className="section-title">Watch How Your Support Creates Change</h2>
          <p className="video-section__lead">
            A short documentary look at the students and programs your donations and volunteer
            hours make possible. Hover to preview.
          </p>
        </Reveal>
        <Reveal
          delay={100}
          className="video-section__frame"
          onMouseEnter={handleEnter}
          onMouseLeave={handleLeave}
        >
          <div ref={mountRef} />
        </Reveal>
      </div>
    </section>
  );
}
