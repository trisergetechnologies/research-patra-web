import React from 'react';
import { useContactForm } from '../context/ContactFormContext';

const ServiceContactLink = ({ serviceName, message, source, linkText = 'Send us a message' }) => {
  const { openContactForm } = useContactForm();

  return (
    <section className="py-12 px-6 bg-soft border-t border-theme">
      <p className="text-muted text-center text-base max-w-xl mx-auto">
        Need help with {serviceName}?{' '}
        <button
          type="button"
          onClick={() => openContactForm({ message: message || `I need help with ${serviceName}.`, source })}
          className="text-[#F97316] font-bold hover:underline"
        >
          {linkText}
        </button>
      </p>
    </section>
  );
};

export default ServiceContactLink;
