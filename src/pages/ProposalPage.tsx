import { useEffect, type ReactNode } from 'react'

const diagnosticItems = [
  {
    title: 'Processo pouco claro entre áreas',
    description:
      'Distância entre demanda real da operação, BI, tecnologia e execução em campo. O resultado costuma ser retrabalho, ruído e baixa confiança nas entregas.',
  },
  {
    title: 'Bases e planilhas sem padrão',
    description:
      'Arquivos chegam com formatos diferentes, colunas alteradas e códigos inconsistentes, exigindo comparação manual entre versões.',
  },
  {
    title: 'Validação tardia da coleta',
    description:
      'Erros em preço, fotos ou respostas são percebidos quando o promotor já saiu da loja, elevando custo e dificultando correção.',
  },
  {
    title: 'Comunicação operacional repetitiva',
    description:
      'A equipe gasta tempo perguntando se o promotor chegou, se teve atraso, se precisa de apoio ou se conseguiu executar a visita.',
  },
  {
    title: 'Evidências montadas manualmente',
    description:
      'Horas são consumidas selecionando imagens, ajustando slides, escrevendo legendas e padronizando apresentações.',
  },
  {
    title: 'Pouca rastreabilidade ponta a ponta',
    description:
      'Informações ficam espalhadas em mensagens, planilhas, e-mails e controles paralelos, dificultando auditoria e aprendizado.',
  },
]

const fronts = [
  {
    title: 'Camada app_coleta',
    description:
      'Integração flexível com sistemas de coleta de dados de campo, utilizando APIs e endpoints autorizados para consulta, inserção, atualização, exclusão e organização de dados operacionais.',
    tags: ['APIs', 'Involves Stage', 'MC1', 'Umov.me'],
  },
  {
    title: 'Comunicação operacional inteligente',
    description:
      'Monitoramento de eventos, identificação de exceções, acionamento por canais autorizados, mensagens aprovadas, respostas estruturadas, histórico e alertas.',
    tags: ['Eventos', 'Mensagens', 'Alertas'],
  },
  {
    title: 'Roteirização operacional',
    description:
      'Organização de pontos de venda, estimativa de deslocamento, custos operacionais e prioridades de visita.',
    tags: ['PDVs', 'Rotas', 'Prioridades'],
  },
  {
    title: 'Books operacionais',
    description:
      'Geração automatizada de apresentações com imagens, evidências, legendas e layout padronizado.',
    tags: ['PPTX', 'Fotos', 'Evidências'],
  },
  {
    title: 'Enxoval planejado x execução',
    description:
      'Comparação entre o material previsto para a operação e o que foi efetivamente implementado em campo.',
    tags: ['Aderência', 'Auditoria', 'Campo'],
  },
  {
    title: 'Padronização e integração de dados',
    description:
      'Saneamento de bases, validação estrutural, preparação de arquivos e trilha de qualidade para uso operacional.',
    tags: ['Data quality', 'Bases', 'Validação'],
  },
]

const solutionModules = [
  {
    title: 'app_coleta',
    resolve: 'Reduz dependência de extrações manuais e uso direto de APIs brutas.',
    v1: 'Conexão, consultas estruturadas, inserção, atualização, exclusão e exportação controlada de dados.',
    evolution: 'Múltiplos conectores e camada única de consulta operacional.',
  },
  {
    title: 'Comunicação operacional',
    resolve: 'Diminui contatos manuais repetitivos e cria histórico de tratativas.',
    v1: 'Modelos de mensagem, envio autorizado, respostas estruturadas, alertas e histórico.',
    evolution: 'Monitoramento de eventos e alertas para supervisão.',
  },
  {
    title: 'Roteirização',
    resolve: 'Organiza rotas montadas manualmente e sujeitas a falhas.',
    v1: 'Agrupamento por região, cidade, bairro e exportação operacional.',
    evolution: 'Coordenadas, distâncias, prioridades e comparação entre planejado e executado.',
  },
  {
    title: 'Books operacionais',
    resolve: 'Reduz tempo gasto com fotos, slides e evidências.',
    v1: 'Geração de PPTX com imagens e layout padronizado.',
    evolution: 'IA para reconhecimento, classificação e validação visual.',
  },
  {
    title: 'Enxoval x execução',
    resolve: 'Apoia auditoria de material previsto versus implementado.',
    v1: 'Importação de enxoval e relatório de aderência.',
    evolution: 'Validação por imagem, indicadores e alertas.',
  },
  {
    title: 'Padronização de dados',
    resolve: 'Evita alimentar sistemas com dados ruins ou bases sem padrão.',
    v1: 'Validação estrutural, duplicidades e arquivo padronizado.',
    evolution: 'Regras por cliente, trilha de auditoria e data quality.',
  },
]

