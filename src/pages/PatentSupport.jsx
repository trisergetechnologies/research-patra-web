import { getServicePage } from '../data/servicePages';
import ServicePageLayout from '../components/service/ServicePageLayout';

const page = getServicePage('patent-support');

const PatentSupport = () => <ServicePageLayout page={page} />;

export default PatentSupport;
