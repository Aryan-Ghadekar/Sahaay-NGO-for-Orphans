import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDonateModal } from '../../context/DonateModalContext';
import { useAuth } from '../../context/AuthContext';
import { useFetch } from '../../hooks/useFetch';
import { getPrograms } from '../../api/endpoints/publicSite';
import { createDonation } from '../../api/endpoints/donor';
import { imageToDataUrl } from '../../utils/imageToDataUrl';
import './DonateModal.css';

const QUICK_AMOUNTS = [500, 1000, 2500, 5000];

const BANK_DETAILS = [
  { label: 'Account Name', value: 'Sahaay Foundation Trust' },
  { label: 'Bank Name', value: 'State Bank of India' },
  { label: 'Account Number', value: '0000 1234 5678 9012' },
  { label: 'IFSC Code', value: 'SBIN0DEMO01' },
  { label: 'UPI ID', value: 'sahaay@okdemo' },
];

export default function DonateModal() {
  const { isOpen, close } = useDonateModal();
  const { isAuthenticated, role } = useAuth();
  // Only hits the network while the modal is actually open — this
  // component stays mounted at the app root the whole time.
  const { data: programs } = useFetch(() => (isOpen ? getPrograms() : Promise.resolve([])), [isOpen]);

  const [amount, setAmount] = useState(500);
  const [customAmount, setCustomAmount] = useState('');
  const [programId, setProgramId] = useState('');
  const [note, setNote] = useState('');
  const [proofFile, setProofFile] = useState(null);
  const [proofPreview, setProofPreview] = useState(null);
  const [status, setStatus] = useState('idle'); // idle | submitting | done | error
  const [errorMessage, setErrorMessage] = useState('');

  // Reset to a clean form each time the modal opens, so a prior donation's
  // state doesn't linger the next time someone opens it.
  useEffect(() => {
    if (isOpen) {
      setAmount(500);
      setCustomAmount('');
      setProgramId('');
      setNote('');
      setProofFile(null);
      setProofPreview(null);
      setStatus('idle');
      setErrorMessage('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const effectiveAmount = customAmount ? Number(customAmount) : amount;

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setProofFile(file);
    const dataUrl = await imageToDataUrl(file);
    setProofPreview(dataUrl);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!effectiveAmount || effectiveAmount <= 0) {
      setErrorMessage('Enter an amount greater than zero.');
      return;
    }
    setStatus('submitting');
    setErrorMessage('');
    try {
      const proofDataUrl = proofPreview || (proofFile ? await imageToDataUrl(proofFile) : null);
      await createDonation({ programId: programId || null, amount: effectiveAmount, proofDataUrl, note });
      setStatus('done');
    } catch (err) {
      setStatus('error');
      setErrorMessage(err.message || 'Something went wrong — please try again.');
    }
  };

  return (
    <div className="donate-overlay" onMouseDown={close}>
      <div className="donate-modal" onMouseDown={(e) => e.stopPropagation()}>
        <button className="donate-modal__close" onClick={close} aria-label="Close">×</button>

        {!isAuthenticated ? (
          <div className="donate-modal__gate">
            <h2>Log in to donate</h2>
            <p>Create a free donor account (or log in) to make a donation and track its impact.</p>
            <div className="donate-modal__gate-actions">
              <Link className="btn btn-primary" to="/login" onClick={close}>Log in</Link>
              <Link className="btn btn-secondary" to="/signup" onClick={close}>Create an account</Link>
            </div>
          </div>
        ) : status === 'done' ? (
          <div className="donate-modal__gate">
            <h2>Thank you! 🙏</h2>
            <p>
              Your donation of ₹{effectiveAmount.toLocaleString('en-IN')} has been recorded and is
              pending verification. You'll see it in your dashboard once our team confirms the
              payment.
            </p>
            <button className="btn btn-primary" onClick={close}>Done</button>
          </div>
        ) : (
          <div className="donate-modal__grid">
            <form className="donate-form" onSubmit={handleSubmit}>
              <h2 className="donate-modal__title">Make a Donation</h2>
              <p className="donate-modal__subtitle">
                Transfer using the details on the right, then confirm it here.
              </p>

              <div className="field">
                <span>Amount</span>
                <div className="donate-form__amounts">
                  {QUICK_AMOUNTS.map((a) => (
                    <button
                      type="button"
                      key={a}
                      className={`donate-form__amount-chip ${!customAmount && amount === a ? 'is-selected' : ''}`}
                      onClick={() => { setAmount(a); setCustomAmount(''); }}
                    >
                      ₹{a.toLocaleString('en-IN')}
                    </button>
                  ))}
                </div>
                <input
                  className="input"
                  type="number"
                  min="1"
                  placeholder="Custom amount (₹)"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                />
              </div>

              <label className="field">
                <span>Program (optional)</span>
                <select className="input" value={programId} onChange={(e) => setProgramId(e.target.value)}>
                  <option value="">Wherever it's needed most</option>
                  {(programs || []).map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </label>

              <label className="field">
                <span>Upload payment screenshot</span>
                <input className="input" type="file" accept="image/*" onChange={handleFileChange} />
              </label>
              {proofPreview && (
                <img className="donate-form__preview" src={proofPreview} alt="Payment screenshot preview" />
              )}

              <label className="field">
                <span>Note (optional)</span>
                <textarea
                  className="input"
                  rows={2}
                  placeholder="Anything you'd like us to know"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </label>

              {errorMessage && <p className="login-card__error">{errorMessage}</p>}
              {role !== 'donor' && (
                <p className="donate-form__hint">Donations are made from a donor account.</p>
              )}

              <button
                className="btn btn-primary btn-block"
                type="submit"
                disabled={status === 'submitting' || role !== 'donor'}
              >
                {status === 'submitting' ? 'Submitting…' : "I've Made the Payment — Submit"}
              </button>
            </form>

            <aside className="donate-bank">
              <span className="tag tag-outline donate-bank__demo-tag">Demo bank details — for testing only</span>
              <h3 className="donate-bank__title">Pay via Bank Transfer / UPI</h3>
              <dl className="donate-bank__list">
                {BANK_DETAILS.map((d) => (
                  <div className="donate-bank__row" key={d.label}>
                    <dt>{d.label}</dt>
                    <dd>{d.value}</dd>
                  </div>
                ))}
              </dl>
              <div className="donate-bank__qr">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
                  <rect x="3" y="14" width="7" height="7" rx="1" /><path d="M14 14h3v3h-3zM19 14v3M14 19h3v2" />
                </svg>
                <span>Scan to Pay (Demo QR)</span>
              </div>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}
