import { useState } from 'react';
import { Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { HELP_OPTIONS } from '../utils/googleForm';
import { submitStartForm } from '../utils/submitStartForm';

const emptyFields = {
  name: '',
  email: '',
  phone: '',
  helpWith: [],
  helpOther: '',
  requirement: '',
};

export default function StartIntakeForm({ source = 'ads-start', onSuccess }) {
  const [fields, setFields] = useState(emptyFields);
  const [otherChecked, setOtherChecked] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const inputClass =
    'w-full min-h-12 px-4 py-3 rounded-xl border border-slate-300 dark:border-white/10 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-[#F97316] focus:ring-2 focus:ring-orange-100 dark:focus:ring-orange-900/40 transition-all text-base sm:text-sm bg-white dark:bg-[#0B1220]';
  const labelClass = 'text-sm font-semibold text-slate-900 dark:text-slate-100 mb-1.5 block';

  const handleChange = (e) => {
    setError('');
    setFields((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const toggleHelp = (option) => {
    setError('');
    setFields((prev) => {
      const exists = prev.helpWith.includes(option);
      return {
        ...prev,
        helpWith: exists
          ? prev.helpWith.filter((v) => v !== option)
          : [...prev.helpWith, option],
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (fields.helpWith.length === 0 && !otherChecked) {
      setError('Please select at least one option for what you need help with.');
      return;
    }
    if (otherChecked && !fields.helpOther.trim()) {
      setError('Please describe the other type of help you need.');
      return;
    }

    setSubmitting(true);
    setError('');
    const result = await submitStartForm({
      ...fields,
      helpOther: otherChecked ? fields.helpOther : '',
      source,
    });
    setSubmitting(false);

    if (result.success) {
      setSuccess(true);
      onSuccess?.();
      window.gtag?.('event', 'conversion', {
        send_to: 'AW-18407288038/0nAECPrP2oodEObZo8lE',
      });
      return;
    } else {
      setError(result.error || 'Something went wrong. Please try again.');
    }
  };

  if (success) {
    return (
      <div className="text-center py-10">
        <CheckCircle2 size={48} className="text-[#F97316] mx-auto mb-4" />
        <p className="text-lg font-bold text-body">Thank you! We&apos;ll get back to you soon.</p>
        <p className="text-sm mt-2 text-muted">We usually reply within a few hours.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="start-name" className={labelClass}>
            Name <span className="text-[#F97316]">*</span>
          </label>
          <input
            id="start-name"
            name="name"
            type="text"
            required
            value={fields.name}
            onChange={handleChange}
            placeholder="Your full name"
            className={inputClass}
            autoComplete="name"
          />
        </div>
        <div>
          <label htmlFor="start-email" className={labelClass}>
            Email <span className="text-[#F97316]">*</span>
          </label>
          <input
            id="start-email"
            name="email"
            type="email"
            inputMode="email"
            required
            value={fields.email}
            onChange={handleChange}
            placeholder="you@email.com"
            className={inputClass}
            autoComplete="email"
          />
        </div>
      </div>

      <div>
        <label htmlFor="start-phone" className={labelClass}>
          Phone number <span className="text-[#F97316]">*</span>
        </label>
        <input
          id="start-phone"
          name="phone"
          type="tel"
          inputMode="tel"
          required
          value={fields.phone}
          onChange={handleChange}
          placeholder="+91 ..."
          className={inputClass}
          autoComplete="tel"
        />
      </div>

      <fieldset>
        <legend className={`${labelClass} mb-2.5`}>
          What do you need help with? <span className="text-[#F97316]">*</span>
        </legend>
        <div className="grid sm:grid-cols-2 gap-2">
          {HELP_OPTIONS.map((option) => {
            const checked = fields.helpWith.includes(option);
            return (
              <label
                key={option}
                className={`flex items-start gap-2.5 rounded-xl border px-3 py-3 min-h-11 cursor-pointer transition-all text-sm ${
                  checked
                    ? 'border-[#F97316] bg-orange-50 dark:bg-badge text-body'
                    : 'border-slate-300 dark:border-white/10 bg-white dark:bg-[#0B1220] text-body hover:border-orange-200'
                }`}
              >
                <input
                  type="checkbox"
                  className="mt-0.5 rounded border-gray-300 text-[#F97316] focus:ring-[#F97316]"
                  checked={checked}
                  onChange={() => toggleHelp(option)}
                />
                <span className="font-medium leading-snug">{option}</span>
              </label>
            );
          })}
          <label
            className={`flex flex-col gap-2 rounded-xl border px-3 py-2.5 cursor-pointer transition-all text-sm sm:col-span-2 ${
              otherChecked
                ? 'border-[#F97316] bg-orange-50 dark:bg-badge'
                : 'border-slate-300 dark:border-white/10 bg-white dark:bg-[#0B1220] hover:border-orange-200'
            }`}
          >
            <span className="flex items-center gap-2.5">
              <input
                type="checkbox"
                className="rounded border-gray-300 text-[#F97316] focus:ring-[#F97316]"
                checked={otherChecked}
                onChange={(e) => {
                  setError('');
                  setOtherChecked(e.target.checked);
                  if (!e.target.checked) {
                    setFields((prev) => ({ ...prev, helpOther: '' }));
                  }
                }}
              />
              <span className="font-medium">Other</span>
            </span>
            {otherChecked && (
              <input
                type="text"
                name="helpOther"
                value={fields.helpOther}
                onChange={handleChange}
                placeholder="Please specify"
                className={inputClass}
              />
            )}
          </label>
        </div>
      </fieldset>

      <div>
        <label htmlFor="start-requirement" className={labelClass}>
          Tell us briefly about your requirement
        </label>
        <textarea
          id="start-requirement"
          name="requirement"
          rows={4}
          value={fields.requirement}
          onChange={handleChange}
          placeholder="Program, deadline, university guidelines, or anything we should know…"
          className={`${inputClass} resize-none`}
        />
      </div>

      {error && (
        <div
          className="flex items-start gap-2 text-sm rounded-xl px-4 py-3 bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-200 border border-red-100 dark:border-red-900"
          role="alert"
        >
          <AlertCircle size={18} className="shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="w-full min-h-12 px-8 py-3.5 bg-[#F97316] text-white rounded-full font-bold shadow-[0_8px_20px_rgb(249,115,22,0.35)] hover:bg-[#EA580C] hover:-translate-y-0.5 active:scale-[0.99] disabled:opacity-60 disabled:hover:translate-y-0 transition-all flex items-center justify-center gap-2"
      >
        <Send size={18} />
        {submitting ? 'Sending...' : 'Submit request'}
      </button>
    </form>
  );
}
