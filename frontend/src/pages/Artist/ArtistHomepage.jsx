
import Slider from '../../components/Slider';
import CategorySection from '../../components/CategorySection';

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import ArtistNavbar from './ArtistNavbar';
import Footer from '../../components/Footer';



const ArtistHome = () => {
  const location = useLocation();

useEffect(() => {
  if (location.state?.scrollTo) {
    const section = document.getElementById(location.state.scrollTo);
    if (section) {
      setTimeout(() => {
        section.scrollIntoView({ behavior: 'smooth' });
      }, 100); // wait until page mounts
    }
  }
}, [location]);
  return (
    <>
      <ArtistNavbar />
      <Slider />
      <CategorySection />
      <Footer />

    </>
  );
};

export default ArtistHome;