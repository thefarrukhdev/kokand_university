import { motion } from "framer-motion";

const MeshGradient = () => {
  return (
    <div 
      className="fixed inset-0 w-full h-full -z-50 overflow-hidden pointer-events-none bg-background transition-colors duration-500"
      aria-hidden="true"
    >
      {/* Subtle Primary Aura (Top-Right) */}
      <motion.div
        animate={{
          x: [0, 40, 0, -40, 0],
          y: [0, 30, -20, 30, 0],
          scale: [1, 1.08, 1, 1.04, 1],
        }}
        transition={{ duration: 32, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[-15%] right-[-10%] w-[65vw] max-w-[700px] aspect-square rounded-full bg-primary/[0.07] dark:bg-primary/[0.12] blur-[130px] md:blur-[180px] will-change-transform"
      />

      {/* Soft Ambient Balance Aura (Bottom-Left) */}
      <motion.div
        animate={{
          x: [0, -50, 0, 50, 0],
          y: [0, -30, 30, -30, 0],
          scale: [1, 1.06, 1, 1.03, 1],
        }}
        transition={{ duration: 38, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-[-15%] left-[-10%] w-[60vw] max-w-[650px] aspect-square rounded-full bg-primary/[0.05] dark:bg-primary/[0.09] blur-[140px] md:blur-[190px] will-change-transform"
      />
    </div>
  );
};

export default MeshGradient;
