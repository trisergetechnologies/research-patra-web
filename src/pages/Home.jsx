import React from 'react';
import { Link } from 'react-router-dom';
import Hero from '../components/Hero';
import LogoSlider from '../components/LogoSlider';
import Services from '../components/Services';
import ResearchJourney from '../components/ResearchJourney';
import Methodology from '../components/Methodology';
import PageMeta from '../components/PageMeta';
import { HUB_PAGES } from '../data/servicePages';

const Home = () => {
  const meta = HUB_PAGES.home;
  return (
    <>
      <PageMeta title={meta.metaTitle} description={meta.metaDescription} path={meta.path} />
      <Hero />
      <LogoSlider />
      <Services />
      <ResearchJourney />
      <Methodology/>
    </>
  );
};

export default Home;