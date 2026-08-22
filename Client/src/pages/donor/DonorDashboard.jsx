import Reveal from '../../components/common/Reveal';
import StatCard from '../../components/common/StatCard';
import ImpactFlow from '../../components/sections/ImpactFlow';
import { Loader } from '../../components/common/AsyncState';
import { useFetch } from '../../hooks/useFetch';
import { getDonorSummary, getDonationHistory, getImpactFlow } from '../../api/endpoints/donor';
import './DonorDashboard.css';

export default function DonorDashboard() {
  const { data: summary, loading: summaryLoading } = useFetch(getDonorSummary, []);
  const { data: donations, loading: donationsLoading } = useFetch(getDonationHistory, []);
  const { data: flow, loading: flowLoading } = useFetch(getImpactFlow, []);

  return (
    <div className="donor-dashboard container">
      <Reveal>
        <p className="section-kicker">Your Dashboard</p>
        <h2 className="section-title">My Donor Dashboard</h2>
      </Reveal>

      {summaryLoading ? <Loader /> : (
        <Reveal delay={60} className="donor-dashboard__stats">
          <StatCard value={summary.totalDonated} label="Total Donated" />
          <StatCard value={summary.donationCount} label="Number of Donations" />
          <StatCard value={summary.programsSupported} label="Programs Supported" />
          <StatCard value={summary.studentsImpacted} label="Students Impacted" />
        </Reveal>
      )}

      <Reveal delay={120}>
        <h3 className="donor-dashboard__heading">Donation History</h3>
        {donationsLoading ? <Loader /> : (
          <table className="table donor-dashboard__table">
            <thead>
              <tr><th>Donation</th><th>Program</th><th>Date</th><th>Status</th></tr>
            </thead>
            <tbody>
              {donations.map((d) => (
                <tr key={d.id}>
                  <td>{d.amount}</td>
                  <td>{d.program}</td>
                  <td>{d.date}</td>
                  <td><span className={`tag ${d.status === 'Used' ? 'tag-sage' : 'tag-outline'}`}>{d.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Reveal>

      {!flowLoading && (
        <Reveal delay={180}>
          <h3 className="donor-dashboard__heading">Impact of Your {flow.steps[0].value} Donation</h3>
          <ImpactFlow steps={flow.steps} />
          <div className="card donor-dashboard__note">
            <p>{flow.note}</p>
          </div>
        </Reveal>
      )}
    </div>
  );
}
