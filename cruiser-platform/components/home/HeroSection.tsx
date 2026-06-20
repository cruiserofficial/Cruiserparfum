'use client'

import { useRef, useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, useScroll, useTransform } from 'framer-motion'
import { ChevronDown } from 'lucide-react'

interface ParticleData {
  size: number
  left: number
  dur: number
  delay: number
  opacity: number
  yRange: number
  xRange: number
}

export function HeroSection() {
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '30%'])
  const opacity = useTransform(scrollYProgress, [0, 0.7], [1, 0])

  return (
    <section ref={ref} className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Parallax background */}
      <motion.div style={{ y }} className="absolute inset-0">
        <Image
          src="/images/hero-banner.png"
          alt="CRUISER — Eternity, Noctis, Liberea"
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-obsidian/60 via-obsidian/40 to-obsidian" />
      </motion.div>

      {/* Gold particles */}
      <Particles />

      {/* Content */}
      <motion.div
        style={{ opacity }}
        className="relative z-10 text-center px-6 max-w-4xl mx-auto"
      >
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="font-sans text-xs tracking-[0.5em] uppercase text-gold/80 mb-8"
        >
          est. 2026 &nbsp;·&nbsp; Extrait De Parfum
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 1, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="font-display text-[clamp(4rem,15vw,10rem)] leading-none tracking-[0.15em] mb-6"
        >
          {['C', 'R', 'U', 'I', 'S', 'E', 'R'].map((letter, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + i * 0.06, duration: 0.8 }}
              className="inline-block text-gold-gradient"
            >
              {letter}
            </motion.span>
          ))}
        </motion.h1>

        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 1.1, duration: 0.8 }}
          className="ornament"
        >
          <span className="text-gold">◆</span>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.3, duration: 0.8 }}
          className="font-serif italic text-xl md:text-2xl text-cream/80 mb-12 tracking-widest"
        >
          &ldquo;Luxury in Every Note.&rdquo;
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5, duration: 0.8 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link href="/shop" className="btn-luxury">
            Explore Collection
          </Link>
          <Link href="/#story" className="btn-luxury-outline">
            Our Story
          </Link>
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 0.8 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="font-sans text-[10px] tracking-[0.4em] uppercase text-cream/30">Scroll</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <ChevronDown size={16} className="text-cream/30" />
        </motion.div>
      </motion.div>
    </section>
  )
}

function Particles() {
  const [particles, setParticles] = useState<ParticleData[]>([])

  useEffect(() => {
    setParticles(
      Array.from({ length: 40 }, () => ({
        size: 1 + Math.random() * 2.5,
        left: Math.random() * 100,
        dur: 10 + Math.random() * 15,
        delay: Math.random() * 10,
        opacity: 0.1 + Math.random() * 0.5,
        yRange: 400 + Math.random() * 300,
        xRange: (Math.random() - 0.5) * 60,
      })),
    )
  }, [])

  if (particles.length === 0) return null

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {particles.map((p, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-gold"
          style={{ width: p.size, height: p.size, left: `${p.left}%`, bottom: '-4px', opacity: p.opacity }}
          animate={{ y: [0, -p.yRange], x: [p.xRange], opacity: [p.opacity, 0] }}
          transition={{ duration: p.dur, delay: p.delay, repeat: Infinity, ease: 'linear' }}
        />
      ))}
    </div>
  )
}
