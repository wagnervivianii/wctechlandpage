import { useEffect, useState } from 'react'

import AdminPage from './pages/AdminPage'
import BookingPage from './pages/BookingPage'
import LandingPage from './pages/LandingPage'

function isSchedulePath(pathname: string) {
  return pathname === '/agendar' || pathname === '/agendar/'
}

function isAdminPath(pathname: string) {
  return pathname === '/admin' || pathname === '/admin/'
}

export default function App() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [pathname, setPathname] = useState(() => window.location.pathname)

  useEffect(() => {
    const handlePopState = () => setPathname(window.location.pathname)
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  if (isSchedulePath(pathname)) {
    return <BookingPage />
  }

  if (isAdminPath(pathname)) {
    return <AdminPage />
  }

  return <LandingPage mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />
}