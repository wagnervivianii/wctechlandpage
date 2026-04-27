import { useState, type Dispatch, type SetStateAction } from 'react'

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
  {
    index: '04',
    title: 'Ciência de dados aplicada',
    description:
      'Modelos preditivos, estatística e análise avançada para antecipar cenários e apoiar decisões.',
  },
]

const technologies = ['Python', 'SQL', 'R', 'React', 'APIs', 'Linux', 'Cloud', 'PostgreSQL']

const differentials = [
  'Percepção de negócio antes da tecnologia',
  'Arquitetura open source para reduzir licenças',
  'Entrega pensada para operação real do cliente',
]

const securityPillars = [
  {
    title: 'Controle de acesso estrito',
    description:
      'O acesso à plataforma é restrito a usuários autorizados, com autenticação por login e senha.',
    icon: '🛡️',
  },
  {
    title: 'Segregação de dados',
    description:
      'Isolamos dados por conta e perfil para garantir que cada usuário visualize apenas o que lhe é permitido.',
    icon: '🔐',
  },
  {
    title: 'Rastreabilidade total',
    description:
      'Monitoramos uso e alterações relevantes para auditar quem acessou qual dado e em que contexto.',
    icon: '📍',
  },
  {
    title: 'Minimização de exposição',
    description:
      'Aplicamos o princípio da necessidade, tratando apenas os dados indispensáveis para a finalidade da operação.',
    icon: '🧭',
  },
]

const navigation = [
  { label: 'Soluções', href: '#solucoes' },
  { label: 'Segurança', section: 'seguranca' as const },
  { label: 'Contato', href: '#contato' },
]

const quickAccessLinks = [{ label: 'Admin', href: '/admin' }]

type ExpandableSection = 'sobre' | 'seguranca' | null

type LandingPageProps = {
  mobileMenuOpen: boolean
  setMobileMenuOpen: Dispatch<SetStateAction<boolean>>
}

