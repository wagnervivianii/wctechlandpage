import { useEffect, useMemo, useState } from 'react'

import type {
  AdminClientWorkspaceFileActionPayload,
  AdminClientWorkspaceFileItem,
  AdminClientWorkspaceFileListResponse,
  AdminClientWorkspaceSummaryItem,
} from '../../types/admin'

type AdminWorkspaceFilesPanelProps = {
  workspace: AdminClientWorkspaceSummaryItem
  fileList: AdminClientWorkspaceFileListResponse | null
  loading: boolean
  uploading: boolean
  processingActionKey: string | null
  onLoadFiles: (workspaceId: number) => Promise<void>
  onUploadFile: (
    workspaceId: number,
    payload: {
      file: File
      meetingId?: number | null
      displayName?: string
      description?: string
      fileCategory?: string
      targetBucket?: string
      visibleToClient?: boolean
    },
  ) => Promise<unknown>
  onApproveFile: (workspaceId: number, fileId: number, payload: AdminClientWorkspaceFileActionPayload) => Promise<unknown>
  onRejectFile: (workspaceId: number, fileId: number, payload: AdminClientWorkspaceFileActionPayload) => Promise<unknown>
  onArchiveFile: (workspaceId: number, fileId: number, payload: AdminClientWorkspaceFileActionPayload) => Promise<unknown>
  onDeleteFile: (workspaceId: number, fileId: number, payload: AdminClientWorkspaceFileActionPayload) => Promise<unknown>
}

function formatDateTime(value: string | null) {
  if (!value) return '—'
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return value
  return parsed.toLocaleString('pt-BR')
}

function formatFileSize(value: number | null) {
  if (!value || value <= 0) return 'Tamanho não informado'

  const units = ['B', 'KB', 'MB', 'GB']
  let size = value
  let unitIndex = 0

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex += 1
  }

  return `${size.toFixed(size >= 10 || unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`
}

function getFileCategoryLabel(value: string) {
  switch (value) {
    case 'client_upload':
      return 'Upload do cliente'
    case 'generated_document':
      return 'Documento gerado'
    case 'admin_material':
      return 'Material administrativo'
    default:
      return value
  }
}

function getReviewStatusLabel(value: string) {
  switch (value) {
    case 'pending_review':
      return 'Aguardando revisão'
    case 'approved':
      return 'Aprovado'
    case 'rejected':
      return 'Rejeitado'
    case 'archived':
      return 'Arquivado'
    case 'deleted':
      return 'Excluído'
    default:
      return value
  }
}

function getReviewStatusClasses(value: string) {
  switch (value) {
    case 'approved':
      return 'bg-emerald-500/12 text-emerald-100 ring-emerald-300/25'
    case 'pending_review':
      return 'bg-amber-500/12 text-amber-100 ring-amber-300/25'
    case 'rejected':
      return 'bg-rose-500/12 text-rose-100 ring-rose-300/25'
    case 'archived':
      return 'bg-violet-500/12 text-violet-100 ring-violet-300/25'
    default:
      return 'bg-white/8 text-slate-300 ring-white/10'
  }
}

function getVisibilityLabel(value: string) {
  switch (value) {
    case 'client_visible':
      return 'Visível ao cliente'
    case 'admin_only':
      return 'Somente admin'
    default:
      return value
  }
}

function getActionKey(action: string, fileId: number) {
  return `${action}:${fileId}`
}

function getDefaultVisibilityForFile(file: AdminClientWorkspaceFileItem) {
  if (file.review_status === 'pending_review') {
    return true
  }

  return file.visibility_scope === 'client_visible'
}

