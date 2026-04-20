import type { Dispatch, SetStateAction } from 'react'

const services = [
  {
    index: '01',
    title: 'Automação de processos',
    description: 'Fluxos mais rápidos, menos retrabalho e operação mais previsível.',
  },
  {
    index: '02',
    title: 'Dados e integração',
    description: 'Conecte fontes, organize informações e destrave visão real do negócio.',
  },
  {
    index: '03',
    title: 'BI e inteligência operacional',
    description: 'Dashboards, indicadores e leitura acionável para decidir com clareza.',
  },
]

const technologies = ['Python', 'SQL', 'Power BI', 'React', 'APIs', 'Cloud']

const differentials = [
  'Percepção de negócio antes da tecnologia',
  'Entrega pensada para operação real',
  'Experiência em dados, automação e integração',
]

const navigation = [
  { label: 'Serviços', href: '#servicos' },
  { label: 'Tecnologias', href: '#tecnologias' },
  { label: 'Diferenciais', href: '#diferenciais' },
  { label: 'Contato', href: '#contato' },
]

const quickAccessLinks = [
  { label: 'Cliente', href: '/cliente/login' },
  { label: 'Admin', href: '/admin' },
]

type LandingPageProps = {
  mobileMenuOpen: boolean
  setMobileMenuOpen: Dispatch<SetStateAction<boolean>>
}

