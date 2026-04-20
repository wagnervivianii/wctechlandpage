import { useEffect, useState } from 'react'

import ClientActivationPage from './pages/ClientActivationPage'
import ClientForgotPasswordPage from './pages/ClientForgotPasswordPage'
import ClientGoogleCallbackPage from './pages/ClientGoogleCallbackPage'
import ClientLoginPage from './pages/ClientLoginPage'
import ClientPortalPage from './pages/ClientPortalPage'
import ClientResetPasswordPage from './pages/ClientResetPasswordPage'
import AdminPage from './pages/AdminPage'
import BookingConfirmationPage from './pages/BookingConfirmationPage.tsx'
import BookingPage from './pages/BookingPage'
import LandingPage from './pages/LandingPage'

function isSchedulePath(pathname: string) {
  return pathname === '/agendar' || pathname === '/agendar/'
}

function isBookingConfirmationPath(pathname: string) {
  return pathname === '/agendar/confirmacao' || pathname === '/agendar/confirmacao/'
}

function isAdminPath(pathname: string) {
  return pathname === '/admin' || pathname === '/admin/'
}

function getAdminHistoryEventId(pathname: string) {
  const match = pathname.match(/^\/admin\/historico\/(\d+)\/?$/)
  if (!match) {
    return null
  }

  return Number(match[1])
}

function isClientPortalPath(pathname: string) {
  return pathname === '/cliente' || pathname === '/cliente/'
}

function isClientLoginPath(pathname: string) {
  return pathname === '/cliente/login' || pathname === '/cliente/login/'
}

function isClientForgotPasswordPath(pathname: string) {
  return pathname === '/cliente/esqueci-senha' || pathname === '/cliente/esqueci-senha/'
}

function isClientResetPasswordPath(pathname: string) {
  return pathname === '/cliente/redefinir-senha' || pathname === '/cliente/redefinir-senha/'
}

function isClientGoogleCallbackPath(pathname: string) {
  return pathname === '/cliente/google/callback' || pathname === '/cliente/google/callback/'
}

function getClientActivationToken(pathname: string) {
  const match = pathname.match(/^\/cliente\/ativacao\/([^/]+)\/?$/)
  return match?.[1] ?? null
}

export default function App() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [pathname, setPathname] = useState(() => window.location.pathname)

  useEffect(() => {
    const handlePopState = () => setPathname(window.location.pathname)
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  const historyEventId = getAdminHistoryEventId(pathname)
  const clientActivationToken = getClientActivationToken(pathname)

  if (isSchedulePath(pathname)) {
    return <BookingPage />
  }

  if (isBookingConfirmationPath(pathname)) {
    return <BookingConfirmationPage />
  }

  if (isAdminPath(pathname)) {
    return <AdminPage />
  }

  if (historyEventId !== null) {
    return <AdminPage historyEventId={historyEventId} />
  }

  if (isClientPortalPath(pathname)) {
    return <ClientPortalPage />
  }

  if (isClientLoginPath(pathname)) {
    return <ClientLoginPage />
  }

  if (isClientForgotPasswordPath(pathname)) {
    return <ClientForgotPasswordPage />
  }

  if (isClientResetPasswordPath(pathname)) {
    return <ClientResetPasswordPage />
  }

  if (isClientGoogleCallbackPath(pathname)) {
    return <ClientGoogleCallbackPage />
  }

  if (clientActivationToken) {
    return <ClientActivationPage inviteToken={decodeURIComponent(clientActivationToken)} />
  }

  return <LandingPage mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />
}