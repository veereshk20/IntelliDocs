import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Hero = () => {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center text-center bg-gradient-to-br from-blue-600 to-indigo-700 text-white px-6">
      
      {/* Animated Heading */}
      <motion.h1 
        initial={{ opacity: 0, y: -50 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 1 }}
        className="text-4xl md:text-6xl font-bold leading-tight"
      >
        Welcome to <span className="text-yellow-300">Our Platform</span>
      </motion.h1>

      {/* Subtitle */}
      <motion.p 
        initial={{ opacity: 0, y: 30 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 1, delay: 0.5 }}
        className="text-lg md:text-xl mt-4 opacity-90 max-w-2xl"
      >
        Experience seamless solutions with cutting-edge technology.
      </motion.p>

      {/* Call-to-Action Buttons */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }} 
        animate={{ opacity: 1, scale: 1 }} 
        transition={{ duration: 0.5, delay: 1 }}
        className="mt-6 flex gap-4"
      >
        <Link to="/auth/login">
          <Button className="bg-white text-blue-600 hover:bg-gray-200 transition px-6 py-3 text-lg font-semibold">
            Get Started
          </Button>
        </Link>
        <Link to="/about">
          <Button variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600 transition px-6 py-3 text-lg font-semibold">
            Learn More
          </Button>
        </Link>
      </motion.div>

      {/* Decorative Scroll Indicator */}
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        transition={{ duration: 1.5, delay: 1.5 }}
        className="absolute bottom-8 text-sm opacity-80 animate-bounce"
      >
        Scroll down for more ↓
      </motion.div>
    </div>
  );
};

export default Hero;
