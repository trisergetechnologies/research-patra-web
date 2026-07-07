import PageMeta from '../PageMeta';
import ServiceHero from './ServiceHero';
import ProcessSteps from './ProcessSteps';
import DeliverablesList from './DeliverablesList';
import WhoItsFor from './WhoItsFor';
import ServiceFAQ from './ServiceFAQ';
import RelatedServices from './RelatedServices';
import EditingTypes from './EditingTypes';
import ServiceContactLink from '../ServiceContactLink';

export default function ServicePageLayout({ page, children }) {
  if (!page) return null;

  return (
    <div className="bg-white font-sans selection:bg-[#F97316] selection:text-white overflow-x-hidden">
      <PageMeta title={page.metaTitle} description={page.metaDescription} path={page.path} />
      <ServiceHero badge={page.hero.badge} title={page.hero.title} subtitle={page.hero.subtitle} />
      {children}
      <ProcessSteps steps={page.process} />
      <DeliverablesList items={page.deliverables} />
      {page.editingTypes && <EditingTypes types={page.editingTypes} source={page.id} />}
      <WhoItsFor />
      <ServiceFAQ faqs={page.faqs} />
      <RelatedServices links={page.related} />
      <ServiceContactLink {...page.contact} />
    </div>
  );
}
