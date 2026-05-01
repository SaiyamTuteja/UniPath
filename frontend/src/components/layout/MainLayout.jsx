import { useState, useCallback, useEffect } from 'react'
import Header from './Header'
import Sidebar from './Sidebar'
import Footer from './Footer'

export default function MainLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  // On mobile, start with sidebar closed
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setSidebarOpen(false)
      }
    }
    handleResize() // run on mount
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const toggleSidebar = useCallback(() => {
    setSidebarOpen(prev => !prev)
  }, [])

  const closeSidebar = useCallback(() => {
    setSidebarOpen(false)
  }, [])

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-primary)', transition: 'background 0.3s' }}>
      <Header onToggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} />
      <div style={{ display: 'flex', flex: 1, position: 'relative' }}>
        <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />
        {/* Main content area — use class for responsive margin */}
        <main className={`main-content ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`} style={{
          flex: 1,
          minHeight: 'calc(100vh - 64px)',
          display: 'flex',
          flexDirection: 'column',
          transition: 'margin-left 0.3s ease',
        }}>
          <div style={{ flex: 1 }}>
            {children}
          </div>
          <Footer />
        </main>
      </div>
    </div>
  )
}
