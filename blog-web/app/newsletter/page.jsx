import NewsletterAction from '@/components/journal/NewsletterAction';

export const metadata = { title: 'Newsletter', robots: { index: false, follow: false } };

export default async function NewsletterPage({ searchParams }) {
  const sp = await searchParams;
  const action = sp.unsubscribe ? 'unsubscribe' : sp.confirm ? 'confirm' : null;
  const token = typeof (sp.unsubscribe || sp.confirm) === 'string' ? sp.unsubscribe || sp.confirm : '';
  return (
    <div className="rpj">
      <div className="j-container j-nl-page">
        <NewsletterAction action={action} token={token} />
      </div>
    </div>
  );
}
