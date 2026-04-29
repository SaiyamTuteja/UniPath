import { useEffect, useRef } from 'react'

const PARTICLE_COUNT = 25

export default function AnimatedBackground() {
  const containerRef = useRef(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // Create particles
    const particles = []
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const p = document.createElement('div')
      const size = Math.random() * 3 + 1
      const duration = Math.random() * 20 + 15
      const delay = Math.random() * 15
      const hue = Math.random() > 0.5 ? '210' : '185' // blue or cyan

      p.className = 'particle'
      p.style.cssText = `
        width: ${size}px;
        height: ${size}px;
        left: ${Math.random() * 100}%;
        background: hsl(${hue}, 100%, 65%);
        animation-duration: ${duration}s;
        animation-delay: -${delay}s;
        opacity: ${Math.random() * 0.4 + 0.1};
        filter: blur(${size > 2 ? 1 : 0}px);
      `
      container.appendChild(p)
      particles.push(p)
    }

    return () => particles.forEach(p => p.remove())
  }, [])

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Base gradient */}
      <div className="absolute inset-0 bg-[#0A0F1E]" />
      
      {/* Grid pattern */}
      <div className="absolute inset-0 bg-grid opacity-100" />

      {/* Radial glow orbs */}
      <div
        className="absolute top-0 left-1/4 w-96 h-96 rounded-full opacity-10 blur-3xl"
        style={{ background: 'radial-gradient(circle, #3B82F6, transparent)' }}
      />
      <div
        className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full opacity-8 blur-3xl"
        style={{ background: 'radial-gradient(circle, #06B6D4, transparent)' }}
      />
      <div
        className="absolute top-1/2 left-0 w-64 h-64 rounded-full opacity-6 blur-3xl"
        style={{ background: 'radial-gradient(circle, #8B5CF6, transparent)' }}
      />

      {/* Particle container */}
      <div ref={containerRef} className="absolute inset-0" />
    </div>
  )
}
