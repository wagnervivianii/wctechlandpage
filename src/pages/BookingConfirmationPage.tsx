import { useMemo } from 'react'

type ConfirmationStatus = 'success' | 'already-confirmed' | 'expired' | 'invalid' | 'error'

function getStatusFromLocation(): ConfirmationStatus {
  const params = new URLSearchParams(window.location.search)
  const status = params.get('status')

  if (
    status === 'success' ||
    status === 'already-confirmed' ||
    status === 'expired' ||
    status === 'invalid' ||
    status === 'error'
  ) {
    return status
  }

  return 'error'
}

function getCopy(status: ConfirmationStatus) {
  switch (status) {
    case 'success':
      return {
        eyebrow: 'Confirmação concluída',
        title: 'Solicitação confirmada com sucesso',
        body: [
          'Recebemos a confirmação do seu endereço de e-mail e sua solicitação foi encaminhada para validação da nossa equipe.',
          'Após a análise, você receberá a confirmação da reunião, o link do Google Meet agendado, uma mensagem de confirmação via WhatsApp e o acesso à sua área do cliente, onde ficarão disponíveis os registros das reuniões e suas transcrições durante a vigência do projeto.',
          'Agradecemos pelo seu contato. Em breve retornaremos com a continuidade do atendimento.',
        ],
      }
    case 'already-confirmed':
      return {
        eyebrow: 'Confirmação já registrada',
        title: 'Este endereço já foi confirmado',
        body: [
          'Esta solicitação já havia sido confirmada anteriormente e permanece registrada para análise administrativa.',
          'Se necessário, nossa equipe continuará o atendimento pelos canais já informados no pedido.',
        ],
      }
    case 'expired':
      return {
        eyebrow: 'Link expirado',
        title: 'O link de confirmação expirou',
        body: [
          'O prazo de confirmação deste pedido foi encerrado e o link utilizado não está mais válido.',
          'Se desejar prosseguir, volte para a agenda pública e envie uma nova solicitação.',
        ],
      }
    case 'invalid':
      return {
        eyebrow: 'Link inválido',
        title: 'Não foi possível validar esta solicitação',
        body: [
          'O link utilizado não corresponde a uma confirmação ativa em nosso sistema.',
          'Recomendamos retornar à agenda pública e gerar um novo pedido, se necessário.',
        ],
      }
    default:
      return {
        eyebrow: 'Indisponibilidade temporária',
        title: 'Não foi possível concluir a confirmação',
        body: [
          'Houve uma indisponibilidade momentânea ao processar este link de confirmação.',
          'Tente novamente em instantes. Se o problema persistir, entre em contato conosco pelos canais oficiais da WV Tech Solutions.',
        ],
      }
  }
}

export default function BookingConfirmationPage() {
  const status = useMemo(() => getStatusFromLocation(), [])
  const copy = useMemo(() => getCopy(status), [status])

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
                <p className="hidden truncate text-sm text-slate-400 sm:block">
                  Confirmação de solicitação
                </p>
              </div>
            </a>

            <a
              href="/"
              className="rounded-full border border-white/12 px-5 py-2.5 text-sm font-medium text-slate-100 transition hover:border-cyan-400/40 hover:bg-white/5"
            >
              Voltar ao site
            </a>
          </div>
        </header>

        <main className="mx-auto flex min-h-[calc(100vh-88px)] max-w-7xl items-center px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
          <section className="mx-auto w-full max-w-3xl rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-[0_20px_70px_rgba(2,6,23,0.36)] backdrop-blur sm:p-8 lg:p-10">
            <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/8 px-4 py-2 text-[0.68rem] font-semibold uppercase tracking-[0.34em] text-cyan-300 shadow-[0_0_20px_rgba(34,211,238,0.14)] sm:text-[0.72rem]">
                <span className="h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_12px_rgba(34,211,238,0.9)]" />
                {copy.eyebrow}
              </div>

              <img
                src="/imagens/logo.png"
                alt="WV Tech Solutions"
                className="mt-8 h-20 w-20 rounded-full object-cover shadow-[0_0_40px_rgba(34,211,238,0.18)] sm:h-24 sm:w-24"
              />

              <h1 className="mt-8 text-balance text-3xl font-semibold leading-[1.02] tracking-[-0.04em] text-white sm:text-4xl lg:text-5xl">
                {copy.title}
              </h1>

              <div className="mt-6 space-y-4">
                {copy.body.map((paragraph) => (
                  <p key={paragraph} className="text-pretty text-base leading-8 text-slate-300 sm:text-lg">
                    {paragraph}
                  </p>
                ))}
              </div>

              <div className="mt-8 flex w-full flex-col items-center justify-center gap-3 sm:flex-row">
                <a
                  href="/agendar"
                  className="w-full rounded-full bg-white px-6 py-3.5 text-center text-sm font-semibold text-slate-950 transition hover:bg-slate-200 sm:w-auto"
                >
                  Voltar para agenda
                </a>
                <a
                  href="/"
                  className="w-full rounded-full border border-white/10 bg-white/5 px-6 py-3.5 text-center text-sm font-semibold text-white transition hover:border-cyan-300/30 hover:bg-white/10 sm:w-auto"
                >
                  Ir para a página inicial
                </a>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}