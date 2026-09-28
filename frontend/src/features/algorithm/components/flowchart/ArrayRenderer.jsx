import { motion } from "motion/react";

export default function ArrayRenderer({
  array,
  activeIndices,
  found,
  low,
  high
}) {
  return (
    <div className="flex gap-2">
      {array.map((num, i) => (
        <motion.div
          key={i}
          className="w-12 h-12 flex items-center justify-center border rounded text-white"

          animate={{
            backgroundColor:
              activeIndices.includes(i)
                ? found
                  ? "green"
                  : "orange"
                : i >= low && i <= high
                ? "#333"
                : "#111",
          }}
        >
          {num}
        </motion.div>
      ))}
    </div>
  );
}