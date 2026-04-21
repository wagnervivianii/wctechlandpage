import { useMemo, useState } from 'react'

import { ClientApiError, clientApiClient } from '../../services/ClientApiClient'
import type {
  ClientPortalWorkspaceFileItem,
  ClientPortalWorkspaceFileUploadResponse,
  ClientPortalWorkspaceResponse,
} from '../../types/client'

type ClientPortalFilesSectionProps = {
  token: string
  workspace: ClientPortalWorkspaceResponse
  files: ClientPortalWorkspaceFileItem[]
  loading: boolean
  error: string
  onUnauthorized: () => void
  onUploadSuccess: (response: ClientPortalWorkspaceFileUploadResponse) => void
  onRefresh: () => Promise<void>
  lastUpload: ClientPortalWorkspaceFileUploadResponse | null
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
      return 'Aguardando aprovação'
    case 'approved':
      return 'Aprovado'
    case 'rejected':
      return 'Rejeitado'
    case 'archived':
      return 'Arquivado'
    default:
      return value
  }
}

export default function ClientPortalFilesSection({
  token,
  workspace,
  files,
  loading,
  error,
  onUnauthorized,
  onUploadSuccess,
  onRefresh,
  lastUpload: externalLastUpload,
}: ClientPortalFilesSectionProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [selectedMeetingId, setSelectedMeetingId] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [description, setDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [localError, setLocalError] = useState('')
  const [localLastUpload, setLocalLastUpload] = useState<ClientPortalWorkspaceFileUploadResponse | null>(null)

  const meetingsById = useMemo(
    () => new Map(workspace.meetings.map((meeting) => [meeting.id, meeting.meeting_label])),
    [workspace.meetings],
  )

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!selectedFile) {
      setLocalError('Selecione um arquivo antes de enviar para análise.')
      return
    }

    try {
      setSubmitting(true)
      setLocalError('')
      setSuccessMessage('')

      const response = await clientApiClient.uploadWorkspaceFile(token, {
        file: selectedFile,
        meetingId: selectedMeetingId ? Number(selectedMeetingId) : null,
        displayName,
        description,
      })

      setLocalLastUpload(response)
      onUploadSuccess(response)
      setSuccessMessage(response.message)
      setSelectedFile(null)
      setSelectedMeetingId('')
      setDisplayName('')
      setDescription('')
      await onRefresh()
    } catch (uploadError) {
      if (uploadError instanceof ClientApiError && uploadError.status === 401) {
        onUnauthorized()
        return
      }

      setLocalError(uploadError instanceof Error ? uploadError.message : 'Não foi possível enviar o arquivo agora.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <form onSubmit={handleSubmit} className="rounded-[1.3rem] border border-white/10 bg-white/5 p-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-cyan-300">Novo envio</p>
              <h3 className="mt-2 text-lg font-semibold text-white">Anexar arquivo para análise</h3>
            </div>
            <span className="rounded-full bg-white/8 px-3 py-1 text-[0.68rem] font-semibold text-slate-300 ring-1 ring-white/10">
              PDF, Excel, Word, PowerPoint ou TXT
            </span>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-slate-400">Arquivo</span>
              <input
                type="file"
                accept=".pdf,.xls,.xlsx,.csv,.ppt,.pptx,.doc,.docx,.txt"
                onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)}
                className="mt-2 block w-full rounded-[1rem] border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-slate-100 file:mr-4 file:rounded-full file:border-0 file:bg-cyan-400/12 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-cyan-100"
              />
            </label>

            <label className="block">
              <span className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-slate-400">Vincular à reunião</span>
              <select
                value={selectedMeetingId}
                onChange={(event) => setSelectedMeetingId(event.target.value)}
                className="mt-2 block w-full rounded-[1rem] border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-slate-100"
              >
                <option value="">Sem vínculo específico</option>
                {workspace.meetings.map((meeting) => (
                  <option key={meeting.id} value={meeting.id}>
                    {meeting.meeting_label}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-slate-400">Nome de exibição</span>
              <input
                type="text"
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
                placeholder="Ex.: briefing atualizado"
                className="mt-2 block w-full rounded-[1rem] border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500"
              />
            </label>

            <label className="block md:col-span-2">
              <span className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-slate-400">Descrição</span>
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                rows={4}
                placeholder="Explique rapidamente o contexto do material enviado."
                className="mt-2 block w-full rounded-[1rem] border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500"
              />
            </label>
          </div>

          {localError ? <div className="mt-4 rounded-[1rem] border border-rose-400/30 bg-rose-500/10 p-3 text-sm text-rose-100">{localError}</div> : null}
          {successMessage ? <div className="mt-4 rounded-[1rem] border border-emerald-300/25 bg-emerald-500/10 p-3 text-sm text-emerald-100">{successMessage}</div> : null}

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm leading-7 text-slate-300">
              O arquivo entra primeiro em análise administrativa. Depois da aprovação, ele passa a compor a pasta correta do seu workspace.
            </p>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-full border border-cyan-300/25 bg-cyan-400/12 px-5 py-2.5 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-400/18 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? 'Enviando...' : 'Enviar para análise'}
            </button>
          </div>
        </form>

        <div className="space-y-4">
          <div className="rounded-[1.3rem] border border-white/10 bg-white/5 p-4">
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-slate-400">Como este fluxo funciona</p>
            <ul className="mt-3 space-y-3 text-sm leading-7 text-slate-200">
              <li>1. Você envia o material e informa o contexto do anexo.</li>
              <li>2. A equipe da WV Tech Solutions revisa o conteúdo e valida o destino do arquivo.</li>
              <li>3. Após aprovação, o material passa a ficar disponível no seu portal e na pasta correta do Drive.</li>
            </ul>
          </div>

          <div className="rounded-[1.3rem] border border-amber-300/20 bg-amber-500/10 p-4">
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-amber-100">Último envio</p>
            {(externalLastUpload || localLastUpload) ? (
              <div className="mt-3 space-y-2 text-sm text-slate-100">
                <p className="font-semibold">{(externalLastUpload || localLastUpload)?.item.display_name || (externalLastUpload || localLastUpload)?.item.drive_file_name || 'Arquivo enviado'}</p>
                <p className="text-slate-200">Status atual: {getReviewStatusLabel((externalLastUpload || localLastUpload)?.review_status || 'pending_review')}</p>
                <p className="text-slate-300">Enviado em {formatDateTime((externalLastUpload || localLastUpload)?.item.created_at || null)}</p>
              </div>
            ) : (
              <p className="mt-3 text-sm leading-7 text-slate-200">Assim que você enviar um novo material, o retorno do status aparecerá aqui.</p>
            )}
          </div>
        </div>
      </div>

      {error ? <div className="rounded-[1.2rem] border border-rose-400/30 bg-rose-500/10 p-4 text-sm text-rose-100">{error}</div> : null}

      <div className="rounded-[1.3rem] border border-white/10 bg-white/5 p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-cyan-300">Arquivos aprovados</p>
            <h3 className="mt-2 text-lg font-semibold text-white">Materiais já liberados no portal</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-white/8 px-3 py-1 text-[0.68rem] font-semibold text-slate-300 ring-1 ring-white/10">
              {files.length} arquivo{files.length !== 1 ? 's' : ''}
            </span>
            <button
              type="button"
              onClick={() => void onRefresh()}
              disabled={loading}
              className="rounded-full border border-white/12 px-4 py-2 text-sm font-medium text-white transition hover:border-cyan-300/35 hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Atualizando...' : 'Atualizar lista'}
            </button>
          </div>
        </div>

        {loading ? <div className="mt-4 rounded-[1.1rem] border border-white/10 bg-slate-950/50 p-4 text-sm text-slate-300">Carregando arquivos aprovados do seu workspace...</div> : null}

        {!loading && files.length === 0 ? (
          <div className="mt-4 rounded-[1.1rem] border border-white/10 bg-slate-950/50 p-4 text-sm text-slate-300">
            Ainda não há arquivos aprovados e visíveis no seu portal.
          </div>
        ) : null}

        {!loading && files.length > 0 ? (
          <div className="mt-4 grid gap-3 lg:grid-cols-2">
            {files.map((file) => (
              <article key={file.id} className="rounded-[1.15rem] border border-white/10 bg-slate-950/50 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-slate-400">{getFileCategoryLabel(file.file_category)}</p>
                    <h4 className="mt-2 text-sm font-semibold text-white">{file.display_name || file.drive_file_name || 'Arquivo aprovado'}</h4>
                  </div>
                  <span className="rounded-full bg-emerald-500/12 px-3 py-1 text-[0.68rem] font-semibold text-emerald-100 ring-1 ring-emerald-300/25">
                    Aprovado
                  </span>
                </div>

                {file.description ? <p className="mt-3 text-sm leading-7 text-slate-200">{file.description}</p> : null}

                <div className="mt-4 space-y-2 text-sm text-slate-300">
                  <p>Vínculo: {file.meeting_id ? meetingsById.get(file.meeting_id) || `Reunião #${file.meeting_id}` : 'Sem reunião específica'}</p>
                  <p>Tipo: {file.mime_type || file.file_extension || 'Não informado'}</p>
                  <p>Tamanho: {formatFileSize(file.file_size_bytes)}</p>
                  <p>Liberado em: {formatDateTime(file.created_at)}</p>
                </div>

                {file.drive_web_view_link ? (
                  <a
                    href={file.drive_web_view_link}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-4 inline-flex rounded-full border border-cyan-300/20 bg-cyan-400/10 px-4 py-2 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-400/18"
                  >
                    Abrir arquivo
                  </a>
                ) : null}
              </article>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  )
}
