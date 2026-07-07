const FORM_ID = import.meta.env.VITE_FORMSPREE_FORM_ID || 'xlgydrpz';

export async function submitContactForm(payload) {
  try {
    const response = await fetch(`https://formspree.io/f/${FORM_ID}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        name: payload.name,
        email: payload.email,
        phone: payload.phone,
        message: payload.message,
        source: payload.source || 'website',
        _replyto: payload.email,
        _subject: `New inquiry from ${payload.name} — Research Patra`,
      }),
    });

    const data = await response.json().catch(() => ({}));

    if (response.ok) {
      return { success: true };
    }

    const message =
      data.error ||
      (Array.isArray(data.errors) && data.errors[0]?.message) ||
      'Unable to send your message. Please try again.';

    return { success: false, error: message };
  } catch {
    return {
      success: false,
      error: 'Network error. Please check your connection and try again.',
    };
  }
}