const expectedGains = [
  'Redução de retrabalho operacional.',
  'Maior confiabilidade das informações de campo.',
  'Padronização de bases, arquivos e evidências.',
  'Melhoria na comunicação entre operação, BI, tecnologia e campo.',
  'Mais rastreabilidade sobre alterações, consultas e integrações.',
  'Resposta mais rápida a exceções operacionais.',
  'Menor dependência de controles paralelos.',
  'Reaproveitamento de módulos em diferentes contas, quando houver aderência e permissão.',
  'Construção de uma base tecnológica sustentável, evolutiva e documentada.',
]

const techGroups = [
  {
    title: 'Frontend',
    items: ['React', 'Vite', 'TypeScript', 'Tailwind CSS', 'TanStack Table', 'React Hook Form + Zod', 'ECharts'],
  },
  {
    title: 'Backend',
    items: ['Python', 'FastAPI', 'Pydantic', 'SQLAlchemy', 'Alembic', 'Pandas', 'Uvicorn'],
  },
  {
    title: 'Banco e governança',
    items: ['PostgreSQL', 'Migrations', 'Logs', 'Permissões', 'Histórico', 'Configurações por módulo'],
  },
  {
    title: 'Ambiente',
    items: ['Docker', 'Docker Compose', 'Frontend', 'Backend', 'PostgreSQL', 'Workers futuros'],
  },
]

const governanceItems = [
  'Assinatura de contrato de confidencialidade ou NDA, quando necessário.',
  'Código versionado em GitHub ou repositório indicado pela empresa.',
  'Atuação em servidor, VPN, homologação ou infraestrutura fornecida pela contratante.',
  'Uso de servidor próprio apenas quando aprovado pela empresa.',
  'Controles de acesso por perfil, operação, conta ou módulo.',
  'Credenciais fora do frontend, do código, dos logs e dos documentos.',
  'Registro de operações relevantes para auditoria e rastreabilidade.',
  'Tratamento de dados conforme legislação aplicável, políticas internas e boas práticas de segurança.',
]

const kanbanColumns = [
  ['Backlog', 'ideias, módulos futuros e demandas ainda não refinadas.'],
  ['Refinamento', 'tarefas em análise de processo, regra de negócio ou viabilidade técnica.'],
  ['A fazer', 'itens priorizados para a primeira entrega operacional.'],
  ['Em desenvolvimento', 'tarefas em execução técnica.'],
  ['Em validação', 'itens prontos para teste funcional e revisão operacional.'],
  ['Concluído', 'entregas aprovadas e documentadas.'],
  ['Riscos / dependências', 'pontos que dependem de acesso, API, regra do cliente ou decisão externa.'],
]

function SectionTitle({ eyebrow, title, children }: { eyebrow: string; title: string; children?: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-3xl text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.34em] text-cyan-300">{eyebrow}</p>
      <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-white sm:text-4xl lg:text-5xl">
        {title}
      </h2>
      {children ? <div className="mt-5 text-base leading-8 text-slate-300">{children}</div> : null}
    </div>
  )
}

