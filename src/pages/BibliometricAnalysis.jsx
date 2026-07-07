import { getServicePage } from '../data/servicePages';
import ServicePageLayout from '../components/service/ServicePageLayout';

const page = getServicePage('bibliometric-analysis');

const BibliometricAnalysis = () => <ServicePageLayout page={page} />;

export default BibliometricAnalysis;
