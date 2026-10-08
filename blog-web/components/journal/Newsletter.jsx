'use client';

import { useId, useState } from 'react';

const COPY = {
  box: { title: 'The monthly Journal', body: 'One email a month with new guides on thesis writing, analysis and publishing.' },
  article: { title: 'Get the next guide in your inbox', body: 'One practical email a month. No spam, unsubscribe in one click.' },
};

/** Double opt-in signup: the address only joins the list after the reader clicks the link we email them. */
export default function Newsletter({ variant = 'box', source = 'sidebar' }) {
  const id = useId();
  const [email, setEmail] = useState('');
  const [state, setState] = useState({ status: 'idle', msg: '' });
  const copy = COPY[variant] ?? COPY.box;

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      setState({ status: 'error', msg: 'Enter a valid email address.' });
      return;
    }
    setState({ status: 'sending', msg: '' });
    try {
      const res = await fetch('/api/public/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), source }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 429) throw new Error('Too many attempts. Try again in a little while.');
      if (!res.ok) throw new Error(data.details?.[0]?.message || data.message || 'Could not subscribe right now.');
      setState({ status: 'done', msg: '' });
    } catch (err) {
      setState({ status: 'error', msg: err.message });
    }
  };

  return (
    <div className={variant === 'article' ? 'j-nl-inline' : 'j-box j-nl-box'}>
      <h2 className="j-box-h">{copy.title}</h2>
      {state.status === 'done' ? (
        <p className="j-nl-done" role="status">
          <strong>Almost there.</strong> We sent a confirmation link to <b>{email.trim()}</b>. Click it to start receiving the Journal.
        </p>
      ) : (
        <>
          <p className="j-small">{copy.body}</p>
          <form className="j-nl" noValidate onSubmit={onSubmit}>
            <label className="j-sr" htmlFor={`${id}-email`}>Email address</label>
            <input
              id={`${id}-email`}
              className="j-input"
              type="email"
              placeholder="you@university.edu"
              autoComplete="email"
              value={email}
              aria-invalid={state.status === 'error' || undefined}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button className="j-btn" type="submit" disabled={state.status === 'sending'}>
              {state.status === 'sending' ? 'Subscribing…' : 'Subscribe'}
            </button>
            <div className="j-msg" role="status">{state.msg}</div>
          </form>
        </>
      )}
    </div>
  );
}