function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <article
      className={`rounded-[1.6rem] border border-white/10 bg-white/5 p-5 shadow-[0_18px_60px_rgba(2,6,23,0.28)] backdrop-blur ${className}`}
    >
      {children}
    </article>
  )
}

export default function ProposalPage() {
  useEffect(() => {
    document.title = 'Proposta Trade Marketing | WV Tech Solutions'
  }, [])

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="hero-shell">
        <div className="hero-grid" aria-hidden="true" />
        <div className="hero-orb hero-orb-cyan" aria-hidden="true" />
        <div className="hero-orb hero-orb-blue" aria-hidden="true" />
        <div className="hero-orb hero-orb-violet" aria-hidden="true" />

        <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/75 backdrop-blur-xl">
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
                  Proposta para Trade Marketing
                </p>
              </div>
            </a>

            <nav className="hidden items-center gap-2 text-sm font-medium text-slate-200 md:flex">
              <a className="rounded-full px-3 py-2 transition hover:bg-white/5 hover:text-cyan-300" href="#visao">
                Visão
              </a>
              <a className="rounded-full px-3 py-2 transition hover:bg-white/5 hover:text-cyan-300" href="#frentes">
                Frentes
              </a>
              <a className="rounded-full px-3 py-2 transition hover:bg-white/5 hover:text-cyan-300" href="#governanca">
                Governança
              </a>
              <a className="rounded-full px-3 py-2 transition hover:bg-white/5 hover:text-cyan-300" href="#contato-proposta">
                Contato
              </a>
            </nav>

            <a
              href="/agendar"
              className="rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-slate-200 sm:px-5"
            >
              Diagnóstico
            </a>
          </div>
        </header>

        <main>
          <section className="mx-auto max-w-7xl px-4 pb-14 pt-10 sm:px-6 lg:px-8 lg:pb-20 lg:pt-16">
            <div className="mx-auto max-w-4xl text-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/8 px-4 py-2 text-[0.68rem] font-semibold uppercase tracking-[0.34em] text-cyan-300 shadow-[0_0_20px_rgba(34,211,238,0.14)] sm:text-[0.72rem]">
                <span className="h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_12px_rgba(34,211,238,0.9)]" />
                Proposta comercial e técnica
              </div>

              <h1 className="mt-7 text-balance text-4xl font-semibold leading-[0.98] tracking-[-0.04em] text-white sm:text-5xl lg:text-7xl">
                Plataforma modular para{' '}
                <span className="bg-linear-to-r from-cyan-300 via-sky-400 to-indigo-400 bg-clip-text text-transparent">
                  operações de Trade Marketing.
                </span>
              </h1>

              <p className="mx-auto mt-6 max-w-3xl text-pretty text-base leading-8 text-slate-300 sm:text-lg">
                Uma visão mobile first da proposta da WV Tech Solutions: consultoria técnica,
                desenho de processos, automação, integração de dados, governança e módulos
                reutilizáveis para operações de campo.
              </p>

              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:flex-wrap">
                <a
                  href="/agendar"
                  className="w-full rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-slate-950 transition hover:bg-slate-200 sm:w-auto"
                >
                  Agendar reunião de diagnóstico
                </a>
                <a
                  href="/docs/proposta-plataforma-modular-trade-marketing.pdf"
                  target="_blank"
                  rel="noreferrer"
                  className="w-full rounded-full border border-cyan-300/25 bg-cyan-400/10 px-6 py-3.5 text-sm font-semibold text-cyan-100 transition hover:border-cyan-300/40 hover:bg-cyan-400/14 sm:w-auto"
                >
                  Abrir PDF completo
                </a>
              </div>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-3 lg:mt-14">
              <Card>
                <p className="text-xs font-semibold uppercase tracking-[0.34em] text-cyan-300">Método</p>
                <h2 className="mt-3 text-xl font-semibold text-white">Processo antes da tecnologia.</h2>
                <p className="mt-3 text-sm leading-7 text-slate-300">
                  Primeiro entendemos o fluxo real; depois aplicamos tecnologia open source para dar escala, rastreabilidade e segurança.
                </p>
              </Card>
              <Card>
                <p className="text-xs font-semibold uppercase tracking-[0.34em] text-indigo-300">Produto</p>
                <h2 className="mt-3 text-xl font-semibold text-white">Módulos que nascem da operação.</h2>
                <p className="mt-3 text-sm leading-7 text-slate-300">
                  Cada rotina compreendida, padronizada e automatizada pode se tornar um novo módulo da solução.
                </p>
              </Card>
              <Card>
                <p className="text-xs font-semibold uppercase tracking-[0.34em] text-emerald-300">Governança</p>
                <h2 className="mt-3 text-xl font-semibold text-white">Segurança desde o início.</h2>
                <p className="mt-3 text-sm leading-7 text-slate-300">
                  Operações sensíveis só acontecem com permissão, regra validada, acesso autorizado e registro auditável.
                </p>
              </Card>
            </div>
          </section>

          <section id="visao" className="mx-auto max-w-7xl px-4 pb-14 sm:px-6 lg:px-8 lg:pb-20">
            <div className="overflow-hidden rounded-4xl border border-white/10 bg-white/5 shadow-[0_24px_80px_rgba(2,6,23,0.34)] backdrop-blur">
              <div className="grid gap-8 px-6 py-8 sm:px-8 lg:grid-cols-[0.95fr_1.05fr] lg:px-10 lg:py-10">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.34em] text-cyan-300">Resumo executivo</p>
                  <h2 className="mt-4 text-3xl font-semibold tracking-[-0.03em] text-white sm:text-4xl">
                    Não é uma solução genérica de prateleira.
                  </h2>
                </div>
                <div className="space-y-5 text-sm leading-8 text-slate-300 sm:text-base">
                  <p>
                    A WV Tech Solutions propõe a construção de uma solução modular para apoiar
                    operações de trade marketing, começando por uma primeira frente priorizada e
                    evoluindo para uma plataforma operacional integrada a aplicativos de coleta,
                    comunicação de campo, roteirização, geração de evidências e automação de processos.
                  </p>
                  <p>
                    O ponto de partida é uma camada de integração com aplicativos de coleta. A primeira
                    frente utiliza o Involves Stage, mas a arquitetura será preparada para receber outros
                    conectores, como MC1, Umov.me ou plataformas similares.
                  </p>
                  <p>
                    O trabalho começa com uma etapa consultiva: entender como a operação funciona hoje,
                    quais dados são recebidos, quais rotinas se repetem, onde ocorrem erros e quais
                    processos podem ser padronizados ou automatizados com segurança.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="mx-auto max-w-7xl px-4 pb-14 sm:px-6 lg:px-8 lg:pb-20">
            <SectionTitle eyebrow="Versão 1 Operacional" title="Uma primeira entrega funcional e evolutiva.">
              <p>
                A primeira entrega não pretende substituir todos os processos atuais. Ela apresenta um caminho concreto para integrar dados, validar permissões, consultar informações, organizar rotinas e transformar processos repetitivos em módulos reutilizáveis.
              </p>
            </SectionTitle>

            <div className="mt-8 grid gap-4 lg:grid-cols-3">
              {[
                ['Entendimento da operação', 'Conversas com operação, analistas, coordenação, gerência, BI e áreas envolvidas no processo.'],
                ['Caminho completo da informação', 'Mapeamento de onde o dado nasce, por onde passa, onde sofre alterações e qual decisão operacional sustenta.'],
                ['Automação com critério', 'A tecnologia entra quando existe regra clara, repetição, risco de erro manual e ganho operacional.'],
              ].map(([title, description]) => (
                <Card key={title}>
                  <h3 className="text-xl font-semibold text-white">{title}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-300">{description}</p>
                </Card>
              ))}
            </div>
          </section>

          <section id="frentes" className="mx-auto max-w-7xl px-4 pb-14 sm:px-6 lg:px-8 lg:pb-20">
            <SectionTitle eyebrow="Frentes previstas" title="Nichos de atuação que podem virar módulos.">
              <p>
                As frentes abaixo não são um cardápio solto. Elas nascem do diagnóstico operacional e evoluem conforme acesso, aderência ao processo, prioridade e ganho real para a operação.
              </p>
            </SectionTitle>

            <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {fronts.map((front) => (
                <Card key={front.title}>
                  <h3 className="text-xl font-semibold text-white">{front.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-300">{front.description}</p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {front.tags.map((tag) => (
                      <span key={tag} className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-200">
                        {tag}
                      </span>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          </section>

          <section className="mx-auto max-w-7xl px-4 pb-14 sm:px-6 lg:px-8 lg:pb-20">
            <SectionTitle eyebrow="Diagnóstico" title="Onde a operação costuma perder eficiência.">
              <p>
                Quando o processo nasce desorganizado, qualquer tecnologia apenas acelera o retrabalho. O diagnóstico procura localizar os nós antes de automatizar.
              </p>
            </SectionTitle>
            <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {diagnosticItems.map((item) => (
                <Card key={item.title}>
                  <h3 className="text-lg font-semibold text-white">{item.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-300">{item.description}</p>
                </Card>
              ))}
            </div>
          </section>

          <section className="mx-auto max-w-7xl px-4 pb-14 sm:px-6 lg:px-8 lg:pb-20">
            <SectionTitle eyebrow="Soluções" title="Módulos conectados, não automações isoladas.">
              <p>
                As soluções seguem uma mesma lógica: mapear o processo, identificar padrões repetitivos e transformar rotinas em fluxos claros, rastreáveis e automatizáveis.
              </p>
            </SectionTitle>
            <div className="mt-8 space-y-4">
              {solutionModules.map((module) => (
                <Card key={module.title} className="p-0">
                  <div className="grid gap-0 lg:grid-cols-[0.75fr_1fr_1fr_1fr]">
                    <div className="border-b border-white/10 p-5 lg:border-b-0 lg:border-r">
                      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300">Módulo</p>
                      <h3 className="mt-3 text-xl font-semibold text-white">{module.title}</h3>
                    </div>
                    <div className="border-b border-white/10 p-5 lg:border-b-0 lg:border-r">
                      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">Resolve</p>
                      <p className="mt-3 text-sm leading-7 text-slate-300">{module.resolve}</p>
                    </div>
                    <div className="border-b border-white/10 p-5 lg:border-b-0 lg:border-r">
                      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-300">Versão 1</p>
                      <p className="mt-3 text-sm leading-7 text-slate-300">{module.v1}</p>
                    </div>
                    <div className="p-5">
                      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-indigo-300">Evolução</p>
                      <p className="mt-3 text-sm leading-7 text-slate-300">{module.evolution}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </section>

          <section className="mx-auto max-w-7xl px-4 pb-14 sm:px-6 lg:px-8 lg:pb-20">
            <div className="rounded-4xl border border-white/10 bg-linear-to-br from-cyan-400/10 via-white/5 to-indigo-500/10 p-6 shadow-[0_24px_80px_rgba(2,6,23,0.34)] sm:p-8 lg:p-10">
              <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.34em] text-cyan-300">Ganhos esperados</p>
                  <h2 className="mt-4 text-3xl font-semibold tracking-[-0.03em] text-white sm:text-4xl">
                    Menos retrabalho, mais rastreabilidade e operação preparada para evoluir.
                  </h2>
                  <p className="mt-5 text-sm leading-8 text-slate-300 sm:text-base">
                    O objetivo não é apenas automatizar tarefas, mas criar uma operação mais organizada, auditável e conectada à realidade do campo.
                  </p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {expectedGains.map((gain) => (
                    <div key={gain} className="rounded-2xl border border-white/10 bg-slate-950/35 p-4 text-sm leading-7 text-slate-200">
                      {gain}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="mx-auto max-w-7xl px-4 pb-14 sm:px-6 lg:px-8 lg:pb-20">
            <SectionTitle eyebrow="Stack técnica" title="Aberta, rastreável e sustentável.">
              <p>
                A Versão 1 Operacional já nasce com separação entre frontend, backend, banco, serviços internos e conectores externos, evitando uma base descartável.
              </p>
            </SectionTitle>
            <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {techGroups.map((group) => (
                <Card key={group.title}>
                  <h3 className="text-xl font-semibold text-white">{group.title}</h3>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {group.items.map((item) => (
                      <span key={item} className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-200">
                        {item}
                      </span>
                    ))}
                  </div>
                </Card>
              ))}
            </div>

            <Card className="mt-6">
              <p className="text-xs font-semibold uppercase tracking-[0.34em] text-amber-300">Dashboards e visualizações</p>
              <p className="mt-4 text-sm leading-8 text-slate-300 sm:text-base">
                O dashboard deve ser consequência de um processo confiável, não uma camada visual sobre dados frágeis. A proposta é preparar dados tratados, padronizados e rastreáveis para alimentar painéis, relatórios, arquivos Excel, apresentações, alertas e visualizações internas da própria plataforma. Quando fizer sentido, Power BI e ferramentas similares podem continuar como camada de visualização.
              </p>
            </Card>
          </section>

          <section className="mx-auto max-w-7xl px-4 pb-14 sm:px-6 lg:px-8 lg:pb-20">
            <SectionTitle eyebrow="Fluxos visuais" title="Do processo operacional à arquitetura técnica.">
              <p>
                Os diagramas abaixo ajudam a explicar a proposta em duas leituras: visão macro da solução e arquitetura técnica em camadas.
              </p>
            </SectionTitle>
            <div className="mt-8 grid gap-6 xl:grid-cols-2">
              <Card>
                <h3 className="text-xl font-semibold text-white">Estruturação da Versão 1 Operacional</h3>
                <p className="mt-3 text-sm leading-7 text-slate-300">Visão macro da evolução modular, partindo da operação e chegando a relatórios, ações, alertas e decisões.</p>
                <div className="mt-5 overflow-hidden rounded-[1.3rem] border border-white/10 bg-white p-2">
                  <img src="/imagens/proposta/fluxo-operacional.png" alt="Diagrama de estruturação da Versão 1 Operacional" className="h-auto w-full rounded-xl" loading="lazy" />
                </div>
              </Card>
              <Card>
                <h3 className="text-xl font-semibold text-white">Arquitetura técnica e fluxo de dados</h3>
                <p className="mt-3 text-sm leading-7 text-slate-300">Separação entre frontend, backend, serviços internos, app_coleta, APIs externas, banco, segurança e governança.</p>
                <div className="mt-5 overflow-hidden rounded-[1.3rem] border border-white/10 bg-white p-2">
                  <img src="/imagens/proposta/arquitetura-tecnica.png" alt="Diagrama de arquitetura técnica e fluxo de dados" className="h-auto w-full rounded-xl" loading="lazy" />
                </div>
              </Card>
            </div>
          </section>

          <section id="governanca" className="mx-auto max-w-7xl px-4 pb-14 sm:px-6 lg:px-8 lg:pb-20">
            <div className="overflow-hidden rounded-4xl border border-white/10 bg-white/5 shadow-[0_24px_80px_rgba(2,6,23,0.34)] backdrop-blur">
              <div className="grid gap-8 px-6 py-8 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:px-10 lg:py-10">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.34em] text-cyan-300">Segurança e governança</p>
                  <h2 className="mt-4 text-3xl font-semibold tracking-[-0.03em] text-white sm:text-4xl">
                    Informação operacional tratada com responsabilidade.
                  </h2>
                  <p className="mt-5 text-sm leading-8 text-slate-300 sm:text-base">
                    Como a solução pode lidar com bases de clientes, dados de campo, cadastros, evidências, históricos de execução e eventualmente dados pessoais, segurança e rastreabilidade são premissas desde o início.
                  </p>
                </div>
                <div className="grid gap-3">
                  {governanceItems.map((item) => (
                    <div key={item} className="rounded-2xl border border-white/10 bg-slate-900/70 p-4 text-sm leading-7 text-slate-300">
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 grid gap-4 lg:grid-cols-3">
              <Card>
                <p className="text-xs font-semibold uppercase tracking-[0.34em] text-emerald-300">PJ por entregas</p>
                <h3 className="mt-3 text-xl font-semibold text-white">Projeto conduzido por etapas.</h3>
                <p className="mt-3 text-sm leading-7 text-slate-300">Diagnóstico, fluxos, documentação, desenvolvimento da primeira versão operacional, backlog, Kanban, validações e entrega documentada.</p>
              </Card>
              <Card>
                <p className="text-xs font-semibold uppercase tracking-[0.34em] text-indigo-300">Recorrência</p>
                <h3 className="mt-3 text-xl font-semibold text-white">Evolução e sustentação mensal.</h3>
                <p className="mt-3 text-sm leading-7 text-slate-300">Manutenção evolutiva, novos módulos, correções, documentação contínua, suporte funcional e priorização via Kanban.</p>
              </Card>
              <Card>
                <p className="text-xs font-semibold uppercase tracking-[0.34em] text-rose-300">Limites</p>
                <h3 className="mt-3 text-xl font-semibold text-white">Acesso apenas autorizado.</h3>
                <p className="mt-3 text-sm leading-7 text-slate-300">Toda integração deve ocorrer por credenciais autorizadas, APIs disponibilizadas, arquivos fornecidos ou ambientes formalmente aprovados.</p>
              </Card>
            </div>
          </section>

          <section className="mx-auto max-w-7xl px-4 pb-14 sm:px-6 lg:px-8 lg:pb-20">
            <SectionTitle eyebrow="Kanban da proposta" title="Método visível para acompanhar a execução.">
              <p>
                O projeto pode ser acompanhado por Kanban simples em ferramentas acordadas, deixando claro o que está em análise, priorizado, em desenvolvimento, em validação e concluído.
              </p>
            </SectionTitle>
            <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {kanbanColumns.map(([title, description]) => (
                <div key={title} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <h3 className="font-semibold text-white">{title}</h3>
                  <p className="mt-2 text-sm leading-7 text-slate-300">{description}</p>
                </div>
              ))}
            </div>
          </section>

          <section id="contato-proposta" className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8 lg:pb-24">
            <div className="rounded-4xl border border-cyan-300/20 bg-linear-to-br from-cyan-400/14 via-slate-900/80 to-indigo-500/14 p-6 text-center shadow-[0_24px_80px_rgba(2,6,23,0.38)] sm:p-8 lg:p-12">
              <p className="text-xs font-semibold uppercase tracking-[0.34em] text-cyan-300">Próximo passo</p>
              <h2 className="mx-auto mt-4 max-w-4xl text-3xl font-semibold tracking-[-0.04em] text-white sm:text-4xl lg:text-5xl">
                Vamos escolher uma rotina prioritária e transformar em processo, automação e módulo.
              </h2>
              <p className="mx-auto mt-5 max-w-3xl text-sm leading-8 text-slate-300 sm:text-base">
                Esta proposta é uma visão inicial. A parte mais importante acontece na conversa: identificar onde a operação perde tempo, onde o dado perde confiabilidade e qual entrega operacional deve ser priorizada.
              </p>
              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                <a href="/agendar" className="rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-slate-950 transition hover:bg-slate-200">
                  Agendar reunião de diagnóstico
                </a>
                <a href="mailto:wagner@wvtechsolutions.com.br" className="rounded-full border border-white/12 px-6 py-3.5 text-sm font-semibold text-slate-100 transition hover:border-cyan-300/40 hover:bg-white/5">
                  wagner@wvtechsolutions.com.br
                </a>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}
