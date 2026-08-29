import { useNavigate } from 'react-router-dom';
import Footer from '../../components/layout/Footer';
import Hero from '../../components/sections/Hero';
import TrustStrip from '../../components/sections/TrustStrip';
import FloatingDonateButton from '../../components/sections/FloatingDonateButton';
import AboutSection from '../../components/sections/AboutSection';
import ImpactSection from '../../components/sections/ImpactSection';
import StorySection from '../../components/sections/StorySection';
import VideoSection from '../../components/sections/VideoSection';
import ProgramsSection from '../../components/sections/ProgramsSection';
import VolunteerCta from '../../components/sections/VolunteerCta';
import { Loader, ErrorState } from '../../components/common/AsyncState';
import { useFetch } from '../../hooks/useFetch';
import { useDonateModal } from '../../context/DonateModalContext';
import { getImpactStats, getImpactBreakdown, getEvents, getSiteImages } from '../../api/endpoints/publicSite';

export default function Home() {
  const navigate = useNavigate();
  const { open: openDonateModal } = useDonateModal();
  const { data: stats, loading: statsLoading, error: statsError, refetch: refetchStats } = useFetch(getImpactStats, []);
  const { data: breakdown, loading: breakdownLoading, error: breakdownError, refetch: refetchBreakdown } = useFetch(getImpactBreakdown, []);
  const { data: events, loading: eventsLoading, error: eventsError, refetch: refetchEvents } = useFetch(getEvents, []);
  const { data: siteImages } = useFetch(getSiteImages, []);

  // Volunteering requires an account now that dashboards are role-gated —
  // send people to sign in rather than straight at a protected route.
  const goToVolunteerSignIn = () => navigate('/login');

  // Each section fails independently — one bad request (e.g. a schema
  // mismatch on /api/public/events) shows an inline retry in that section's
  // slot instead of a null data access crashing the whole page blank.
  return (
    <>
      <Hero onDonate={openDonateModal} onVolunteer={goToVolunteerSignIn} image={siteImages?.hero_image} />
      <TrustStrip />
      {statsLoading ? <Loader /> : statsError ? <ErrorState error={statsError} onRetry={refetchStats} /> : <AboutSection stats={stats} />}
      {breakdownLoading ? <Loader /> : breakdownError ? <ErrorState error={breakdownError} onRetry={refetchBreakdown} /> : <ImpactSection breakdown={breakdown} />}
      <StorySection />
      <VideoSection />
      {eventsLoading ? <Loader /> : eventsError ? <ErrorState error={eventsError} onRetry={refetchEvents} /> : <ProgramsSection ongoing={events.ongoing} upcoming={events.upcoming} />}
      <VolunteerCta onDonate={openDonateModal} image={siteImages?.volunteer_cta_image} />
      <Footer />
      <FloatingDonateButton />
    </>
  );
}
