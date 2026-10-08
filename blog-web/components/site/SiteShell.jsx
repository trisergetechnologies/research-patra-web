'use client';

import dynamic from 'next/dynamic';
import { ThemeProvider } from './ThemeContext';
import { ContactFormProvider } from './ContactFormContext';
import { ChatbotProvider } from './ChatbotContext';
import Navbar from './Navbar';

// Floating widgets aren't needed to read an article, so they load after the page is interactive.
const ContactFormModal = dynamic(() => import('./ContactFormModal'), { ssr: false });
const HelpPopup = dynamic(() => import('./HelpPopup'), { ssr: false });
const Chatbot = dynamic(() => import('./Chatbot'), { ssr: false });
const SearchPalette = dynamic(() => import('../journal/SearchPalette'), { ssr: false });

// Server-rendered page content and footer pass through as children/props, so they stay out of the client bundle.
export default function SiteShell({ children, footer }) {
  return (
    <ThemeProvider>
      <ContactFormProvider>
        <ChatbotProvider>
          <div className="min-h-screen w-full overflow-x-clip bg-page font-sans text-body flex flex-col">
            <a href="#main" className="skip-link">Skip to content</a>
            <Navbar />
            <main id="main" tabIndex={-1} className="flex-grow outline-none">{children}</main>
            {footer}
            <div data-print-hide>
              <ContactFormModal />
              <HelpPopup />
              <Chatbot />
              <SearchPalette />
            </div>
          </div>
        </ChatbotProvider>
      </ContactFormProvider>
    </ThemeProvider>
  );
}
