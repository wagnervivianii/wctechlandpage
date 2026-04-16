import AdminAvailabilityManager from '../components/admin/AdminAvailabilityManager'
import AdminHistoryEventDetail from '../components/admin/AdminHistoryEventDetail'
import AdminLoginCard from '../components/admin/AdminLoginCard'
import { useAdminAuth } from '../hooks/useAdminAuth'
import { useAdminAvailability } from '../hooks/useAdminAvailability'

type AdminPageProps = {
  historyEventId?: number | null
}

export default function AdminPage({ historyEventId = null }: AdminPageProps) {
  const {
    token,
    currentUser,
    authLoading,
    loginLoading,
    authError,
    isAuthenticated,
    login,
    logout,
  } = useAdminAuth()

  const {
    days,
    history,
    loadingDays,
    submitting,
    availabilityError,
    successMessage,
    upsertDay,
    toggleDay,
    createSlot,
    updateSlot,
    deleteSlot,
  } = useAdminAvailability({
    token,
    enabled: isAuthenticated,
    onUnauthorized: logout,
  })

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="hero-shell">
        <div className="hero-grid" aria-hidden="true" />
        <div className="hero-orb hero-orb-cyan" aria-hidden="true" />
        <div className="hero-orb hero-orb-blue" aria-hidden="true" />
        <div className="hero-orb hero-orb-violet" aria-hidden="true" />

        <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/70 backdrop-blur-xl">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
            <a href="/" className="group flex min-w-0 items-center gap-3">
              <div className="logo-wrap shrink-0">
                <img
                  src="/imagens/logo.png"
                  alt="Logo da WV Tech Solutions"
                  className="h-11 w-11 rounded-full object-cover"
                />
              </div>
              <div className="min-w-0">
                <p className="truncate text-[0.72rem] font-semibold uppercase tracking-[0.42em] text-slate-50 sm:text-[0.78rem]">
                  WV Tech Solutions
                </p>
                <p className="hidden truncate text-sm text-slate-400 sm:block">Administração da agenda</p>
              </div>
            </a>

            <div className="flex items-center gap-3">
              <a
                href="/"
                className="rounded-full border border-white/12 px-5 py-2.5 text-sm font-medium text-slate-100 transition hover:border-cyan-400/40 hover:bg-white/5"
              >
                Voltar ao site
              </a>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-4 pb-16 pt-10 sm:px-6 lg:px-8 lg:pb-24 lg:pt-14">
          <div className="mx-auto max-w-4xl">
            {authLoading ? (
              <div className="rounded-[1.8rem] border border-white/10 bg-slate-900/80 p-5 text-sm text-slate-300 shadow-[0_18px_60px_rgba(2,6,23,0.38)] backdrop-blur sm:p-6">
                Validando sessão administrativa...
              </div>
            ) : null}

            {!authLoading && !isAuthenticated ? (
              <AdminLoginCard loading={loginLoading} error={authError} onSubmit={login} />
            ) : null}

            {!authLoading && isAuthenticated && currentUser && historyEventId !== null ? (
              <AdminHistoryEventDetail history={history} eventId={historyEventId} />
            ) : null}

            {!authLoading && isAuthenticated && currentUser && historyEventId === null ? (
              <AdminAvailabilityManager
                username={currentUser.username}
                days={days}
                history={history}
                loadingDays={loadingDays}
                submitting={submitting}
                error={availabilityError}
                successMessage={successMessage}
                onLogout={logout}
                onCreateDay={upsertDay}
                onToggleDay={toggleDay}
                onCreateSlot={createSlot}
                onUpdateSlot={updateSlot}
                onDeleteSlot={deleteSlot}
              />
            ) : null}
          </div>
        </main>
      </div>
    </div>
  )
}