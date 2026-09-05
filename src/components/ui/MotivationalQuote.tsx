import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

const quotes = [
  "Believe you can and you're halfway there.",
  "The only way to do great work is to love what you do.",
  "Don't watch the clock; do what it does. Keep going.",
  "Success is not final, failure is not fatal: it is the courage to continue that counts.",
  "You are never too old to set another goal or to dream a new dream.",
  "It always seems impossible until it's done.",
  "Your limitation—it's only your imagination.",
  "Push yourself, because no one else is going to do it for you.",
  "Sometimes later becomes never. Do it now.",
  "Great things never come from comfort zones.",
  "Dream it. Wish it. Do it.",
  "Success doesn't just find you. You have to go out and get it.",
  "The harder you work for something, the greater you'll feel when you achieve it.",
  "Dream bigger. Do bigger.",
  "Don't stop when you're tired. Stop when you're done.",
  "Wake up with determination. Go to bed with satisfaction.",
  "Do something today that your future self will thank you for.",
  "Little things make big days.",
  "It's going to be hard, but hard does not mean impossible.",
  "Don't wait for opportunity. Create it.",
  "Sometimes we're tested not to show our weaknesses, but to discover our strengths.",
  "The key to success is to focus on goals, not obstacles.",
  "Dream it. Believe it. Build it.",
  "Focus on your goal. Don't look in any direction but ahead.",
  "Your time is limited, don't waste it living someone else's life.",
  "Every day is a new beginning. Take a deep breath, smile, and start again."
];

export const MotivationalQuote: React.FC = () => {
  const [currentQuote, setCurrentQuote] = useState(() => quotes[Math.floor(Math.random() * quotes.length)]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentQuote(quotes[Math.floor(Math.random() * quotes.length)]);
    }, 60000); // 1 minute

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="text-sm italic text-slate-500 dark:text-slate-400 mt-2 font-medium h-5">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuote}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          transition={{ duration: 0.5 }}
        >
          "{currentQuote}"
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
