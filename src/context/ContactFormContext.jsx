import React, { createContext, useContext, useState, useCallback } from 'react';

const ContactFormContext = createContext(null);

export function ContactFormProvider({ children }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [prefill, setPrefill] = useState({ message: '', source: 'website' });

  const openContactForm = useCallback(({ message = '', source = 'website' } = {}) => {
    setPrefill({ message, source });
    setIsModalOpen(true);
  }, []);

  const closeContactForm = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  return (
    <ContactFormContext.Provider value={{ isModalOpen, prefill, openContactForm, closeContactForm }}>
      {children}
    </ContactFormContext.Provider>
  );
}

export function useContactForm() {
  const ctx = useContext(ContactFormContext);
  if (!ctx) throw new Error('useContactForm must be used within ContactFormProvider');
  return ctx;
}
