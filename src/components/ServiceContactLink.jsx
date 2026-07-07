import React from 'react';
import { useContactForm } from '../context/ContactFormContext';

const ServiceContactLink = ({ serviceName, message, source, linkText = 'Send us a message' }) => {
  const { openContactForm } = useContactForm();

  return (
    <section className="py-12 px-6 bg-gray-50 border-t border-gray-100">
      <p className="text-gray-500 text-center text-base max-w-xl mx-auto">
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
