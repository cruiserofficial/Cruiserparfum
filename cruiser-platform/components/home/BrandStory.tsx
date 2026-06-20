'use client'

import Image from 'next/image'
import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'

const PILLARS = [
  {
    num: '01',
    title: 'Premium Quality',
    sub: 'Bahan-bahan terpilih dari seluruh dunia untuk setiap botol CRUISER.',
  },
  {
    num: '02',
    title: 'Long Lasting',
    sub: 'Extrait De Parfum — konsentrasi tertinggi untuk ketahanan maksimal.',
  },
  {
    num: '03',
    title: 'Crafted Identity',
    sub: 'Setiap aroma mencerminkan karakter unik pemakainya.',
  },
]

export function BrandStory() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section className="py-24 md:py-32 relative overflow-hidden" id="story">
      {/* Background accent */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/4 w-[600px] h-[600px] -translate-y-1/2 rounded-full bg-gold/[0.03] blur-[120px]" />
      </div>

      <div className="container max-w-7xl mx-auto px-6" ref={ref}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Text */}
          <div>
            <motion.p
              initial={{ opacity: 0, x: -30 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6 }}
              className="label-gold w-fit mb-8"
            >
              Our Story
            </motion.p>

            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="font-display text-[clamp(2rem,4vw,3rem)] text-cream leading-tight mb-6"
            >
              Crafted with Purpose.<br />
              <span className="text-gold-gradient">Worn with Pride.</span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="font-serif text-cream/60 text-lg leading-relaxed mb-4"
            >
              CRUISER lahir dari keyakinan bahwa wewangian adalah bahasa universal —
              tanpa kata, tanpa batas. Setiap botol adalah karya, setiap aroma adalah cerita.
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="font-serif text-cream/60 text-lg leading-relaxed mb-12"
            >
              Dibuat dengan bahan-bahan premium berkualitas tinggi, koleksi CRUISER menghadirkan
              pengalaman wewangian kelas dunia yang tahan lama, membekas, dan mencerminkan
              identitas pemakainya.
            </motion.p>

            {/* Pillars */}
            <div className="space-y-6">
              {PILLARS.map((pillar, i) => (
                <motion.div
                  key={pillar.num}
                  initial={{ opacity: 0, x: -30 }}
                  animate={inView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.6, delay: 0.4 + i * 0.1 }}
                  className="flex gap-6 items-start"
                >
                  <span className="font-display text-4xl text-gold/40 leading-none flex-shrink-0">
                    {pillar.num}
                  </span>
                  <div>
                    <p className="font-sans text-base font-semibold tracking-widest uppercase text-cream mb-2">
                      {pillar.title}
                    </p>
                    <p className="font-serif text-base text-cream/70 leading-relaxed">
                      {pillar.sub}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: 60 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 1, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="relative"
          >
            <div className="relative aspect-[4/5] overflow-hidden">
              <Image
                src="/images/all-bundle.png"
                alt="CRUISER Collection"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-obsidian/40 to-transparent" />
            </div>

            {/* Badge */}
            <div className="absolute -bottom-6 -left-6 w-28 h-28 glass-gold flex flex-col items-center justify-center">
              <span className="font-sans text-[10px] tracking-[0.2em] uppercase text-gold/60">est.</span>
              <span className="font-display text-3xl text-gold leading-none">2026</span>
              <span className="font-sans text-[9px] tracking-[0.3em] uppercase text-gold/60">CRUISER</span>
            </div>

            {/* Decorative border */}
            <div className="absolute -top-4 -right-4 w-full h-full border border-gold/15 pointer-events-none" />
          </motion.div>
        </div>
      </div>
    </section>
  )
}