export default function LandingPage({ mobileMenuOpen, setMobileMenuOpen }: LandingPageProps) {
  const closeMobileMenu = () => setMobileMenuOpen(false)

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="hero-shell">
        <div className="hero-grid" aria-hidden="true" />
        <div className="hero-orb hero-orb-cyan" aria-hidden="true" />
        <div className="hero-orb hero-orb-blue" aria-hidden="true" />
        <div className="hero-orb hero-orb-violet" aria-hidden="true" />

        <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/70 backdrop-blur-xl">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
            <a href="#top" className="group flex min-w-0 items-center gap-3">
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
                  Dados, automação e percepção de negócio
                </p>
              </div>
            </a>

            <nav className="hidden items-center gap-7 text-sm text-slate-300 lg:flex">
              {navigation.map((item) => (
                <a key={item.label} href={item.href} className="transition hover:text-cyan-300">
                  {item.label}
                </a>
              ))}
              {quickAccessLinks.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="rounded-full border border-white/10 px-4 py-2 text-sm font-medium text-slate-100 transition hover:border-cyan-300/30 hover:bg-white/5"
                >
                  {item.label}
                </a>
              ))}
            </nav>

            <div className="hidden items-center gap-3 md:flex">
              <a
                href="/cliente/login"
                className="rounded-full border border-white/12 px-5 py-2.5 text-sm font-medium text-slate-100 transition hover:border-cyan-400/40 hover:bg-white/5"
              >
                Área do cliente
              </a>
              <a
                href="/admin"
                className="rounded-full border border-white/12 px-5 py-2.5 text-sm font-medium text-slate-100 transition hover:border-cyan-400/40 hover:bg-white/5 lg:hidden"
              >
                Admin
              </a>
              <a
                href="/agendar"
                className="rounded-full border border-white/12 px-5 py-2.5 text-sm font-medium text-slate-100 transition hover:border-cyan-400/40 hover:bg-white/5"
              >
                Agendar conversa
              </a>
              <a
                href="#servicos"
                className="rounded-full bg-cyan-400 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
              >
                Ver solução
              </a>
            </div>

            <button
              type="button"
              aria-label="Abrir menu"
              aria-expanded={mobileMenuOpen}
              onClick={() => setMobileMenuOpen((current) => !current)}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-white/12 bg-white/5 text-slate-50 transition hover:border-cyan-300/40 hover:bg-white/10 md:hidden"
            >
              <div className="flex flex-col items-center gap-1.5">
                <span
                  className={`block h-0.5 w-5 rounded-full bg-current transition ${
                    mobileMenuOpen ? 'translate-y-2 rotate-45' : ''
                  }`}
                />
                <span
                  className={`block h-0.5 w-5 rounded-full bg-current transition ${
                    mobileMenuOpen ? 'opacity-0' : ''
                  }`}
                />
                <span
                  className={`block h-0.5 w-5 rounded-full bg-current transition ${
                    mobileMenuOpen ? '-translate-y-2 -rotate-45' : ''
                  }`}
                />
              </div>
            </button>
          </div>

          <div
            className={`border-t border-white/8 bg-slate-950/95 px-4 py-4 backdrop-blur-xl transition md:hidden ${
              mobileMenuOpen ? 'block' : 'hidden'
            }`}
          >
            <nav className="mx-auto flex max-w-7xl flex-col gap-2">
              {navigation.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={closeMobileMenu}
                  className="rounded-2xl border border-white/8 bg-white/5 px-4 py-3 text-sm font-medium text-slate-100 transition hover:border-cyan-300/30 hover:bg-white/10"
                >
                  {item.label}
                </a>
              ))}
              <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
                <a
                  href="/agendar"
                  onClick={closeMobileMenu}
                  className="rounded-full border border-white/12 px-5 py-3 text-center text-sm font-medium text-slate-100 transition hover:border-cyan-400/40 hover:bg-white/5"
                >
                  Agendar conversa
                </a>
                <a
                  href="/cliente/login"
                  onClick={closeMobileMenu}
                  className="rounded-full border border-white/12 px-5 py-3 text-center text-sm font-medium text-slate-100 transition hover:border-cyan-400/40 hover:bg-white/5"
                >
                  Área do cliente
                </a>
                <a
                  href="/admin"
                  onClick={closeMobileMenu}
                  className="rounded-full border border-white/12 px-5 py-3 text-center text-sm font-medium text-slate-100 transition hover:border-cyan-400/40 hover:bg-white/5"
                >
                  Admin
                </a>
                <a
                  href="#servicos"
                  onClick={closeMobileMenu}
                  className="rounded-full bg-cyan-400 px-5 py-3 text-center text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
                >
                  Ver solução
                </a>
              </div>
            </nav>
          </div>
        </header>

        <main id="top">
          <section className="mx-auto max-w-7xl px-4 pb-16 pt-10 sm:px-6 lg:px-8 lg:pb-24 lg:pt-16">
            <div className="mx-auto flex max-w-4xl flex-col items-center text-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/8 px-4 py-2 text-[0.68rem] font-semibold uppercase tracking-[0.34em] text-cyan-300 shadow-[0_0_20px_rgba(34,211,238,0.14)] sm:text-[0.72rem]">
                <span className="h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_12px_rgba(34,211,238,0.9)]" />
                Estratégia, dados e execução
              </div>

              <h1 className="mt-7 max-w-5xl text-balance text-center text-4xl font-semibold leading-[0.95] tracking-[-0.04em] text-white sm:text-5xl md:text-6xl lg:text-7xl">
                Soluções digitais com{' '}
                <span className="bg-linear-to-r from-cyan-300 via-sky-400 to-indigo-400 bg-clip-text text-transparent">
                  leitura real do negócio.
                </span>
              </h1>

              <p className="mt-6 max-w-3xl text-pretty text-base leading-8 text-slate-300 sm:text-lg">
                A WV Tech Solutions conecta automação, dados e produto para transformar
                operação em escala, clareza e decisão. Não é só tecnologia. É percepção
                aplicada ao que faz o negócio girar.
              </p>

              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:flex-wrap">
                <a
                  href="/agendar"
                  className="w-full rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-slate-950 transition hover:bg-slate-200 sm:w-auto"
                >
                  Agendar diagnóstico
                </a>
                <a
                  href="/cliente/login"
                  className="w-full rounded-full border border-cyan-300/25 bg-cyan-400/10 px-6 py-3.5 text-sm font-semibold text-cyan-100 transition hover:border-cyan-300/40 hover:bg-cyan-400/14 sm:w-auto"
                >
                  Área do cliente
                </a>
                <a
                  href="#servicos"
                  className="w-full rounded-full border border-white/10 bg-white/5 px-6 py-3.5 text-sm font-semibold text-white transition hover:border-cyan-300/30 hover:bg-white/10 sm:w-auto"
                >
                  Explorar serviços
                </a>
              </div>
            </div>

            <div className="mt-10 grid gap-6 lg:mt-14 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:items-start">
              <div className="order-2 space-y-5 lg:order-1">
                <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
                  {services.map((service) => (
                    <article
                      key={service.index}
                      className="rounded-[1.6rem] border border-white/10 bg-white/5 p-5 shadow-[0_16px_50px_rgba(2,6,23,0.28)] backdrop-blur"
                    >
                      <p className="text-xs font-semibold uppercase tracking-[0.35em] text-cyan-300">
                        {service.index}
                      </p>
                      <h2 className="mt-4 text-lg font-medium text-white">{service.title}</h2>
                      <p className="mt-3 text-sm leading-7 text-slate-300">{service.description}</p>
                    </article>
                  ))}
                </div>

                <div className="rounded-[1.75rem] border border-white/10 bg-slate-900/75 p-5 shadow-[0_18px_60px_rgba(2,6,23,0.34)] backdrop-blur">
                  <p className="text-xs font-semibold uppercase tracking-[0.34em] text-slate-400">
                    Diferenciais
                  </p>
                  <div className="mt-4 flex flex-wrap gap-3">
                    {differentials.map((item) => (
                      <span
                        key={item}
                        className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="order-1 lg:order-2">
                <div className="video-frame-shell">
                  <div className="video-frame">
                    <div className="video-topbar">
                      <div className="flex items-center gap-2">
                        <span className="h-3 w-3 rounded-full bg-rose-400/90" />
                        <span className="h-3 w-3 rounded-full bg-amber-300/90" />
                        <span className="h-3 w-3 rounded-full bg-emerald-300/90" />
                      </div>
                      <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[0.7rem] font-medium uppercase tracking-[0.28em] text-slate-400">
                        Operação em movimento
                      </div>
                    </div>

                    <div className="video-wrapper">
                      <div className="video-media-shell">
                        <video
                          className="video-media"
                          autoPlay
                          muted
                          loop
                          playsInline
                          preload="auto"
                          poster="/imagens/logo.png"
                        >
                          <source src="/videos/hero-desktop.mp4" type="video/mp4" />
                          Seu navegador não suporta vídeo em HTML5.
                        </video>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section id="servicos" className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8 lg:pb-16">
            <div className="grid gap-6 lg:grid-cols-3">
              <article className="rounded-[1.8rem] border border-white/10 bg-white/5 p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.34em] text-cyan-300">
                  Automação
                </p>
                <h3 className="mt-4 text-2xl font-semibold text-white">
                  Processos que param de depender de esforço manual.
                </h3>
                <p className="mt-4 leading-7 text-slate-300">
                  Mapeamos gargalos, desenhamos fluxo e colocamos a operação para rodar com
                  mais consistência e menos intervenção.
                </p>
              </article>
              <article
                id="tecnologias"
                className="rounded-[1.8rem] border border-white/10 bg-white/5 p-6"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.34em] text-indigo-300">
                  Integração
                </p>
                <h3 className="mt-4 text-2xl font-semibold text-white">
                  Dados conectados do jeito certo.
                </h3>
                <p className="mt-4 leading-7 text-slate-300">
                  Estruturamos pipelines, APIs e fluxos para transformar dispersão em visão
                  confiável.
                </p>
                <div className="mt-5 flex flex-wrap gap-3">
                  {technologies.map((item) => (
                    <span
                      key={item}
                      className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </article>
              <article
                id="diferenciais"
                className="rounded-[1.8rem] border border-white/10 bg-white/5 p-6"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.34em] text-emerald-300">
                  Decisão
                </p>
                <h3 className="mt-4 text-2xl font-semibold text-white">
                  Inteligência aplicada ao negócio.
                </h3>
                <p className="mt-4 leading-7 text-slate-300">
                  Nossa entrega não para no código: ela ajuda a enxergar melhor, decidir mais
                  rápido e executar com segurança.
                </p>
              </article>
            </div>
          </section>
        </main>

        <footer id="contato" className="border-t border-white/8 bg-slate-950/90">
          <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-10 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-cyan-300">
                WV Tech Solutions
              </p>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-400">
                Dados, automação e percepção aplicada para criar soluções digitais mais úteis,
                rápidas e alinhadas ao que o negócio realmente precisa.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <a
                href="mailto:wagner@wvtecsolutions.com.br"
                className="rounded-full border border-white/10 px-5 py-3 text-sm font-medium text-slate-100 transition hover:border-cyan-300/30 hover:bg-white/5"
              >
                wagner@wvtechsolutions.com.br
              </a>
              <a
                href="/agendar"
                className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-200"
              >
                Agendar conversa
              </a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}