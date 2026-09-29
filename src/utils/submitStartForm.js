import { submitToGoogleForm } from './googleForm';

const FORM_ID = import.meta.env.VITE_FORMSPREE_FORM_ID || 'xlgydrpz';

function notifyFormspree(payload, helpList) {
  fetch(`https://formspree.io/f/${FORM_ID}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      name: payload.name,
      email: payload.email,
      phone: payload.phone,
      help_with: helpList,
      requirement: payload.requirement || '',
      message: payload.requirement || helpList,
      source: payload.source || 'ads-start',
      _replyto: payload.email,
      _subject: `New /start inquiry from ${payload.name} — Research Patra`,
    }),
  }).catch(() => {
    // Fire-and-forget: email notify must never block or fail the UI
  });
}

/**
 * Dual submit: Sheet first (source of truth), Formspree fire-and-forget.
 */
export async function submitStartForm(payload) {
  const helpWith = Array.isArray(payload.helpWith) ? payload.helpWith : [];
  const helpList = [
    ...helpWith,
    payload.helpOther?.trim() ? `Other: ${payload.helpOther.trim()}` : null,
  ]
    .filter(Boolean)
    .join(', ');

  try {
    await submitToGoogleForm(payload);
  } catch {
    return {
      success: false,
      error: 'Unable to save your request. Please try again.',
    };
  }

  notifyFormspree(payload, helpList);
  return { success: true };
}
