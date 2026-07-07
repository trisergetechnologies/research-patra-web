import { getServicePage } from '../../data/servicePages';
import ServicePageLayout from '../../components/service/ServicePageLayout';

const page = getServicePage('ugc-publication');

const UgcPublication = () => <ServicePageLayout page={page} />;

export default UgcPublication;
