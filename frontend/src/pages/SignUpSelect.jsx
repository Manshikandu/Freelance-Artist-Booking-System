import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Users, Palette, ArrowRight, Sparkles } from "lucide-react";

const WelcomeScreen = () => {
  const navigate = useNavigate();

  const handleClientClick = () => {
    navigate("/clientSignup");
  };
  
  const handleArtistClick = () => {
    navigate("/artistSignup");
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.8,
        staggerChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  const buttonVariants = {
    hover: {
      scale: 1.02,
      transition: { duration: 0.2 }
    },
    tap: {
      scale: 0.98,
      transition: { duration: 0.1 }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-purple-100 p-4 overflow-hidden relative">
      {/* Background decorative elements */}
      <div className="absolute top-10 left-10 w-32 h-32 bg-purple-200/30 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 right-20 w-40 h-40 bg-purple-300/20 rounded-full blur-3xl"></div>
      <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-purple-400/20 rounded-full blur-2xl"></div>

      <motion.div
        className="flex flex-col lg:flex-row items-center gap-12 max-w-6xl mx-auto"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Left Side: Welcome Content */}
        <motion.div 
          className="text-center lg:text-left lg:w-1/2"
          variants={itemVariants}
        >
          <div className="relative">
            <h1 className="text-4xl lg:text-6xl font-bold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
                Welcome to
              </span>
              <br />
              <span className="bg-gradient-to-r from-purple-800 to-purple-600 bg-clip-text text-transparent">
                KalaConnect
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Connect with talented artists or showcase your creative skills. 
              Choose your path and start your journey in the world of art and creativity.
            </p>
          </div>
        </motion.div>

        {/* Right Side: Selection Cards */}
        <motion.div 
          className="lg:w-1/2"
          variants={itemVariants}
        >
          <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/20 max-w-md mx-auto">
            <motion.div
              className="text-center mb-8"
              variants={itemVariants}
            >
              <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent mb-3">
                Choose Your Role
              </h2>
              <p className="text-gray-600">
                Select how you'd like to join our community
              </p>
            </motion.div>

            <div className="space-y-4">
              {/* Client Button */}
              <motion.button
                onClick={handleClientClick}
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
                className="group w-full bg-purple-600 text-white p-6 rounded-2xl hover:bg-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl border border-purple-500/20"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="bg-white/20 p-3 rounded-xl">
                      <Users className="h-6 w-6" />
                    </div>
                    <div className="text-left">
                      <h3 className="text-lg font-semibold">I'm a Client</h3>
                      <p className="text-purple-100 text-sm">Looking to hire artists</p>
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </div>
              </motion.button>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white/70 text-gray-500 font-medium">OR</span>
                </div>
              </div>

              {/* Artist Button */}
              <motion.button
                onClick={handleArtistClick}
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
                className="group w-full bg-purple-600 text-white p-6 rounded-2xl hover:bg-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl border border-purple-500/20"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="bg-white/20 p-3 rounded-xl">
                      <Palette className="h-6 w-6" />
                    </div>
                    <div className="text-left">
                      <h3 className="text-lg font-semibold">I'm an Artist</h3>
                      <p className="text-purple-100 text-sm">Ready to showcase my work</p>
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </div>
              </motion.button>
            </div>

            <motion.div
              className="mt-8 text-center"
              variants={itemVariants}
            >
              <p className="text-sm text-gray-500">
                Already have an account?{" "}
                <button
                  onClick={() => navigate("/login")}
                  className="text-purple-600 hover:text-purple-800 font-medium transition-colors"
                >
                  Sign in here
                </button>
              </p>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default WelcomeScreen;
