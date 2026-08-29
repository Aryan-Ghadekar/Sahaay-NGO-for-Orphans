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
  const { data: stats, loading: statsLoading, error: statsError } = useFetch(getImpactStats, []);
  const { data: breakdown, loading: breakdownLoading } = useFetch(getImpactBreakdown, []);
  const { data: events, loading: eventsLoading } = useFetch(getEvents, []);
  const { data: siteImages } = useFetch(getSiteImages, []);

  // Volunteering requires an account now that dashboards are role-gated —
  // send people to sign in rather than straight at a protected route.
  const goToVolunteerSignIn = () => navigate('/login');

  if (statsError) return <ErrorState error={statsError} />;

  return (
    <>
      <Hero onDonate={openDonateModal} onVolunteer={goToVolunteerSignIn} image={siteImages?.hero_image} />
      <TrustStrip />
      {statsLoading ? <Loader /> : <AboutSection stats={stats} />}
      {breakdownLoading ? <Loader /> : <ImpactSection breakdown={breakdown} />}
      <StorySection />
      <VideoSection />
      {eventsLoading ? <Loader /> : <ProgramsSection ongoing={events.ongoing} upcoming={events.upcoming} />}
      <VolunteerCta onDonate={openDonateModal} image={siteImages?.volunteer_cta_image} />
      <Footer />
      <FloatingDonateButton />
    </>
  );
}
