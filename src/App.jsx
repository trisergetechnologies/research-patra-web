import React from 'react';
import Chatbot from './Chatbot';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ContactFormProvider } from './context/ContactFormContext';
import { ChatbotProvider } from './context/ChatbotContext';

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

function AppLayout() {
  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-white font-sans text-[#0F172A] flex flex-col">
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
        </Routes>
      </main>
      <Footer />
      <ContactFormModal />
      <HelpPopup />
      <Chatbot />
    </div>
  );
}

function App() {
  return (
    <Router>
      <ScrollToTop />
      <ContactFormProvider>
        <ChatbotProvider>
          <AppLayout />
        </ChatbotProvider>
      </ContactFormProvider>
    </Router>
  );
}

export default App;
