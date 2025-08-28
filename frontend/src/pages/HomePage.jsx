
import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Slider from '../components/Slider';
import CategorySection from '../components/CategorySection';
import RecommendedArtists from '../components/RecommendedArtists';
import { useUserStore } from '../stores/useUserStore';
import { motion } from 'framer-motion';

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const HomePage = () => {
  const location = useLocation();
  const user = useUserStore((state) => state.user);

  useEffect(() => {
    if (location.state?.scrollTo) {
      const section = document.getElementById(location.state.scrollTo);
      if (section) {
        setTimeout(() => {
          section.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    }
  }, [location]);

  return (
    <>
      <Navbar />
      <Slider />
      <CategorySection />

      {user?.role === 'client' && <RecommendedArtists clientId={user._id} />}

      <Footer />
    </>
  );
};

export default HomePage;

