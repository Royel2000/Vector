import { easeOut, motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function SplashScreen() {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // A los 1.7s inicia la salida
    const timer = setTimeout(() => setFadeOut(true), 1700);
    return () => clearTimeout(timer);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: fadeOut ? 0 : 1 }}
      transition={{ duration: 0.6, ease: easeOut }}
      className="flex items-center justify-center h-screen w-full 
                 bg-black relative overflow-hidden"
    >
      {/* Gradiente circular */}
      <div className="absolute w-80 h-80 rounded-full 
                      bg-indigo-600 blur-3xl opacity-30"></div>

      {/* Logo animado + salida */}
      <motion.img
        src="/vite.svg"
        alt="logo"
        initial={{ opacity: 0, scale: 0.3 }}
        animate={
          fadeOut
            ? { opacity: 0, scale: 0.5 }
            : { opacity: 1, scale: 2 }
        }
        transition={{ duration: 0.8, ease: easeOut }}
        className="w-32 h-32 z-10"
      />
    </motion.div>
  );
}
