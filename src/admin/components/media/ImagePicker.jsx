import React, { useState } from 'react';
import { ImagePlus, RefreshCw, Trash2 } from 'lucide-react';
import InfoTip from '../ui/InfoTip';
import { slotHint, useMediaRules } from '../../hooks/useMediaRules';
import MediaLibraryModal from './MediaLibraryModal';

const ASPECT = { cover: 'aspect-video', og: 'aspect-[1.91/1]', avatar: 'aspect-square w-32', inline: 'aspect-video' };

/** Preview frame at the slot's exact ratio, so what you see is how the blog will crop it. */
export default function ImagePicker({ slot, value, onChange, label, info, disabled }) {
  const [open, setOpen] = useState(false);
  const rules = useMediaRules();
  const rule = rules?.slots[slot];

  return (
    <div>
      {label && (
        <span className="admin-label">
          {label}
          <InfoTip>
            {info ? `${info} ` : ''}
            {rule ? slotHint(rule, rules.maxBytes) : ''}
          </InfoTip>
        </span>
      )}
      {value ? (
        <div className={`group relative overflow-hidden rounded-lg border border-theme bg-soft ${ASPECT[slot]}`}>
          <img src={value.thumbUrl || value.url} alt={value.alt} className="absolute inset-0 w-full h-full object-cover" />
          {!disabled && (
            <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
              <button type="button" onClick={() => setOpen(true)} className="rounded-lg bg-white/90 px-2.5 py-1.5 text-xs font-medium text-gray-900 inline-flex items-center gap-1">
                <RefreshCw className="w-3.5 h-3.5" /> Replace
              </button>
              <button type="button" onClick={() => onChange(null)} className="rounded-lg bg-white/90 px-2.5 py-1.5 text-xs font-medium text-red-600 inline-flex items-center gap-1">
                <Trash2 className="w-3.5 h-3.5" /> Remove
              </button>
            </div>
          )}
        </div>
      ) : (
        <button
          type="button"
          disabled={disabled}
          onClick={() => setOpen(true)}
          className={`w-full flex flex-col items-center justify-center gap-1.5 rounded-lg border-2 border-dashed border-theme text-muted hover:bg-soft hover:text-body disabled:opacity-60 disabled:cursor-not-allowed ${ASPECT[slot]}`}
        >
          <ImagePlus className="w-5 h-5" />
          <span className="text-xs font-medium">Add image</span>
        </button>
      )}
      <MediaLibraryModal open={open} onClose={() => setOpen(false)} slot={slot} onSelect={onChange} title={label ? `Choose ${label.toLowerCase()}` : undefined} />
    </div>
  );
}
