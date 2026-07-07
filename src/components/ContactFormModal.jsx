import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { useContactForm } from '../context/ContactFormContext';
import ContactForm from './ContactForm';

const ContactFormModal = () => {
  const { isModalOpen, prefill, closeContactForm } = useContactForm();

  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isModalOpen]);

  if (!isModalOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-black/40" onClick={closeContactForm} aria-hidden="true" />
      <div className="relative bg-white rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 sm:p-8 z-10">
        <button
          onClick={closeContactForm}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-500"
          aria-label="Close"
        >
          <X size={20} />
        </button>
        <h2 className="text-2xl font-extrabold text-[#0F172A] mb-1 pr-8">Send a Message</h2>
        <p className="text-gray-500 text-sm mb-6">Tell us about your project and we'll get back to you soon.</p>
        <ContactForm
          key={`${prefill.message}-${prefill.source}`}
          source={prefill.source}
          initialMessage={prefill.message}
          variant="modal"
          onSuccess={() => setTimeout(closeContactForm, 2500)}
        />
      </div>
    </div>
  );
};

export default ContactFormModal;