export default function AdminWorkspaceFilesPanel({
  workspace,
  fileList,
  loading,
  uploading,
  processingActionKey,
  onLoadFiles,
  onUploadFile,
  onApproveFile,
  onRejectFile,
  onArchiveFile,
  onDeleteFile,
}: AdminWorkspaceFilesPanelProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [selectedMeetingId, setSelectedMeetingId] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [description, setDescription] = useState('')
  const [fileCategory, setFileCategory] = useState('generated_document')
  const [targetBucket, setTargetBucket] = useState('generated_documents')
  const [visibleToClient, setVisibleToClient] = useState(true)
  const [successMessage, setSuccessMessage] = useState('')
  const [localError, setLocalError] = useState('')
  const [reviewNotesByFileId, setReviewNotesByFileId] = useState<Record<number, string>>({})
  const [visibleToClientByFileId, setVisibleToClientByFileId] = useState<Record<number, boolean>>({})

  useEffect(() => {
    void onLoadFiles(workspace.workspace_id)
  }, [onLoadFiles, workspace.workspace_id])

  const meetingsById = useMemo(
    () => new Map(workspace.meetings.map((meeting) => [meeting.id, meeting.meeting_label])),
    [workspace.meetings],
  )

  const items = fileList?.items ?? []

  async function handleUpload(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!selectedFile) {
      setLocalError('Selecione um arquivo antes de enviar para o workspace.')
      return
    }

    try {
      setLocalError('')
      setSuccessMessage('')
      await onUploadFile(workspace.workspace_id, {
        file: selectedFile,
        meetingId: selectedMeetingId ? Number(selectedMeetingId) : null,
        displayName,
        description,
        fileCategory,
        targetBucket,
        visibleToClient,
      })
      setSuccessMessage('Arquivo administrativo enviado com sucesso.')
      setSelectedFile(null)
      setSelectedMeetingId('')
      setDisplayName('')
      setDescription('')
      setFileCategory('generated_document')
      setTargetBucket('generated_documents')
      setVisibleToClient(true)
    } catch (uploadError) {
      setLocalError(uploadError instanceof Error ? uploadError.message : 'Não foi possível enviar o arquivo administrativo.')
    }
  }

  async function handleAction(
    action: 'approve' | 'reject' | 'archive' | 'delete',
    file: AdminClientWorkspaceFileItem,
  ) {
    const payload: AdminClientWorkspaceFileActionPayload = {
      review_notes: reviewNotesByFileId[file.id]?.trim() || null,
      visible_to_client: visibleToClientByFileId[file.id] ?? getDefaultVisibilityForFile(file),
    }

    try {
      setLocalError('')
      setSuccessMessage('')

      if (action === 'approve') {
        await onApproveFile(workspace.workspace_id, file.id, payload)
        setSuccessMessage('Arquivo aprovado e movimentado para a pasta final.')
      }

      if (action === 'reject') {
        await onRejectFile(workspace.workspace_id, file.id, payload)
        setSuccessMessage('Arquivo rejeitado e mantido fora da área visível ao cliente.')
      }

      if (action === 'archive') {
        await onArchiveFile(workspace.workspace_id, file.id, payload)
        setSuccessMessage('Arquivo arquivado com sucesso.')
      }

      if (action === 'delete') {
        await onDeleteFile(workspace.workspace_id, file.id, payload)
        setSuccessMessage('Arquivo enviado para a lixeira do Google Drive.')
      }
    } catch (actionError) {
      setLocalError(actionError instanceof Error ? actionError.message : 'Não foi possível concluir a ação selecionada.')
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <form onSubmit={handleUpload} className="rounded-[1.2rem] border border-white/10 bg-slate-950/50 p-4 text-sm text-slate-200">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-cyan-300">Upload administrativo</p>
              <h4 className="mt-2 text-base font-semibold text-white">Enviar arquivo direto ao Drive do cliente</h4>
            </div>
            <span className="rounded-full bg-white/8 px-3 py-1 text-[0.68rem] font-semibold text-slate-300 ring-1 ring-white/10">
              {uploading ? 'Enviando...' : 'Fluxo ativo'}
            </span>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <label className="block md:col-span-2">
              <span className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-slate-400">Arquivo</span>
              <input
                type="file"
                accept=".pdf,.xls,.xlsx,.csv,.ppt,.pptx,.doc,.docx,.txt"
                onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)}
                className="mt-2 block w-full rounded-[1rem] border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100 file:mr-4 file:rounded-full file:border-0 file:bg-cyan-400/12 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-cyan-100"
              />
            </label>

            <label className="block">
              <span className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-slate-400">Vincular à reunião</span>
              <select
                value={selectedMeetingId}
                onChange={(event) => setSelectedMeetingId(event.target.value)}
                className="mt-2 block w-full rounded-[1rem] border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100"
              >
                <option value="">Sem reunião específica</option>
                {workspace.meetings.map((meeting) => (
                  <option key={meeting.id} value={meeting.id}>
                    {meeting.meeting_label}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-slate-400">Categoria</span>
              <select
                value={fileCategory}
                onChange={(event) => setFileCategory(event.target.value)}
                className="mt-2 block w-full rounded-[1rem] border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100"
              >
                <option value="generated_document">Documento gerado</option>
                <option value="admin_material">Material administrativo</option>
                <option value="client_upload">Upload do cliente</option>
              </select>
            </label>

            <label className="block">
              <span className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-slate-400">Pasta de destino</span>
              <select
                value={targetBucket}
                onChange={(event) => setTargetBucket(event.target.value)}
                className="mt-2 block w-full rounded-[1rem] border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100"
              >
                <option value="generated_documents">03_generated_documents</option>
                <option value="client_uploads">02_client_uploads</option>
                <option value="archive">04_archive</option>
              </select>
            </label>

            <label className="block">
              <span className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-slate-400">Nome de exibição</span>
              <input
                type="text"
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
                placeholder="Ex.: ata consolidada"
                className="mt-2 block w-full rounded-[1rem] border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500"
              />
            </label>

            <label className="flex items-center gap-3 rounded-[1rem] border border-white/10 bg-white/5 px-4 py-3">
              <input
                type="checkbox"
                checked={visibleToClient}
                onChange={(event) => setVisibleToClient(event.target.checked)}
                className="h-4 w-4 rounded border-white/20 bg-slate-900 text-cyan-400"
              />
              <span className="text-sm text-slate-200">Deixar visível ao cliente logo após o upload</span>
            </label>

            <label className="block md:col-span-2">
              <span className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-slate-400">Descrição</span>
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                rows={4}
                placeholder="Observações sobre o arquivo enviado pelo admin."
                className="mt-2 block w-full rounded-[1rem] border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500"
              />
            </label>
          </div>

          {localError ? <div className="mt-4 rounded-[1rem] border border-rose-400/30 bg-rose-500/10 p-3 text-sm text-rose-100">{localError}</div> : null}
          {successMessage ? <div className="mt-4 rounded-[1rem] border border-emerald-300/25 bg-emerald-500/10 p-3 text-sm text-emerald-100">{successMessage}</div> : null}

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm leading-7 text-slate-300">
              O upload do admin já pode seguir direto para a pasta final definida e, quando necessário, ficar imediatamente visível para o cliente.
            </p>
            <button
              type="submit"
              disabled={uploading}
              className="rounded-full border border-cyan-300/25 bg-cyan-400/12 px-5 py-2.5 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-400/18 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {uploading ? 'Enviando...' : 'Enviar arquivo'}
            </button>
          </div>
        </form>

        <div className="space-y-4">
          <div className="rounded-[1.2rem] border border-white/10 bg-slate-950/50 p-4 text-sm text-slate-200">
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-slate-400">Pastas do workspace</p>
            <div className="mt-4 space-y-2">
              {workspace.drive.client_uploads?.web_view_link ? (
                <a href={workspace.drive.client_uploads.web_view_link} target="_blank" rel="noreferrer" className="block text-cyan-100 underline underline-offset-4">
                  Abrir pasta 02_client_uploads
                </a>
              ) : null}
              {workspace.drive.generated_documents?.web_view_link ? (
                <a href={workspace.drive.generated_documents.web_view_link} target="_blank" rel="noreferrer" className="block text-cyan-100 underline underline-offset-4">
                  Abrir pasta 03_generated_documents
                </a>
              ) : null}
              {workspace.drive.archive?.web_view_link ? (
                <a href={workspace.drive.archive.web_view_link} target="_blank" rel="noreferrer" className="block text-cyan-100 underline underline-offset-4">
                  Abrir pasta 04_archive
                </a>
              ) : null}
            </div>
          </div>

          <div className="rounded-[1.2rem] border border-amber-300/20 bg-amber-500/10 p-4 text-sm text-slate-200">
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-amber-100">Resumo do fluxo</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="rounded-full bg-white/8 px-3 py-1 text-[0.68rem] font-semibold text-slate-100 ring-1 ring-white/10">
                {fileList?.pending_review_count ?? 0} pendente(s)
              </span>
              <span className="rounded-full bg-white/8 px-3 py-1 text-[0.68rem] font-semibold text-slate-100 ring-1 ring-white/10">
                {fileList?.approved_count ?? 0} aprovado(s)
              </span>
              <span className="rounded-full bg-white/8 px-3 py-1 text-[0.68rem] font-semibold text-slate-100 ring-1 ring-white/10">
                {fileList?.rejected_count ?? 0} rejeitado(s)
              </span>
              <span className="rounded-full bg-white/8 px-3 py-1 text-[0.68rem] font-semibold text-slate-100 ring-1 ring-white/10">
                {fileList?.archived_count ?? 0} arquivado(s)
              </span>
            </div>
            <p className="mt-4 leading-7">
              O cliente sobe o material para análise. O admin pode aprovar, rejeitar, arquivar ou excluir, sempre respeitando a pasta final do workspace.
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-[1.2rem] border border-white/10 bg-slate-950/50 p-4 text-sm text-slate-200">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-cyan-300">Lista operacional</p>
            <h4 className="mt-2 text-base font-semibold text-white">Arquivos registrados neste workspace</h4>
          </div>
          <button
            type="button"
            onClick={() => void onLoadFiles(workspace.workspace_id)}
            disabled={loading}
            className="rounded-full border border-white/12 px-4 py-2 text-sm font-medium text-white transition hover:border-cyan-300/35 hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Atualizando...' : 'Atualizar lista'}
          </button>
        </div>

        {loading ? <div className="mt-4 rounded-[1rem] border border-white/10 bg-white/5 p-4 text-sm text-slate-300">Carregando arquivos do workspace...</div> : null}
        {!loading && items.length === 0 ? <div className="mt-4 rounded-[1rem] border border-white/10 bg-white/5 p-4 text-sm text-slate-300">Ainda não há arquivos registrados neste workspace.</div> : null}

        {!loading && items.length > 0 ? (
          <div className="mt-4 space-y-4">
            {items.map((file) => {
              const approveKey = getActionKey('approve', file.id)
              const rejectKey = getActionKey('reject', file.id)
              const archiveKey = getActionKey('archive', file.id)
              const deleteKey = getActionKey('delete', file.id)
              const currentVisibility = visibleToClientByFileId[file.id] ?? getDefaultVisibilityForFile(file)

              return (
                <article key={file.id} className="rounded-[1.15rem] border border-white/10 bg-white/5 p-4">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-slate-400">{getFileCategoryLabel(file.file_category)}</p>
                      <h5 className="mt-2 text-sm font-semibold text-white">{file.display_name || file.drive_file_name || 'Arquivo do workspace'}</h5>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <span className={`rounded-full px-3 py-1 text-[0.68rem] font-semibold ring-1 ${getReviewStatusClasses(file.review_status)}`}>
                        {getReviewStatusLabel(file.review_status)}
                      </span>
                      <span className="rounded-full bg-white/8 px-3 py-1 text-[0.68rem] font-semibold text-slate-300 ring-1 ring-white/10">
                        {getVisibilityLabel(file.visibility_scope)}
                      </span>
                    </div>
                  </div>

                  {file.description ? <p className="mt-3 text-sm leading-7 text-slate-200">{file.description}</p> : null}

                  <div className="mt-4 grid gap-3 lg:grid-cols-2">
                    <div className="rounded-[1rem] border border-white/10 bg-slate-950/50 p-3 text-sm text-slate-300">
                      <p>Origem: {file.uploaded_by_role === 'client' ? 'Cliente' : 'Admin'}</p>
                      <p>Reunião: {file.meeting_id ? meetingsById.get(file.meeting_id) || `Reunião #${file.meeting_id}` : 'Sem vínculo específico'}</p>
                      <p>Tamanho: {formatFileSize(file.file_size_bytes)}</p>
                      <p>Criado em: {formatDateTime(file.created_at)}</p>
                    </div>
                    <div className="rounded-[1rem] border border-white/10 bg-slate-950/50 p-3 text-sm text-slate-300">
                      <p>Revisado em: {formatDateTime(file.reviewed_at)}</p>
                      <p>Aprovado em: {formatDateTime(file.approved_at)}</p>
                      <p>Arquivado em: {formatDateTime(file.archived_at)}</p>
                      <p>Nome no Drive: {file.drive_file_name || 'Não informado'}</p>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_auto]">
                    <div className="space-y-3">
                      <label className="block">
                        <span className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-slate-400">Observação da revisão</span>
                        <textarea
                          value={reviewNotesByFileId[file.id] ?? file.review_notes ?? ''}
                          onChange={(event) => setReviewNotesByFileId((current) => ({ ...current, [file.id]: event.target.value }))}
                          rows={3}
                          className="mt-2 block w-full rounded-[1rem] border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-slate-100"
                        />
                      </label>

                      <label className="flex items-center gap-3 rounded-[1rem] border border-white/10 bg-slate-950/50 px-4 py-3">
                        <input
                          type="checkbox"
                          checked={currentVisibility}
                          onChange={(event) => setVisibleToClientByFileId((current) => ({ ...current, [file.id]: event.target.checked }))}
                          className="h-4 w-4 rounded border-white/20 bg-slate-900 text-cyan-400"
                        />
                        <span className="text-sm text-slate-200">Manter visível ao cliente quando aprovado</span>
                      </label>
                    </div>

                    <div className="flex flex-col gap-2">
                      {(file.review_status === 'pending_review' || file.review_status === 'rejected' || file.review_status === 'archived') ? (
                        <button
                          type="button"
                          onClick={() => void handleAction('approve', file)}
                          disabled={processingActionKey === approveKey}
                          className="rounded-full border border-emerald-300/25 bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-100 transition hover:bg-emerald-500/18 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {processingActionKey === approveKey ? 'Aprovando...' : 'Aprovar'}
                        </button>
                      ) : null}

                      {(file.review_status === 'pending_review' || file.review_status === 'approved') ? (
                        <button
                          type="button"
                          onClick={() => void handleAction('reject', file)}
                          disabled={processingActionKey === rejectKey}
                          className="rounded-full border border-rose-300/25 bg-rose-500/10 px-4 py-2 text-sm font-semibold text-rose-100 transition hover:bg-rose-500/18 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {processingActionKey === rejectKey ? 'Rejeitando...' : 'Rejeitar'}
                        </button>
                      ) : null}

                      {file.review_status !== 'archived' && file.review_status !== 'deleted' ? (
                        <button
                          type="button"
                          onClick={() => void handleAction('archive', file)}
                          disabled={processingActionKey === archiveKey}
                          className="rounded-full border border-violet-300/25 bg-violet-500/10 px-4 py-2 text-sm font-semibold text-violet-100 transition hover:bg-violet-500/18 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {processingActionKey === archiveKey ? 'Arquivando...' : 'Arquivar'}
                        </button>
                      ) : null}

                      {file.review_status !== 'deleted' ? (
                        <button
                          type="button"
                          onClick={() => void handleAction('delete', file)}
                          disabled={processingActionKey === deleteKey}
                          className="rounded-full border border-white/12 px-4 py-2 text-sm font-semibold text-white transition hover:border-rose-300/35 hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {processingActionKey === deleteKey ? 'Excluindo...' : 'Excluir'}
                        </button>
                      ) : null}

                      {file.drive_web_view_link ? (
                        <a
                          href={file.drive_web_view_link}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-full border border-cyan-300/25 bg-cyan-400/10 px-4 py-2 text-center text-sm font-semibold text-cyan-100 transition hover:bg-cyan-400/18"
                        >
                          Abrir no Drive
                        </a>
                      ) : null}
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        ) : null}
      </div>
    </div>
  )
}
