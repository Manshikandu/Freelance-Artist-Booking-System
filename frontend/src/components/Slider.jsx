import { useState, useEffect } from 'react';
import { useUserStore } from '../stores/useUserStore';
import { motion } from 'framer-motion';
import img2 from '../assets/p.jpg';
import Home from '../assets/home.jpg';


const images = [img2, Home];

const Slider = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { user } = useUserStore();

  useEffect(() => {
    if (currentIndex >= images.length) {
      setCurrentIndex(0);
    }
  }, [currentIndex]);

  useEffect(() => {
    if (!user) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % images.length);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [user]);

  if (user) {
    return (
     <div
  className="relative w-full h-[600px] rounded-lg shadow-lg overflow-hidden"
>
  <div
    className="absolute inset-0 bg-cover bg-center scale-100"
    style={{ backgroundImage: `url(${Home})` }}
  ></div>

  <div className="absolute inset-0 bg-black/60"></div>

  <div className="relative z-10 flex flex-col items-center justify-center h-full text-center text-white px-4">
    <motion.h1
      className="text-4xl md:text-6xl font-bold"
      initial={{ opacity: 0, y: -30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      Welcome, {user.username || ''}
    </motion.h1>
    <motion.p
      className="text-lg md:text-xl max-w-xl mt-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5 }}
    >
      Ready to explore artists and make your event unforgettable?
    </motion.p>
  </div>
</div>

    );
  }

  return (
    <div className="relative w-full h-[600px] rounded-lg shadow-lg overflow-hidden">
      <div
        className="flex transition-transform duration-700 h-full"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {images.map((img, i) => (
          <div key={i} className="relative w-full flex-shrink-0">
            <div
              className="absolute inset-0 bg-cover bg-center scale-100"
              style={{ backgroundImage: `url(${img})` }}
            ></div>
            <div className="absolute inset-0 bg-black/60"></div>
          </div>
        ))}
      </div>

      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {images.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentIndex(i)}
            className={`w-3 h-3 rounded-full transition-colors ${
              i === currentIndex ? 'bg-white' : 'bg-gray-400'
            }`}
          />
        ))}
      </div>

      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center h-full text-center text-white px-4">
        <motion.h1
          className="text-4xl md:text-6xl font-bold text-purple-300"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          Discover. Connect. Celebrate.
        </motion.h1>
        <motion.p
          className="text-lg md:text-xl max-w-xl mt-4 text-purple-100"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          Book talented artists for your events today and make them unforgettable.
        </motion.p>
      </div>
    </div>
  );
};

export default Slider;
