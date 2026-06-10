import { motion } from "framer-motion";

export default function Panel({
  icon,
  title,
  subtitle,
  children,
  className = ""
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-[2rem] border border-borderRoyal bg-royalCard p-6 ${className}`}
    >
      <div className="mb-6 flex items-start gap-4">
        {icon && (
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gold/10 text-gold">
            {icon}
          </div>
        )}

        <div>
          <h2 className="font-display text-2xl font-bold text-textPrimary">
            {title}
          </h2>

          {subtitle && (
            <p className="mt-1 text-textSecondary">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {children}
    </motion.section>
  );
}