import { useEffect } from 'react'

// PONTO DE CONTROLE DA PÁGINA
// Para publicar/alterar links, ajuste os arrays abaixo. A página foi pensada para ter:
// 1) canais gerais, como Medium, Instagram, YouTube, GitHub e LinkedIn;
// 2) tópicos específicos, como um artigo do Medium sobre tema X ou um projeto do GitHub sobre tema Y.

type LinkTarget = {
  label: string
  href?: string
  description: string
  channel: string
  eyebrow?: string
  primary?: boolean
}

type TopicCollection = {
  title: string
  description: string
  links: LinkTarget[]
}

const profileLinks: LinkTarget[] = [
  {
    label: 'Agendar uma conversa',
    href: '/agendar',
    description: 'Para empresas, agências e operações que querem transformar processos em sistemas.',
    channel: 'WV Tech Solutions',
    eyebrow: 'principal',
    primary: true,
  },
  {
    label: 'Conhecer a WV Tech Solutions',
    href: '/',
    description: 'Software, dados, automação e inteligência operacional para Trade Marketing.',
    channel: 'Site oficial',
    eyebrow: 'empresa',
  },
  {
    label: 'Perfil profissional no LinkedIn',
    description: 'Carreira, projetos, tecnologia, dados e trajetória profissional.',
    channel: 'LinkedIn',
    eyebrow: 'clt e negócios',
  },
  {
    label: 'Ensaios no Medium',
    description: 'Métodos, análises de processo, tecnologia, trabalho e humanidade.',
    channel: 'Medium',
    eyebrow: 'mente analítica',
  },
  {
    label: 'Fotografia no Instagram',
    description: 'Fotografia urbana, cotidiano e fragmentos visuais de uma cidade em movimento.',
    channel: 'Instagram',
    eyebrow: 'olhar visual',
  },
  {
    label: 'Reflexões no YouTube',
    description: 'Ideias em vídeo sobre tecnologia, sociedade, dados, operação e desenvolvimento.',
    channel: 'YouTube',
    eyebrow: 'voz e ideia',
  },
  {
    label: 'Código e projetos no GitHub',
    href: 'https://github.com/wagnervivianii',
    description: 'Projetos, experimentos e construção técnica com código aberto quando fizer sentido.',
    channel: 'GitHub',
    eyebrow: 'código',
  },
  {
    label: 'Enviar e-mail',
    href: 'mailto:wagner@wvtechsolutions.com.br',
    description: 'Contato direto para projetos, parcerias, oportunidades e conversas profissionais.',
    channel: 'E-mail',
    eyebrow: 'contato',
  },
]

const topicCollections: TopicCollection[] = [
  {
    title: 'Trade Marketing, dados e operação de campo',
    description:
      'Conteúdos e projetos ligados a BI, automação, ruptura, produtividade, integração de dados e gestão de campo.',
    links: [
      {
        label: 'Artigos sobre Trade Marketing e inteligência operacional',
        description: 'Use este espaço para apontar para uma tag, série ou artigo específico do Medium.',
        channel: 'Medium',
      },
      {
        label: 'Projetos de dados aplicados ao Trade Marketing',
        description: 'Repositórios, estudos, protótipos ou cases técnicos publicados no GitHub.',
        channel: 'GitHub',
      },
      {
        label: 'Vídeos sobre operação, dados e automação',
        description: 'Playlist ou vídeo específico do YouTube sobre o tema.',
        channel: 'YouTube',
      },
    ],
  },
  {
    title: 'Engenharia, automação e construção de sistemas',
    description:
      'Materiais sobre APIs, backend, React, PostgreSQL, Python, integrações e arquitetura de soluções reutilizáveis.',
    links: [
      {
        label: 'Repositórios técnicos e experimentos',
        href: 'https://github.com/wagnervivianii',
        description: 'Base pública dos projetos e experimentos que podem ser compartilhados.',
        channel: 'GitHub',
      },
      {
        label: 'Notas sobre desenvolvimento e arquitetura',
        description: 'Espaço para uma coleção específica do Medium sobre engenharia de software.',
        channel: 'Medium',
      },
    ],
  },
  {
    title: 'Humanidade, trabalho e pensamento autoral',
    description:
      'Ensaios, fotografias e reflexões sobre o lado humano da tecnologia, do trabalho e da vida urbana.',
    links: [
      {
        label: 'Ensaios sobre tecnologia e humanidade',
        description: 'Link direto para um texto, lista, tag ou coleção do Medium.',
        channel: 'Medium',
      },
      {
        label: 'Fotografia urbana e cotidiano',
        description: 'Link para uma publicação, destaque, perfil ou série visual no Instagram.',
        channel: 'Instagram',
      },
    ],
  },
]

