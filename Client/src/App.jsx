import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { DonateModalProvider } from './context/DonateModalContext';
import Header from './components/layout/Header';
import AppRoutes from './routes/AppRoutes';
import DonateModal from './components/donate/DonateModal';

export default function App() {
  return (
    <AuthProvider>
      <DonateModalProvider>
        <BrowserRouter>
          <Header />
          <AppRoutes />
          <DonateModal />
        </BrowserRouter>
      </DonateModalProvider>
    </AuthProvider>
  );
}
