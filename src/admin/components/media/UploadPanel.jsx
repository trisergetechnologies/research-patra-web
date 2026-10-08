import React, { useEffect, useRef, useState } from 'react';
import { ImagePlus, Loader2, UploadCloud, X } from 'lucide-react';
import { cmsApi, errorMessage } from '../../api/client';
import { checkImageFile, slotHint, useMediaRules } from '../../hooks/useMediaRules';
import InfoTip from '../ui/InfoTip';

/** Drop zone + alt text + progress. Validates locally before sending anything. */
export default function UploadPanel({ slot: fixedSlot, onUploaded }) {
  const rules = useMediaRules();
  const [slot, setSlot] = useState(fixedSlot || 'cover');
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [dims, setDims] = useState(null);
  const [alt, setAlt] = useState('');
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(null);
  const [drag, setDrag] = useState(false);
  const input = useRef(null);

  useEffect(() => () => preview && URL.revokeObjectURL(preview), [preview]);

  const reset = () => {
    setFile(null);
    setPreview(null);
    setDims(null);
    setAlt('');
    setProgress(null);
    if (input.current) input.current.value = '';
  };

  const pick = async (f, forSlot = slot) => {
    if (!f || !rules) return;
    setError('');
    try {
      const d = await checkImageFile(f, forSlot, rules);
      setFile(f);
      setDims(d);
      setPreview(URL.createObjectURL(f));
      if (!alt) setAlt(f.name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ').slice(0, 200));
    } catch (err) {
      reset();
      setError(err.message);
    }
  };

  const changeSlot = (s) => {
    setSlot(s);
    if (file) pick(file, s);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!file || !alt.trim()) return;
    setError('');
    setProgress(0);
    try {
      const { media } = await cmsApi.uploadMedia({ file, slot, alt: alt.trim() }, setProgress);
      reset();
      onUploaded?.(media);
    } catch (err) {
      setProgress(null);
      setError(errorMessage(err));
    }
  };

  if (!rules) {
    return (
      <div className="py-10 flex justify-center">
        <Loader2 className="w-5 h-5 animate-spin text-muted" />
      </div>
    );
  }
  const rule = rules.slots[slot];

  return (
    <form onSubmit={submit} className="space-y-4">
      {!rules.configured && (
        <p className="rounded-lg bg-amber-500/10 px-3 py-2 text-sm text-amber-700 dark:text-amber-400">
          Image uploads are not configured on the server yet.
        </p>
      )}
      {!fixedSlot && (
        <div>
          <span className="admin-label">Used for</span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {Object.entries(rules.slots).map(([key, r]) => (
              <button
                key={key}
                type="button"
                onClick={() => changeSlot(key)}
                className={`rounded-lg border px-3 py-2 text-left text-sm transition-colors ${
                  slot === key ? 'border-primaryGreen bg-primaryGreen/5 text-body' : 'border-theme text-muted hover:bg-soft'
                }`}
              >
                <span className="block font-medium">{r.label}</span>
                <span className="text-xs">{r.ratioLabel === 'any' ? 'any ratio' : r.ratioLabel}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {!file ? (
        <button
          type="button"
          onClick={() => input.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDrag(true);
          }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDrag(false);
            pick(e.dataTransfer.files?.[0]);
          }}
          className={`w-full rounded-xl border-2 border-dashed px-6 py-10 flex flex-col items-center gap-2 text-center transition-colors ${
            drag ? 'border-primaryGreen bg-primaryGreen/5' : 'border-theme hover:bg-soft'
          }`}
        >
          <UploadCloud className="w-7 h-7 text-muted" />
          <span className="text-sm font-medium">Drop an image or click to browse</span>
          <span className="text-xs text-muted">{slotHint(rule, rules.maxBytes)}</span>
        </button>
      ) : (
        <div className="flex gap-4 items-start">
          <div className="relative w-40 shrink-0 overflow-hidden rounded-lg border border-theme bg-soft">
            <img src={preview} alt="" className="w-full h-auto block" />
            <button type="button" onClick={reset} className="absolute top-1.5 right-1.5 rounded-full bg-black/60 p-1 text-white" aria-label="Remove file">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="text-xs text-muted space-y-0.5 min-w-0">
            <p className="text-sm text-body font-medium truncate">{file.name}</p>
            <p>
              {dims.width}×{dims.height}px · {Math.round(file.size / 1024)} KB
            </p>
          </div>
        </div>
      )}
      <input
        ref={input}
        type="file"
        accept={rules.types.join(',')}
        className="hidden"
        onChange={(e) => pick(e.target.files?.[0])}
      />

      <div>
        <label className="admin-label" htmlFor="upload-alt">
          Alt text
          <InfoTip>Describes the image for screen readers and search engines. Say what it shows, not "image of".</InfoTip>
        </label>
        <input id="upload-alt" className="admin-input" value={alt} maxLength={200} onChange={(e) => setAlt(e.target.value)} placeholder="What does the image show?" />
      </div>

      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

      {progress !== null && (
        <div className="h-1.5 w-full rounded-full bg-soft overflow-hidden">
          <div className="h-full bg-primaryGreen transition-all" style={{ width: `${progress}%` }} />
        </div>
      )}

      <div className="flex justify-end">
        <button type="submit" className="admin-btn-primary" disabled={!file || !alt.trim() || progress !== null || !rules.configured}>
          {progress !== null ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImagePlus className="w-4 h-4" />}
          {progress !== null ? (progress < 100 ? `Uploading ${progress}%` : 'Processing…') : 'Upload'}
        </button>
      </div>
    </form>
  );
}
