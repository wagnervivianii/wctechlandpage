import AdminAvailabilityManager from '../components/admin/AdminAvailabilityManager'
import AdminLoginCard from '../components/admin/AdminLoginCard'
import AdminHistoryEventDetail from '../components/admin/AdminHistoryEventDetail'
import { useAdminAuth } from '../hooks/useAdminAuth'
import { useAdminAvailability } from '../hooks/useAdminAvailability'
import { useAdminBookingReview } from '../hooks/useAdminBookingReview'
import { useAdminClientWorkspaces } from '../hooks/useAdminClientWorkspaces'

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
    loadDays,
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


  const {
    workspaces,
    loadingWorkspaces,
    workspaceError,
    generatingWorkspaceId,
    generatedInviteLinks,
    syncingDriveWorkspaceId,
    syncingGoogleWorkspaceId,
    lastGoogleSyncByWorkspace,
    loadWorkspaces,
    loadWorkspaceFiles,
    generateWorkspaceInvite,
    syncWorkspaceDrive,
    syncPendingGoogleArtifacts,
    workspaceFilesByWorkspace,
    loadingWorkspaceFilesByWorkspace,
    uploadingWorkspaceFileId,
    processingWorkspaceFileActionKey,
    processingWorkspaceLifecycleKey,
    uploadWorkspaceFile,
    approveWorkspaceFile,
    rejectWorkspaceFile,
    archiveWorkspaceFile,
    deleteWorkspaceFile,
    suspendWorkspace,
    archiveWorkspace,
    reactivateWorkspace,
  } = useAdminClientWorkspaces({
    token,
    enabled: isAuthenticated,
    onUnauthorized: logout,
  })

  const {
    pendingReviewItems,
    loadingPendingReview,
    submittingReviewId,
    reviewError,
    reviewSuccessMessage,
    approveBooking,
    cancelBooking,
    rejectBooking,
  } = useAdminBookingReview({
    token,
    enabled: isAuthenticated,
    onUnauthorized: logout,
    onDecisionApplied: async () => {
      await loadDays()
      await loadWorkspaces()
    },
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

        <main className="mx-auto max-w-7xl px-4 pb-16 pt-8 sm:px-6 lg:px-8 lg:pb-24 lg:pt-12">
          {authLoading ? (
            <div className="mx-auto max-w-xl rounded-[1.8rem] border border-white/10 bg-slate-900/80 p-5 text-sm text-slate-300 shadow-[0_18px_60px_rgba(2,6,23,0.38)] backdrop-blur sm:p-6">
              Validando sessão administrativa...
            </div>
          ) : null}

          {!authLoading && !isAuthenticated ? (
            <div className="mx-auto max-w-xl">
              <AdminLoginCard loading={loginLoading} error={authError} onSubmit={login} />
            </div>
          ) : null}

          {!authLoading && isAuthenticated && currentUser && historyEventId !== null ? (
            <div className="mx-auto max-w-6xl">
              <AdminHistoryEventDetail history={history} eventId={historyEventId} submitting={submittingReviewId === historyEventId} onCancel={cancelBooking} />
            </div>
          ) : null}

          {!authLoading && isAuthenticated && currentUser && historyEventId === null ? (
            <AdminAvailabilityManager
              username={currentUser.username}
              days={days}
              history={history}
              pendingReviewItems={pendingReviewItems}
              loadingDays={loadingDays}
              loadingPendingReview={loadingPendingReview}
              submitting={submitting}
              submittingReviewId={submittingReviewId}
              error={availabilityError}
              successMessage={successMessage}
              reviewError={reviewError}
              reviewSuccessMessage={reviewSuccessMessage}
              onLogout={logout}
              onCreateDay={upsertDay}
              onToggleDay={toggleDay}
              onCreateSlot={createSlot}
              onUpdateSlot={updateSlot}
              onDeleteSlot={deleteSlot}
              onApproveBooking={approveBooking}
              onRejectBooking={rejectBooking}
              clientWorkspaces={workspaces}
              loadingClientWorkspaces={loadingWorkspaces}
              clientWorkspaceError={workspaceError}
              generatingWorkspaceId={generatingWorkspaceId}
              generatedInviteLinks={generatedInviteLinks}
              syncingDriveWorkspaceId={syncingDriveWorkspaceId}
              syncingGoogleWorkspaceId={syncingGoogleWorkspaceId}
              lastGoogleSyncByWorkspace={lastGoogleSyncByWorkspace}
              onGenerateWorkspaceInvite={generateWorkspaceInvite}
              onSyncWorkspaceDrive={syncWorkspaceDrive}
              onSyncPendingGoogleArtifacts={syncPendingGoogleArtifacts}
              workspaceFilesByWorkspace={workspaceFilesByWorkspace}
              loadingWorkspaceFilesByWorkspace={loadingWorkspaceFilesByWorkspace}
              uploadingWorkspaceFileId={uploadingWorkspaceFileId}
              processingWorkspaceFileActionKey={processingWorkspaceFileActionKey}
              processingWorkspaceLifecycleKey={processingWorkspaceLifecycleKey}
              onLoadWorkspaceFiles={loadWorkspaceFiles}
              onUploadWorkspaceFile={uploadWorkspaceFile}
              onApproveWorkspaceFile={approveWorkspaceFile}
              onRejectWorkspaceFile={rejectWorkspaceFile}
              onArchiveWorkspaceFile={archiveWorkspaceFile}
              onDeleteWorkspaceFile={deleteWorkspaceFile}
              onSuspendWorkspace={suspendWorkspace}
              onArchiveWorkspace={archiveWorkspace}
              onReactivateWorkspace={reactivateWorkspace}
            />
          ) : null}
        </main>
      </div>
    </div>
  )
}