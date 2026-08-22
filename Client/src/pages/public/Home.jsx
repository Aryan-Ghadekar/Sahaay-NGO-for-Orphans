import { useNavigate } from 'react-router-dom';
import Footer from '../../components/layout/Footer';
import Hero from '../../components/sections/Hero';
import AboutSection from '../../components/sections/AboutSection';
import ImpactSection from '../../components/sections/ImpactSection';
import StorySection from '../../components/sections/StorySection';
import ProgramsSection from '../../components/sections/ProgramsSection';
import VolunteerCta from '../../components/sections/VolunteerCta';
import { Loader, ErrorState } from '../../components/common/AsyncState';
import { useFetch } from '../../hooks/useFetch';
import { getImpactStats, getImpactBreakdown, getEvents } from '../../api/endpoints/publicSite';

export default function Home() {
  const navigate = useNavigate();
  const { data: stats, loading: statsLoading, error: statsError } = useFetch(getImpactStats, []);
  const { data: breakdown, loading: breakdownLoading } = useFetch(getImpactBreakdown, []);
  const { data: events, loading: eventsLoading } = useFetch(getEvents, []);

  const scrollToDonate = () => document.getElementById('volunteer')?.scrollIntoView({ behavior: 'smooth' });
  // Volunteering requires an account now that dashboards are role-gated —
  // send people to sign in rather than straight at a protected route.
  const goToVolunteerSignIn = () => navigate('/login');

  if (statsError) return <ErrorState error={statsError} />;

  return (
    <>
      <Hero onDonate={scrollToDonate} onVolunteer={goToVolunteerSignIn} />
      {statsLoading ? <Loader /> : <AboutSection stats={stats} />}
      {breakdownLoading ? <Loader /> : <ImpactSection breakdown={breakdown} />}
      <StorySection />
      {eventsLoading ? <Loader /> : <ProgramsSection ongoing={events.ongoing} upcoming={events.upcoming} />}
      <VolunteerCta onDonate={scrollToDonate} />
      <Footer />
    </>
  );
}
