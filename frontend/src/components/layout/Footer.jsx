import { useTheme } from '../../context/ThemeContext'

const QUICK_LINKS = [
  { label: 'Campus Map', path: '/map' },
  { label: 'Events', path: '/events' },
  { label: 'Lost & Found', path: '/lost-found' },
]

const RESOURCES = [
  { label: 'GEHU Website', href: 'https://www.gehu.ac.in' },
  { label: 'Student Portal', href: '#' },
  { label: 'Help & Support', href: '#' },
]

export default function Footer() {
  const { isDark } = useTheme()
  const year = new Date().getFullYear()

  return (
    <footer style={{
      background: 'var(--footer-bg)',
      color: '#CBD5E1',
      padding: '48px 24px 24px',
      borderTop: '1px solid rgba(59,130,246,0.15)',
      transition: 'background 0.3s',
    }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        {/* Top section */}
        <div className="footer-grid" style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr 1fr 1fr',
          gap: 40,
          marginBottom: 40,
        }}>
          {/* Brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <div style={{
                width: 40, height: 40, borderRadius: 12,
                background: 'linear-gradient(135deg, #0d9488, #3B82F6)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 15px rgba(59,130,246,0.3)',
              }}>
                <span style={{ fontSize: 20 }}>🧭</span>
              </div>
              <div>
                <div style={{
                  fontSize: 20, fontWeight: 900,
                  background: 'linear-gradient(135deg, #3B82F6, #06B6D4)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                }}>UniPath</div>
                <div style={{ fontSize: 10, color: '#64748B', letterSpacing: 1, textTransform: 'uppercase' }}>GEHU Campus Navigator</div>
              </div>
            </div>
            <p style={{ fontSize: 13, color: '#64748B', lineHeight: 1.7, maxWidth: 320 }}>
              Smart campus navigation system for Graphic Era Hill University.
              Find rooms, navigate buildings, and stay connected with campus events.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{ fontSize: 12, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 16 }}>Navigate</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {QUICK_LINKS.map(l => (
                <a key={l.path} href={l.path} style={{ fontSize: 13, color: '#64748B', textDecoration: 'none', transition: 'color 0.2s' }}
                  onMouseEnter={e => e.target.style.color = '#3B82F6'}
                  onMouseLeave={e => e.target.style.color = '#64748B'}
                >{l.label}</a>
              ))}
            </div>
          </div>

          {/* Resources */}
          <div>
            <h4 style={{ fontSize: 12, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 16 }}>Resources</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {RESOURCES.map(l => (
                <a key={l.label} href={l.href} target="_blank" rel="noopener noreferrer"
                  style={{ fontSize: 13, color: '#64748B', textDecoration: 'none', transition: 'color 0.2s' }}
                  onMouseEnter={e => e.target.style.color = '#06B6D4'}
                  onMouseLeave={e => e.target.style.color = '#64748B'}
                >{l.label}</a>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 style={{ fontSize: 12, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 16 }}>Contact</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13, color: '#64748B' }}>
              <div>📍 GEHU, Dehradun</div>
              <div>✉️ support@gehu.ac.in</div>
              <div>🌐 gehu.ac.in</div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div style={{
          height: 1,
          background: 'linear-gradient(90deg, transparent, rgba(59,130,246,0.2), rgba(6,182,212,0.2), transparent)',
          marginBottom: 20,
        }} />

        {/* Bottom */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12,
        }}>
          <div style={{ fontSize: 12, color: '#475569' }}>
            © {year} UniPath — Graphic Era Hill University. All rights reserved.
          </div>
          <div style={{ fontSize: 12, color: '#475569', display: 'flex', alignItems: 'center', gap: 4 }}>
            Made with <span style={{ color: '#EF4444', fontSize: 14 }}>❤️</span> for GEHU Campus
          </div>
        </div>
      </div>
    </footer>
  )
}
