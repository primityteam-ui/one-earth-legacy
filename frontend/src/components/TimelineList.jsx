import { motion } from "framer-motion";

export default function TimelineList({
  items = [],
  emptyMessage = "No timeline events yet."
}) {
  if (!items.length) {
    return (
      <div className="rounded-[1.25rem] border border-borderRoyal bg-black/30 p-5 text-center text-textSecondary">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {items.map((event, index) => (
        <motion.div
          key={`${event.title || "event"}-${event.date || index}-${index}`}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          className="rounded-[1.25rem] border border-borderRoyal bg-black/30 p-5"
        >
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="font-bold text-textPrimary">
                {event.title || "Timeline Event"}
              </p>

              <p className="mt-1 text-textSecondary">
                {event.text || event.description || ""}
              </p>
            </div>

            {(event.date || event.status) && (
              <span className="w-fit rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-sm font-bold text-goldLight">
                {event.date || event.status}
              </span>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
}