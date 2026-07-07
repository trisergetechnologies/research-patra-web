import { getServicePage } from '../data/servicePages';
import ServicePageLayout from '../components/service/ServicePageLayout';

const page = getServicePage('editing-proofreading');

const EditingProofreading = () => <ServicePageLayout page={page} />;

export default EditingProofreading;
