import React, { useState, useEffect, useCallback } from 'react';
import { X, HelpCircle, Send } from 'lucide-react';
import { useContactForm } from '../context/ContactFormContext';
import { useChatbot } from '../context/ChatbotContext';
import { BOT_NAME } from '../data/chatbotKnowledge';

const POPUP_A = {
  key: 'popup_a_seen',
  message: 'Have questions about our research writing services?',
};

const POPUP_B = {
  key: 'popup_b_seen',
  message: 'Need guidance on your thesis or research paper?',
};

const HelpPopup = () => {
  const [activePopup, setActivePopup] = useState(null);
  const { openContactForm } = useContactForm();
  const { openChatbot } = useChatbot();

  const dismiss = useCallback((key) => {
    sessionStorage.setItem(key, '1');
    setActivePopup(null);
  }, []);

  const tryShow = useCallback((popup) => {
    if (sessionStorage.getItem(popup.key)) return false;
    setActivePopup(popup);
    return true;
  }, []);

  useEffect(() => {
    const timerA = setTimeout(() => {
      if (!sessionStorage.getItem(POPUP_A.key)) tryShow(POPUP_A);
    }, 20000);

    return () => clearTimeout(timerA);
  }, [tryShow]);

  useEffect(() => {
    const handleExit = (e) => {
      if (e.clientY <= 0 && !sessionStorage.getItem(POPUP_B.key)) {
        if (activePopup) return;
        tryShow(POPUP_B);
      }
    };

    const fallbackB = setTimeout(() => {
      if (!sessionStorage.getItem(POPUP_B.key) && !activePopup) {
        tryShow(POPUP_B);
      }
    }, 45000);

    document.addEventListener('mouseout', handleExit);
    return () => {
      document.removeEventListener('mouseout', handleExit);
      clearTimeout(fallbackB);
    };
  }, [activePopup, tryShow]);

  if (!activePopup) return null;

  return (
    <div className="fixed bottom-20 sm:bottom-24 left-1/2 -translate-x-1/2 sm:left-auto sm:translate-x-0 sm:right-24 z-[60] w-[calc(100%-2rem)] max-w-sm animate-slide-up">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-5 relative">
        <button
          onClick={() => dismiss(activePopup.key)}
          className="absolute top-3 right-3 p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
          aria-label="Dismiss"
        >
          <X size={18} />
        </button>
        <p className="text-[#0F172A] font-bold text-base pr-6 mb-4 leading-snug">{activePopup.message}</p>
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={() => { dismiss(activePopup.key); openChatbot(); }}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#0F172A] text-white rounded-full text-sm font-bold hover:bg-slate-800 transition-colors"
          >
            <HelpCircle size={16} /> Ask {BOT_NAME}
          </button>
          <button
            onClick={() => { dismiss(activePopup.key); openContactForm({ source: 'popup' }); }}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#F97316] text-white rounded-full text-sm font-bold hover:bg-[#EA580C] transition-colors"
          >
            <Send size={16} /> Send a Message
          </button>
        </div>
      </div>
    </div>
  );
};

export default HelpPopup;