const proofPoints = [
  'Dados, SQL, Python, Power BI, APIs e automação aplicados à operação real.',
  'Visão de negócio antes da tecnologia: primeiro entender o processo, depois construir.',
  'Soluções modulares, reaproveitáveis e pensadas para reduzir dependência de ferramentas caras.',
]

function isExternalLink(href: string) {
  return href.startsWith('http') || href.startsWith('mailto:')
}

function LinkCard({ link }: { link: LinkTarget }) {
  const isAvailable = Boolean(link.href)
  const baseClassName = link.primary
    ? 'border-cyan-300/35 bg-cyan-300/12 shadow-[0_24px_80px_rgba(8,145,178,0.18)] hover:border-cyan-200/60 hover:bg-cyan-300/16'
    : 'border-white/10 bg-white/[0.045] hover:border-cyan-300/30 hover:bg-white/[0.075]'

  if (!isAvailable) {
    return (
      <article
        className={`rounded-[1.7rem] border p-5 opacity-75 transition ${baseClassName}`}
        aria-label={`${link.label}. Link ainda não configurado.`}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            {link.eyebrow ? (
              <p className="text-[0.64rem] font-semibold uppercase tracking-[0.32em] text-slate-400">
                {link.eyebrow}
              </p>
            ) : null}
            <h3 className="mt-2 text-lg font-semibold text-white">{link.label}</h3>
          </div>
          <span className="rounded-full border border-white/10 px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-slate-400">
            {link.channel}
          </span>
        </div>
        <p className="mt-4 text-sm leading-7 text-slate-300">{link.description}</p>
        <span className="mt-5 inline-flex rounded-full border border-amber-300/25 bg-amber-300/8 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-amber-200">
          Link pendente
        </span>
      </article>
    )
  }

  const targetProps = isExternalLink(link.href ?? '')
    ? { target: '_blank', rel: 'noreferrer' }
    : undefined

  return (
    <a
      href={link.href}
      {...targetProps}
      className={`group block rounded-[1.7rem] border p-5 transition ${baseClassName}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          {link.eyebrow ? (
            <p className="text-[0.64rem] font-semibold uppercase tracking-[0.32em] text-cyan-200/80">
              {link.eyebrow}
            </p>
          ) : null}
          <h3 className="mt-2 text-lg font-semibold text-white">{link.label}</h3>
        </div>
        <span className="rounded-full border border-white/10 px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-cyan-200/80 transition group-hover:border-cyan-200/40 group-hover:text-cyan-100">
          {link.channel}
        </span>
      </div>
      <p className="mt-4 text-sm leading-7 text-slate-300">{link.description}</p>
      <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-cyan-200 transition group-hover:text-white">
        Acessar
        <span aria-hidden="true" className="transition group-hover:translate-x-1">
          →
        </span>
      </span>
    </a>
  )
}

export default function WagnerLinksPage() {
  useEffect(() => {
    const originalTitle = document.title
    const descriptionElement = document.querySelector('meta[name="description"]')
    const canonicalElement = document.querySelector('link[rel="canonical"]')
    const originalDescription = descriptionElement?.getAttribute('content')
    const originalCanonical = canonicalElement?.getAttribute('href')

    document.title = 'Wagner Viviani | Links, projetos e conteúdo'
    descriptionElement?.setAttribute(
      'content',
      'Central pessoal de Wagner Viviani: WV Tech Solutions, tecnologia, dados, automação, Medium, Instagram, YouTube, GitHub, LinkedIn e conteúdos por tópicos.',
    )
    canonicalElement?.setAttribute('href', 'https://wvtechsolutions.com.br/wagner')

    return () => {
      document.title = originalTitle
      if (originalDescription) {
        descriptionElement?.setAttribute('content', originalDescription)
      }
      if (originalCanonical) {
        canonicalElement?.setAttribute('href', originalCanonical)
      }
    }
  }, [])

  return (
    <div className="min-h-screen overflow-hidden bg-slate-950 text-slate-100">
      <div className="hero-shell min-h-screen">
        <div className="hero-grid" aria-hidden="true" />
        <div className="hero-orb hero-orb-cyan" aria-hidden="true" />
        <div className="hero-orb hero-orb-blue" aria-hidden="true" />
        <div className="hero-orb hero-orb-violet" aria-hidden="true" />

        <main className="relative z-10 mx-auto flex w-full max-w-5xl flex-col px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
          <nav className="flex items-center justify-between gap-4">
            <a href="/" className="group flex min-w-0 items-center gap-3">
              <div className="logo-wrap shrink-0">
                <img
                  src="/imagens/logo.png"
                  alt="Logo da WV Tech Solutions"
                  className="h-11 w-11 rounded-full object-cover"
                />
              </div>
              <div className="min-w-0">
                <p className="truncate text-[0.72rem] font-semibold uppercase tracking-[0.38em] text-white sm:text-[0.78rem]">
                  WV Tech Solutions
                </p>
                <p className="hidden truncate text-sm text-slate-400 sm:block">
                  Links, projetos e conteúdo
                </p>
              </div>
            </a>

            <a
              href="/agendar"
              className="rounded-full border border-cyan-300/25 bg-cyan-300/10 px-4 py-2.5 text-sm font-semibold text-cyan-100 transition hover:border-cyan-200/50 hover:bg-cyan-300/15"
            >
              Agendar
            </a>
          </nav>

          <section className="pt-12 text-center sm:pt-16 lg:pt-20">
            <div className="mx-auto flex max-w-3xl flex-col items-center">
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-cyan-300/20 blur-2xl" aria-hidden="true" />
                <img
                  src="/imagens/wagner_agenda.jpg"
                  alt="Wagner Viviani"
                  className="relative h-32 w-32 rounded-full border border-white/15 bg-slate-900 object-cover shadow-[0_20px_70px_rgba(8,145,178,0.22)] sm:h-36 sm:w-36"
                />
              </div>

              <p className="mt-7 rounded-full border border-cyan-300/20 bg-cyan-300/8 px-4 py-2 text-[0.68rem] font-semibold uppercase tracking-[0.34em] text-cyan-200 sm:text-[0.72rem]">
                tecnologia, dados e humanidade
              </p>

              <h1 className="mt-6 text-balance text-4xl font-semibold leading-[0.96] tracking-[-0.04em] text-white sm:text-5xl lg:text-6xl">
                Wagner Viviani
              </h1>

              <p className="mt-5 max-w-2xl text-pretty text-lg leading-8 text-slate-300 sm:text-xl">
                Soluções em dados, automação e tecnologia para operações reais.
              </p>

              <blockquote className="mt-6 max-w-2xl text-pretty text-base leading-8 text-slate-400 sm:text-lg">
                “Na esteira de produção de máquinas com coração, busco a humanidade esquecida.”
              </blockquote>

              <div className="mt-8 grid w-full gap-3 sm:grid-cols-2">
                <a
                  href="/agendar"
                  className="rounded-full bg-white px-6 py-4 text-sm font-semibold text-slate-950 transition hover:bg-cyan-100"
                >
                  Agendar uma conversa
                </a>
                <a
                  href="#canais"
                  className="rounded-full border border-white/12 px-6 py-4 text-sm font-semibold text-slate-100 transition hover:border-cyan-300/40 hover:bg-white/5"
                >
                  Ver canais e conteúdos
                </a>
              </div>
            </div>
          </section>

          <section className="mt-12 rounded-[2rem] border border-white/10 bg-white/[0.045] p-5 shadow-[0_24px_90px_rgba(2,6,23,0.42)] sm:p-7 lg:mt-16 lg:p-8">
            <div className="grid gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:items-center">
              <div>
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.34em] text-cyan-200">
                  posicionamento
                </p>
                <h2 className="mt-4 text-2xl font-semibold tracking-[-0.03em] text-white sm:text-3xl">
                  Construção técnica com leitura humana do processo.
                </h2>
                <p className="mt-4 text-sm leading-8 text-slate-300 sm:text-base">
                  Crio sistemas, integrações, dashboards e automações para transformar processos
                  manuais em soluções digitais mais previsíveis, mensuráveis e úteis para quem está
                  na operação.
                </p>
              </div>

              <div className="space-y-3">
                {proofPoints.map((point) => (
                  <div
                    key={point}
                    className="rounded-[1.35rem] border border-white/10 bg-slate-950/55 p-4 text-sm leading-7 text-slate-300"
                  >
                    {point}
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section id="canais" className="mt-10 sm:mt-14">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.34em] text-cyan-200">
                  links gerais
                </p>
                <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-white sm:text-3xl">
                  Canais principais
                </h2>
              </div>
              <p className="max-w-xl text-sm leading-7 text-slate-400">
                Uma central para clientes, recrutadores, parceiros e pessoas que acompanham meus
                conteúdos.
              </p>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {profileLinks.map((link) => (
                <LinkCard key={`${link.channel}-${link.label}`} link={link} />
              ))}
            </div>
          </section>

          <section className="mt-12 sm:mt-16">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.34em] text-cyan-200">
                  tópicos específicos
                </p>
                <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-white sm:text-3xl">
                  Trilhas de conteúdo
                </h2>
              </div>
              <p className="max-w-xl text-sm leading-7 text-slate-400">
                Aqui entram links por assunto: uma série do Medium, uma playlist do YouTube, um
                repositório específico no GitHub ou uma publicação visual do Instagram.
              </p>
            </div>

            <div className="mt-6 space-y-5">
              {topicCollections.map((collection) => (
                <article
                  key={collection.title}
                  className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-5 sm:p-6"
                >
                  <div className="grid gap-5 lg:grid-cols-[minmax(0,0.75fr)_minmax(0,1.25fr)]">
                    <div>
                      <h3 className="text-xl font-semibold tracking-[-0.02em] text-white">
                        {collection.title}
                      </h3>
                      <p className="mt-3 text-sm leading-7 text-slate-400">
                        {collection.description}
                      </p>
                    </div>

                    <div className="grid gap-3">
                      {collection.links.map((link) => (
                        <LinkCard key={`${collection.title}-${link.channel}-${link.label}`} link={link} />
                      ))}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <footer className="mt-14 border-t border-white/10 py-8 sm:mt-16">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.34em] text-cyan-200">
                  WV Tech Solutions
                </p>
                <p className="mt-3 max-w-xl text-sm leading-7 text-slate-400">
                  Desenvolvido por mim. Código, conteúdo e construção caminhando juntos.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <a
                  href="https://github.com/wagnervivianii"
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full border border-white/10 px-5 py-3 text-sm font-medium text-slate-100 transition hover:border-cyan-300/30 hover:bg-white/5"
                >
                  GitHub
                </a>
                <a
                  href="mailto:wagner@wvtechsolutions.com.br"
                  className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-200"
                >
                  Contato
                </a>
              </div>
            </div>
          </footer>
        </main>
      </div>
    </div>
  )
}
