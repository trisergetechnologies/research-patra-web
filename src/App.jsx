import React, { lazy, Suspense } from 'react';
import Chatbot from './Chatbot';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ContactFormProvider } from './context/ContactFormContext';
import { ChatbotProvider } from './context/ChatbotContext';
import { ThemeProvider } from './context/ThemeContext';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import ContactFormModal from './components/ContactFormModal';
import HelpPopup from './components/HelpPopup';

import Home from './pages/Home';
import ServicesPage from './pages/ServicesPage';
import About from './pages/About';

import TopicSelection from './pages/TopicSelection';
import Synopsis from './pages/Synopsis';
import ThesisWriting from './pages/ThesisWriting';
import ResearchPapers from './pages/ResearchPapers';
import SystematicReview from './pages/SystematicReview';
import StatisticalAnalysis from './pages/StatisticalAnalysis';
import EditingProofreading from './pages/EditingProofreading';

import ScopusPublication from './pages/publications/ScopusPublication';
import SciJournal from './pages/publications/SciJournal';
import UgcPublication from './pages/publications/UgcPublication';

import HowWeWork from './pages/HowWeWork';
import ResearchAreas from './pages/ResearchAreas';
import EthicalApproach from './pages/EthicalApproach';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsAndConditions from './pages/TermsAndConditions';
import BibliometricAnalysis from './pages/BibliometricAnalysis';
import PatentSupport from './pages/PatentSupport';
import NotFound from './pages/NotFound';
const AdminApp = lazy(() => import('./admin/AdminApp'));
// /blog is a separate Next.js app (blog-web/), reached through the Vercel rewrite and the Vite dev proxy.
// Ads landing is public/start.html, served at /start so Google can see a real <form>.
// Re-enable by importing ./pages/Start and routing /start to it.
// import Start from './pages/Start';

function AppLayout() {
  return (
    <div className="min-h-screen w-full overflow-x-clip bg-page font-sans text-body flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/about" element={<About />} />
          <Route path="/topic-selection" element={<TopicSelection />} />
          <Route path="/synopsis" element={<Synopsis />} />
          <Route path="/thesis-writing" element={<ThesisWriting />} />
          <Route path="/research-papers" element={<ResearchPapers />} />
          <Route path="/systematic-review" element={<SystematicReview />} />
          <Route path="/statistical-analysis" element={<StatisticalAnalysis />} />
          <Route path="/bibliometric-analysis" element={<BibliometricAnalysis />} />
          <Route path="/patent-support" element={<PatentSupport />} />
          <Route path="/editing-proofreading" element={<EditingProofreading />} />
          <Route path="/scopus-publication" element={<ScopusPublication />} />
          <Route path="/sci-journal-publication" element={<SciJournal />} />
          <Route path="/ugc-publication" element={<UgcPublication />} />
          <Route path="/how-we-work" element={<HowWeWork />} />
          <Route path="/research-areas" element={<ResearchAreas />} />
          <Route path="/ethical-approach" element={<EthicalApproach />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
      <ContactFormModal />
      <HelpPopup />
      <Chatbot />
    </div>
  );
}

function SiteShell() {
  return (
    <ContactFormProvider>
      <ChatbotProvider>
        <AppLayout />
      </ChatbotProvider>
    </ContactFormProvider>
  );
}

function App() {
  return (
    <Router>
      <ScrollToTop />
      <ThemeProvider>
        <Routes>
          <Route
            path="/admin/*"
            element={
              <Suspense fallback={null}>
                <AdminApp />
              </Suspense>
            }
          />
          <Route path="*" element={<SiteShell />} />
        </Routes>
      </ThemeProvider>
    </Router>
  );
}

export default App;
