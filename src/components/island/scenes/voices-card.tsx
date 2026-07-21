"use client";

import { motion } from "framer-motion";

// One idea, said three ways — English, French and the Kreol everyone shares.
const VOICES = [
  { en: "Good morning", fr: "Bonjour", mfe: "Bonzour" },
  { en: "How are you?", fr: "Comment ça va ?", mfe: "Ki manier?" },
  { en: "Thank you", fr: "Merci", mfe: "Mersi" },
  { en: "I love you", fr: "Je t'aime", mfe: "Mo kontan twa" },
];

export function VoicesCard() {
  return (
    <motion.ul
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-10% 0px" }}
      variants={{ show: { transition: { staggerChildren: 0.08 } } }}
      className="space-y-3"
    >
      {VOICES.map((v, i) => (
        <motion.li
          key={v.en}
          variants={{ hidden: { opacity: 0, x: 24 }, show: { opacity: 1, x: 0 } }}
          className="flex items-center justify-between gap-4 rounded-2xl border border-white/12 bg-white/[0.04] p-4 backdrop-blur"
          style={{ marginLeft: `${(i % 2) * 1.25}rem` }}
        >
          <div className="text-xs leading-relaxed text-white/45">
            <span className="block">🇬🇧 {v.en}</span>
            <span className="block">🇫🇷 {v.fr}</span>
          </div>
          <span className="font-display text-lg font-bold text-[#7ff0ff]">{v.mfe}</span>
        </motion.li>
      ))}
    </motion.ul>
  );
}
