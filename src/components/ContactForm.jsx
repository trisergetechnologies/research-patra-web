import React, { useState, useEffect } from 'react';
import { Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { submitContactForm } from '../utils/submitContactForm';

const emptyFields = { name: '', email: '', phone: '', message: '' };

const ContactForm = ({ source = 'website', initialMessage = '', variant = 'footer', onSuccess }) => {
  const [fields, setFields] = useState(emptyFields);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialMessage) {
      setFields((prev) => ({ ...prev, message: initialMessage }));
    }
  }, [initialMessage]);

  const handleChange = (e) => {
    setError('');
    setFields((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    const result = await submitContactForm({ ...fields, source });
    setSubmitting(false);
    if (result.success) {
      setSuccess(true);
      setFields(emptyFields);
      onSuccess?.();
    } else {
      setError(result.error || 'Something went wrong. Please try again.');
    }
  };

  const isFooter = variant === 'footer';

  if (success) {
    return (
      <div
        className={`text-center py-8 ${
          isFooter ? 'bg-slate-800/50 rounded-2xl border border-slate-700' : ''
        }`}
      >
        <CheckCircle2 size={48} className="text-[#F97316] mx-auto mb-4" />
        <p className={`text-lg font-bold ${isFooter ? 'text-white' : 'text-[#0F172A]'}`}>
          Thank you! We'll get back to you soon.
        </p>
        <p className={`text-sm mt-2 ${isFooter ? 'text-gray-400' : 'text-gray-500'}`}>
          We usually reply within a few hours.
        </p>
      </div>
    );
  }

  const inputClass = isFooter
    ? 'w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-gray-500 focus:outline-none focus:border-[#F97316] focus:ring-1 focus:ring-[#F97316] transition-all text-sm'
    : 'w-full px-4 py-3 rounded-xl border border-gray-200 text-[#0F172A] placeholder-gray-400 focus:outline-none focus:border-[#F97316] focus:ring-2 focus:ring-orange-100 transition-all text-sm';
  const labelClass = isFooter
    ? 'text-sm font-semibold text-gray-300 mb-1.5 block'
    : 'text-sm font-semibold text-gray-700 mb-1.5 block';

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor={`${variant}-name`} className={labelClass}>Name</label>
          <input
            id={`${variant}-name`}
            name="name"
            type="text"
            required
            value={fields.name}
            onChange={handleChange}
            placeholder="Your full name"
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor={`${variant}-email`} className={labelClass}>Email</label>
          <input
            id={`${variant}-email`}
            name="email"
            type="email"
            required
            value={fields.email}
            onChange={handleChange}
            placeholder="you@email.com"
            className={inputClass}
          />
        </div>
      </div>
      <div>
        <label htmlFor={`${variant}-phone`} className={labelClass}>Phone</label>
        <input
          id={`${variant}-phone`}
          name="phone"
          type="tel"
          required
          value={fields.phone}
          onChange={handleChange}
          placeholder="+91 ..."
          className={inputClass}
        />
      </div>
      <div>
        <label htmlFor={`${variant}-message`} className={labelClass}>Message</label>
        <textarea
          id={`${variant}-message`}
          name="message"
          required
          rows={3}
          value={fields.message}
          onChange={handleChange}
          placeholder="Tell us what you need help with..."
          className={`${inputClass} resize-none`}
        />
      </div>
      {error && (
        <div
          className={`flex items-start gap-2 text-sm rounded-xl px-4 py-3 ${
            isFooter ? 'bg-red-950/40 text-red-200 border border-red-900' : 'bg-red-50 text-red-700 border border-red-100'
          }`}
          role="alert"
        >
          <AlertCircle size={18} className="shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}
      <button
        type="submit"
        disabled={submitting}
        className="w-full sm:w-auto px-8 py-3.5 bg-[#F97316] text-white rounded-full font-bold shadow-[0_8px_20px_rgb(249,115,22,0.35)] hover:bg-[#EA580C] disabled:opacity-60 transition-all flex items-center justify-center gap-2"
      >
        <Send size={18} />
        {submitting ? 'Sending...' : 'Send Message'}
      </button>
    </form>
  );
};

export default ContactForm;