export default function LandingPage({ mobileMenuOpen, setMobileMenuOpen }: LandingPageProps) {
  const [activeSection, setActiveSection] = useState<ExpandableSection>(null)

  const closeMobileMenu = () => setMobileMenuOpen(false)

  const toggleSection = (section: Exclude<ExpandableSection, null>) => {
    setActiveSection((current) => {
      const next = current === section ? null : section

      if (next) {
        window.requestAnimationFrame(() => {
          document.getElementById(next)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        })
      }

      return next
    })
  }

  const handleNavSectionClick = (section: Exclude<ExpandableSection, null>) => {
    closeMobileMenu()
    toggleSection(section)
  }

  const handleNavAnchorClick = () => {
    closeMobileMenu()
  }

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

            <nav className="hidden items-center gap-6 text-sm font-medium text-slate-200 lg:flex">
              {navigation.map((item) =>
                'section' in item ? (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => handleNavSectionClick(item.section as 'sobre' | 'seguranca')}
                    className="cursor-pointer text-slate-200 transition hover:text-cyan-300"
                  >
                    {item.label}
                  </button>
                ) : (
                  <a key={item.label} href={item.href} className="text-slate-200 transition hover:text-cyan-300">
                    {item.label}
                  </a>
                )
              )}
              {quickAccessLinks.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="rounded-full border border-white/12 px-4 py-2 text-sm font-medium text-slate-100 transition hover:border-cyan-400/40 hover:bg-white/5"
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
                href="/agendar"
                className="rounded-full border border-white/12 px-5 py-2.5 text-sm font-medium text-slate-100 transition hover:border-cyan-400/40 hover:bg-white/5"
              >
                Agendar conversa
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
              {navigation.map((item) =>
                'section' in item ? (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => handleNavSectionClick(item.section as 'sobre' | 'seguranca')}
                    className="rounded-2xl border border-white/8 bg-white/5 px-4 py-3 text-left text-sm font-medium text-slate-100 transition hover:border-cyan-300/30 hover:bg-white/10"
                  >
                    {item.label}
                  </button>
                ) : (
                  <a
                    key={item.label}
                    href={item.href}
                    onClick={handleNavAnchorClick}
                    className="rounded-2xl border border-white/8 bg-white/5 px-4 py-3 text-sm font-medium text-slate-100 transition hover:border-cyan-300/30 hover:bg-white/10"
                  >
                    {item.label}
                  </a>
                )
              )}
              <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-3">
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
                A WV Tech Solutions conecta automação, dados, inteligência operacional e
                ciência de dados aplicada ao Trade Marketing para transformar operação em
                escala, clareza e decisão. Não é só tecnologia. É percepção aplicada ao que
                faz o negócio girar.
              </p>

              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:flex-wrap">
                <a
                  href="/agendar"
                  className="w-full rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-slate-950 transition hover:bg-slate-200 sm:w-auto"
                >
                  Agendar diagnóstico
                </a>
                <button
                  type="button"
                  onClick={() => toggleSection('seguranca')}
                  className="w-full rounded-full border border-cyan-300/25 bg-cyan-400/10 px-6 py-3.5 text-sm font-semibold text-cyan-100 transition hover:border-cyan-300/40 hover:bg-cyan-400/14 sm:w-auto"
                >
                  Segurança e governança
                </button>
                <button
                  type="button"
                  onClick={() => toggleSection('sobre')}
                  className="w-full rounded-full border border-white/10 bg-white/5 px-6 py-3.5 text-sm font-semibold text-white transition hover:border-cyan-300/30 hover:bg-white/10 sm:w-auto"
                >
                  Conhecer a visão estratégica
                </button>
              </div>
            </div>

            <div className="mt-10 grid gap-6 lg:mt-14 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:items-start">
              <div className="order-2 space-y-5 lg:order-1">
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-2">
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

          <section id="solucoes" className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8 lg:pb-16">
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
              <article className="rounded-[1.8rem] border border-white/10 bg-white/5 p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.34em] text-indigo-300">
                  Integração
                </p>
                <h3 className="mt-4 text-2xl font-semibold text-white">
                  Dados conectados do jeito certo.
                </h3>
                <p className="mt-4 leading-7 text-slate-300">
                  Estruturamos pipelines, APIs e fluxos com base em uma stack
                  <strong className="font-semibold text-slate-100"> open source</strong> para
                  reduzir dependência de terceiros, baixar custo de licenciamento e ampliar a
                  autonomia do cliente.
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
              <article className="rounded-[1.8rem] border border-white/10 bg-white/5 p-6">
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

          {activeSection === 'sobre' ? (
            <section id="sobre" className="mx-auto max-w-7xl px-4 pb-14 sm:px-6 lg:px-8 lg:pb-20">
              <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 shadow-[0_24px_80px_rgba(2,6,23,0.34)] backdrop-blur">
                <div className="grid gap-10 px-6 py-8 sm:px-8 lg:grid-cols-[320px_minmax(0,1fr)] lg:items-center lg:px-10 lg:py-10">
                  <div className="mx-auto flex w-full max-w-[280px] justify-center lg:max-w-none">
                    <div className="relative h-64 w-64 overflow-hidden rounded-full border border-cyan-300/20 bg-slate-900 shadow-[0_0_40px_rgba(34,211,238,0.14)] sm:h-72 sm:w-72">
                      <img
                        src="/imagens/sobre.jpg"
                        alt="Wagner Viviani, fundador da WV Tech Solutions"
                        className="h-full w-full object-cover object-top"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.34em] text-cyan-300">
                          Sobre
                        </p>
                        <h2 className="mt-4 max-w-3xl text-3xl font-semibold tracking-[-0.03em] text-white sm:text-4xl">
                          Visão estratégica de operação, dados e tecnologia no mesmo lugar.
                        </h2>
                      </div>
                      <button
                        type="button"
                        onClick={() => setActiveSection(null)}
                        className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-cyan-300/30 hover:bg-white/10"
                      >
                        Fechar
                      </button>
                    </div>

                    <div className="mt-6 space-y-5 text-sm leading-8 text-slate-300 sm:text-base">
                      <p>
                        Após décadas atuando em agências de Trade Marketing e mergulhando no mundo
                        da tecnologia, desenvolvi uma visão que{' '}
                        <strong className="font-semibold text-slate-100">
                          une o campo estratégico aos bastidores da programação
                        </strong>
                        . Minha trajetória de mais de 20 anos foi pavimentada “escovando bytes” e
                        observando o modus operandi de grandes operações, o que me permitiu formar
                        uma leitura analítica e crítica que vai além do horizonte comum.
                      </p>

                      <p>
                        Percebi que a grande falha das agências não está na falta de dados, mas no{' '}
                        <strong className="font-semibold text-slate-100">fluxo lógico</strong>.
                        Identifiquei um padrão ineficiente: profissionais sobrecarregados
                        manipulando planilhas e extraindo dados manualmente para alimentar sistemas.
                        <strong className="font-semibold text-slate-100">
                          {' '}Esse ciclo deixou de ser eficaz há muito tempo.
                        </strong>
                      </p>

                      <p>
                        Decidi mudar o jogo através do{' '}
                        <strong className="font-semibold text-slate-100">Open Source</strong>.
                        Desenvolvo softwares que eliminam dependência desnecessária de ferramentas
                        de terceiros, reduzem custos de licenciamento e otimizam o tempo da
                        operação dentro do próprio ecossistema do cliente.
                      </p>

                      <p>
                        Seja no Trade Marketing, em sistemas de gestão de estoque ou em agendas
                        inteligentes, minha filosofia é clara:
                        <strong className="font-semibold text-slate-100">
                          {' '}nem todo problema é tecnológico; muitas vezes, o problema é o
                          processo.
                        </strong>{' '}
                        Meu papel é enxergar os gargalos que o próprio dono do negócio ainda não
                        percebeu.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          ) : null}

          {activeSection === 'seguranca' ? (
            <section
              id="seguranca"
              className="mx-auto max-w-7xl px-4 pb-14 sm:px-6 lg:px-8 lg:pb-20"
            >
              <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 shadow-[0_24px_80px_rgba(2,6,23,0.34)] backdrop-blur">
                <div className="px-6 py-8 sm:px-8 lg:px-10 lg:py-10">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.34em] text-cyan-300">
                        Segurança e Governança de Dados
                      </p>
                      <h2 className="mt-4 max-w-4xl text-3xl font-semibold tracking-[-0.03em] text-white sm:text-4xl">
                        Dados tratados como ativos críticos do cliente, não como simples bits.
                      </h2>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveSection(null)}
                      className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-cyan-300/30 hover:bg-white/10"
                    >
                      Fechar
                    </button>
                  </div>

                  <p className="mt-6 max-w-4xl text-sm leading-8 text-slate-300 sm:text-base">
                    Na WV Tech Solutions, a segurança da informação não é uma etapa posterior ao
                    desenvolvimento; ela é{' '}
                    <strong className="font-semibold text-slate-100">
                      parte integrante e nativa de cada linha de código
                    </strong>{' '}
                    que escrevemos. Nosso compromisso é garantir que sua operação rode em um
                    ambiente controlado, rastreável e juridicamente seguro.
                  </p>

                  <div className="mt-8 grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
                    {securityPillars.map((pillar) => (
                      <article
                        key={pillar.title}
                        className="rounded-[1.6rem] border border-white/10 bg-slate-900/70 p-5"
                      >
                        <span className="text-2xl">{pillar.icon}</span>
                        <h3 className="mt-4 text-lg font-semibold text-white">{pillar.title}</h3>
                        <p className="mt-3 text-sm leading-7 text-slate-300">{pillar.description}</p>
                      </article>
                    ))}
                  </div>

                  <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
                    <article className="rounded-[1.8rem] border border-white/10 bg-slate-900/70 p-6">
                      <p className="text-xs font-semibold uppercase tracking-[0.34em] text-emerald-300">
                        Conformidade com a LGPD
                      </p>
                      <p className="mt-4 text-sm leading-8 text-slate-300 sm:text-base">
                        Toda a nossa plataforma é desenvolvida em{' '}
                        <strong className="font-semibold text-slate-100">
                          conformidade com a Lei Geral de Proteção de Dados
                        </strong>{' '}
                        e com uma governança ativa alinhada às melhores práticas técnicas e
                        administrativas. Também mantemos procedimentos claros para registro,
                        contenção e mitigação de incidentes, garantindo resposta coordenada e
                        rápida.
                      </p>
                    </article>

                    <article className="rounded-[1.8rem] border border-white/10 bg-slate-900/70 p-6">
                      <p className="text-xs font-semibold uppercase tracking-[0.34em] text-amber-300">
                        Regulamentação e contratos
                      </p>
                      <div className="mt-4 space-y-4 text-sm leading-8 text-slate-300 sm:text-base">
                        <p>
                          Todo projeto da WV Tech Solutions é regido por{' '}
                          <strong className="font-semibold text-slate-100">contrato formal</strong>,
                          que define com clareza os papéis de Controlador e Operador de dados,
                          responsabilidades contratuais e regras de acesso, prevenção e sigilo.
                        </p>
                        <p>
                          A transparência contratual é parte do nosso compromisso para que a sua
                          operação avance com segurança técnica, jurídica e operacional.
                        </p>
                      </div>
                    </article>
                  </div>
                </div>
              </div>
            </section>
          ) : null}
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
                href="mailto:wagner@wvtechsolutions.com.br"
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
