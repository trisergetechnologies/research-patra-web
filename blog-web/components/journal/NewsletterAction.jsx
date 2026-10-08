'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

const post = async (action, token) => {
  const res = await fetch(`/api/public/newsletter/${action}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Something went wrong. Try the link again.');
  return data;
};

/** Landing page for the links in newsletter emails: confirms or unsubscribes, then offers the opposite action. */
export default function NewsletterAction({ action, token }) {
  const [state, setState] = useState(action && token ? { status: 'working', action } : { status: 'invalid' });

  useEffect(() => {
    if (!action || !token) return;
    let cancelled = false;
    post(action, token)
      .then(() => !cancelled && setState({ status: 'done', action }))
      .catch((err) => !cancelled && setState({ status: 'error', msg: err.message }));
    return () => {
      cancelled = true;
    };
  }, [action, token]);

  const run = (next) => {
    setState({ status: 'working', action: next });
    post(next, token)
      .then(() => setState({ status: 'done', action: next }))
      .catch((err) => setState({ status: 'error', msg: err.message }));
  };

  if (state.status === 'working') return <Card title={state.action === 'confirm' ? 'Confirming…' : 'Unsubscribing…'} />;
  if (state.status === 'invalid') return <Card title="This link is incomplete">Open the link from your email again, or subscribe from any article.</Card>;
  if (state.status === 'error') return <Card title="That link didn’t work">{state.msg}</Card>;

  return state.action === 'confirm' ? (
    <Card title="You’re subscribed 🎉">
      <p>The next issue of the Journal will land in your inbox. Until then, here’s where to start.</p>
      <div className="j-nl-page-acts">
        <Link className="j-btn" href="/">Browse the latest guides</Link>
        <button type="button" className="j-linkbtn" onClick={() => run('unsubscribe')}>Changed your mind? Unsubscribe</button>
      </div>
    </Card>
  ) : (
    <Card title="You’re unsubscribed">
      <p>You won’t get any more emails from us. Sorry to see you go.</p>
      <div className="j-nl-page-acts">
        <button type="button" className="j-btn j-ghost" onClick={() => run('confirm')}>Unsubscribed by mistake? Resubscribe</button>
        <Link className="j-linkbtn" href="/">Back to the Journal</Link>
      </div>
    </Card>
  );
}

function Card({ title, children }) {
  return (
    <div className="j-nl-card" role="status">
      <p className="j-eyebrow">The Research Patra Journal</p>
      <h1>{title}</h1>
      {typeof children === 'string' ? <p>{children}</p> : children}
    </div>
  );
}
