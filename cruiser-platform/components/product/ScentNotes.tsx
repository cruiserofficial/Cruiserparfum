'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import type { ScentNote } from '@/types'

interface Props {
  notes: ScentNote[]
  accent?: string | null
}

const TYPE_LABELS: Record<ScentNote['type'], { label: string; desc: string }> = {
  top: { label: 'Top Notes', desc: 'First impression' },
  heart: { label: 'Heart Notes', desc: 'The soul' },
  base: { label: 'Base Notes', desc: 'The lasting trail' },
}

export function ScentNotes({ notes, accent }: Props) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  const grouped = {
    top: notes.filter((n) => n.type === 'top'),
    heart: notes.filter((n) => n.type === 'heart'),
    base: notes.filter((n) => n.type === 'base'),
  }

  if (notes.length === 0) return null

  return (
    <section ref={ref} className="py-16 border-t border-white/[0.06]">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            className="label-gold mx-auto w-fit mb-6"
          >
            Scent Notes
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.1 }}
            className="font-display text-3xl text-cream"
          >
            Fragrance Pyramid
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {(['top', 'heart', 'base'] as const).map((type, groupIndex) => {
            const group = grouped[type]
            if (!group.length) return null
            const info = TYPE_LABELS[type]

            return (
              <motion.div
                key={type}
                initial={{ opacity: 0, y: 40 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: groupIndex * 0.15 }}
                className="glass p-6"
              >
                <div className="mb-4 pb-4 border-b border-white/[0.06]">
                  <p
                    className="font-sans text-xs tracking-[0.3em] uppercase mb-1"
                    style={{ color: accent ?? '#C9A84C' }}
                  >
                    {info.label}
                  </p>
                  <p className="font-serif text-xs text-cream/40">{info.desc}</p>
                </div>
                <div className="space-y-3">
                  {group.map((note, ni) => (
                    <motion.div
                      key={note.name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={inView ? { opacity: 1, x: 0 } : {}}
                      transition={{ delay: groupIndex * 0.15 + ni * 0.08 }}
                      className="flex items-center gap-3"
                    >
                      <span className="text-xl">{note.icon}</span>
                      <span className="font-sans text-sm text-cream/70">
                        {note.name}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
