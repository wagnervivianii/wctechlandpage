import { useEffect, useState } from 'react'

import BookingPage from './pages/BookingPage'
import LandingPage from './pages/LandingPage'

function isSchedulePath(pathname: string) {
  return pathname === '/agendar' || pathname === '/agendar/'
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

  return <LandingPage mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />
}
