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
  const { isModalOpen, openContactForm } = useContactForm();
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

  if (!activePopup || isModalOpen) return null;

  return (
    <div
      className="fixed z-[55] animate-slide-up
        left-4 right-[4.75rem] bottom-[5.25rem]
        sm:left-auto sm:right-24 sm:bottom-24 sm:w-[min(100%,20rem)]
        md:right-28 md:bottom-28"
      role="dialog"
      aria-live="polite"
    >
      <div
        className="relative rounded-2xl p-4 sm:p-5
          bg-white dark:bg-[#1e293b]
          border-2 border-slate-200 dark:border-slate-500
          shadow-[0_16px_48px_rgba(15,23,42,0.28)] dark:shadow-[0_16px_48px_rgba(0,0,0,0.65)]
          text-slate-900 dark:text-white"
      >
        <button
          onClick={() => dismiss(activePopup.key)}
          className="absolute top-2.5 right-2.5 sm:top-3 sm:right-3 p-1.5 text-gray-500 dark:text-slate-300 hover:text-[#0F172A] dark:hover:text-white rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
          aria-label="Dismiss"
        >
          <X size={18} />
        </button>
        <p className="text-[#0F172A] dark:text-white font-bold text-sm sm:text-base pr-8 mb-3 sm:mb-4 leading-snug">
          {activePopup.message}
        </p>
        <div className="flex flex-col gap-2">
          <button
            onClick={() => { dismiss(activePopup.key); openChatbot(); }}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-full text-sm font-bold transition-colors
              bg-[#0F172A] text-white hover:bg-slate-800
              dark:bg-white dark:text-[#0F172A] dark:hover:bg-slate-100"
          >
            <HelpCircle size={16} className="shrink-0" />
            Ask {BOT_NAME}
          </button>
          <button
            onClick={() => { dismiss(activePopup.key); openContactForm({ source: 'popup' }); }}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#F97316] text-white rounded-full text-sm font-bold hover:bg-[#EA580C] transition-colors"
          >
            <Send size={16} className="shrink-0" />
            Send a Message
          </button>
        </div>
      </div>
    </div>
  );
};

export default HelpPopup;
