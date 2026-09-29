/** Research Patra Google Form → linked Sheet */
export const GOOGLE_FORM = {
  action:
    'https://docs.google.com/forms/d/e/1FAIpQLSf8fG6-Rf7awOTcvxwEe4_BGI7TFDjMPzcCSy8RiL2ba3G-JQ/formResponse',
  entries: {
    name: 'entry.2005620554',
    email: 'entry.1045781291',
    phone: 'entry.1166974658',
    helpWith: 'entry.1065046570',
    requirement: 'entry.839337160',
  },
};

export const HELP_OPTIONS = [
  'Research Paper Writing',
  'Thesis / Dissertation',
  'Complete Research Support',
  'Journal Publication Support',
  'Research Methodology',
  'Data Analysis',
];

/**
 * Posts to Google Forms (updates the linked Sheet) via a hidden iframe
 * so the browser is not blocked by CORS.
 */
export function submitToGoogleForm(payload) {
  return new Promise((resolve) => {
    const iframeName = `gform_iframe_${Date.now()}`;
    const iframe = document.createElement('iframe');
    iframe.name = iframeName;
    iframe.title = 'Google Form submit';
    iframe.style.cssText = 'position:absolute;width:0;height:0;border:0;visibility:hidden';
    document.body.appendChild(iframe);

    const form = document.createElement('form');
    form.method = 'POST';
    form.action = GOOGLE_FORM.action;
    form.target = iframeName;
    form.acceptCharset = 'UTF-8';
    form.style.display = 'none';

    const add = (name, value) => {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = name;
      input.value = value ?? '';
      form.appendChild(input);
    };

    const { entries } = GOOGLE_FORM;
    add(entries.name, payload.name);
    add(entries.email, payload.email);
    add(entries.phone, payload.phone);
    add(entries.requirement, payload.requirement || '');

    const selected = Array.isArray(payload.helpWith) ? payload.helpWith : [];
    selected.forEach((value) => add(entries.helpWith, value));

    if (payload.helpOther?.trim()) {
      add(entries.helpWith, '__other_option__');
      add(`${entries.helpWith}.other_option_response`, payload.helpOther.trim());
    }

    document.body.appendChild(form);
    form.submit();

    window.setTimeout(() => {
      form.remove();
      iframe.remove();
      resolve({ success: true });
    }, 1200);
  });
}
