"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { useRef } from "react";

const headline = ["Little", "Cars.", "Big", "Dreams."];

/** Showroom-style hero: one orchestrated entrance, then a gentle scroll parallax. */
export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const carY = useTransform(scrollYProgress, [0, 1], [0, 80]);

  return (
    <section ref={ref} className="relative overflow-hidden bg-navy text-white">
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/40 to-transparent" aria-hidden />
      <div className="mx-auto grid min-h-[34rem] max-w-7xl items-center gap-8 px-4 py-16 sm:px-6 lg:grid-cols-2">
        <div>
          <h1 className="font-display text-5xl leading-[1.05] text-white sm:text-6xl">
            {headline.map((word, i) => (
              <motion.span
                key={word}
                className="mr-3 inline-block"
                initial={{ opacity: 0, y: 28 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + i * 0.12, duration: 0.6, ease: "easeOut" }}
              >
                {word}
              </motion.span>
            ))}
          </h1>
          <motion.p
            className="mt-6 max-w-md text-lg text-white/75"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.6 }}
          >
            Exceptional toy cars, premium collectibles and unforgettable gifts for every generation.
          </motion.p>
          <motion.div
            className="mt-8 flex flex-wrap gap-3"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.5 }}
          >
            <Link href="/shop/kids" className="rounded-full bg-gold px-6 py-3 font-medium text-navy transition-transform hover:scale-[1.03]">
              Explore Kids' Collection
            </Link>
            <Link href="/shop/collectors" className="rounded-full px-6 py-3 font-medium ring-1 ring-gold/60 transition-colors hover:bg-white/10">
              Discover Collectibles
            </Link>
          </motion.div>
        </div>

        <motion.div style={{ y: carY }} className="relative">
          <motion.svg
            viewBox="0 0 620 260"
            role="img"
            aria-label="Illustration of a sports car"
            className="w-full"
            initial={{ x: -160, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
          >
            <defs>
              <linearGradient id="body" x1="0" x2="1">
                <stop offset="0" stopColor="#c6a15b" />
                <stop offset="0.5" stopColor="#e6cf9b" />
                <stop offset="1" stopColor="#a8803b" />
              </linearGradient>
            </defs>
            <ellipse cx="310" cy="228" rx="260" ry="12" fill="#000" opacity="0.35" />
            <path d="M30 188c0-22 22-34 70-42l82-52c26-16 62-24 112-24h92c42 0 76 16 104 44l60 18c26 8 40 24 40 56z" fill="url(#body)" />
            <path d="M200 100c26-14 56-20 98-20h84c30 0 56 12 80 36l-262 6z" fill="#101827" opacity="0.88" />
            <path d="M298 80v36" stroke="#c6a15b" strokeWidth="3" />
            <circle cx="148" cy="192" r="36" fill="#0b111d" />
            <circle cx="148" cy="192" r="18" fill="#c6a15b" />
            <circle cx="474" cy="192" r="36" fill="#0b111d" />
            <circle cx="474" cy="192" r="18" fill="#c6a15b" />
            <motion.rect
              x="-120" y="70" width="60" height="140" fill="#fff" opacity="0.18" transform="skewX(-20)"
              animate={{ x: [-120, 720] }}
              transition={{ delay: 1.4, duration: 1.6, ease: "easeInOut" }}
            />
          </motion.svg>
        </motion.div>
      </div>
    </section>
  );
}
