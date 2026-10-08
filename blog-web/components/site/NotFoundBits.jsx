'use client';

import { usePathname } from 'next/navigation';
import { BookOpen } from 'lucide-react';
import { useContactForm } from './ContactFormContext';
import { BASE_PATH } from '@/lib/site';

export function MissingPath() {
  const pathname = usePathname() || '/';
  return <p className="text-sm text-muted font-mono mb-10 break-all">{`${BASE_PATH}${pathname === '/' ? '' : pathname}`}</p>;
}

export function ExpertButton() {
  const { openContactForm } = useContactForm();
  return (
    <button
      type="button"
      onClick={() => openContactForm({ source: '404' })}
      className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full border-2 border-[#F97316] text-[#F97316] font-bold hover:bg-[#F97316] hover:text-white transition-all"
    >
      <BookOpen size={18} /> Talk to an Expert
    </button>
  );
}
