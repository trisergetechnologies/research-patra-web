import { getServicePage } from '../../data/servicePages';
import ServicePageLayout from '../../components/service/ServicePageLayout';

const page = getServicePage('sci-journal-publication');

const SciJournal = () => <ServicePageLayout page={page} />;

export default SciJournal;
