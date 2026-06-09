import { motion } from "framer-motion";

export default function EmperorButton({ children, type = "button", onClick, disabled }) {
  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.03 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      type={type}
      onClick={onClick}
      disabled={disabled}
      className="rounded-full bg-gradient-to-r from-goldLight via-gold to-goldLight px-6 py-3 font-bold text-black shadow-gold disabled:cursor-not-allowed disabled:opacity-60"
    >
      {children}
    </motion.button>
  );
}