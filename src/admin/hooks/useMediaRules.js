import { useEffect, useState } from 'react';
import { cmsApi } from '../api/client';

let cached = null;
let pending = null;

/** Slot pixel rules come from the server so the client checks can never drift from what the API enforces. */
export function useMediaRules() {
  const [rules, setRules] = useState(cached);

  useEffect(() => {
    if (cached) return undefined;
    let alive = true;
    pending ??= cmsApi.mediaRules().finally(() => {
      pending = null;
    });
    pending
      .then((r) => {
        cached = r;
        if (alive) setRules(r);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  return rules;
}

const readDimensions = (file) =>
  new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
      URL.revokeObjectURL(url);
    };
    img.onerror = () => {
      reject(new Error('This file could not be read as an image'));
      URL.revokeObjectURL(url);
    };
    img.src = url;
  });

/** Same checks the server runs, done first for instant feedback. Resolves with dimensions or throws a readable error. */
export async function checkImageFile(file, slot, rules) {
  const rule = rules.slots[slot];
  if (!rules.types.includes(file.type)) throw new Error('Only JPEG, PNG or WebP images are allowed');
  if (file.size > rules.maxBytes) {
    throw new Error(`Image is ${Math.round(file.size / 1024)} KB; the limit is ${Math.round(rules.maxBytes / 1024)} KB`);
  }
  const { width, height } = await readDimensions(file);
  if (width < rule.minWidth || height < rule.minHeight) {
    throw new Error(`${rule.label} image must be at least ${rule.minWidth}×${rule.minHeight}px (this one is ${width}×${height})`);
  }
  if (rule.ratio && Math.abs(width / height - rule.ratio) / rule.ratio > 0.02) {
    throw new Error(`${rule.label} image must be ${rule.ratioLabel} (this one is ${width}×${height})`);
  }
  return { width, height };
}

export const slotHint = (rule, maxBytes) =>
  `${rule.ratioLabel === 'any' ? 'Any ratio' : rule.ratioLabel}, at least ${rule.minWidth}×${rule.minHeight}px, max ${Math.round(maxBytes / 1024)} KB. JPEG, PNG or WebP.`;
