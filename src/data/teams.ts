export interface TeamSource {
  label: string
  url: string
}

export interface TeamReference {
  slug: string
  name: string
  country: string
  /** Slug of the closest formation available in the game. */
  formation: string
  style: string[]
  principles: string[]
  /** How to approximate the style with the game's tactic options (qualitative on purpose). */
  inGame: string[]
  /** How sure the editorial team is about the formation/style, given the sources. */
  confidence: 'media' | 'baixa'
  note: string
  reviewedAt: string
  sources: TeamSource[]
}

// Editorial starting points, NOT official data. Each entry lists its sources
// and confidence. Real-world tactics change from match to match; review this
// list regularly before presenting it as current.
export const TEAMS: TeamReference[] = [
  {
    slug: 'flamengo',
    name: 'Flamengo',
    country: 'Brasil',
    formation: '4-2-3-1',
    style: ['Pressão alta', 'Jogo vertical', 'Ataque pelas pontas'],
    principles: ['Recuperar a bola no campo do adversário e atacar rápido', 'Dois volantes protegendo a saída', 'Meias e pontas ocupando o espaço entre as linhas'],
    inGame: [
      'Pressão: alta, com marcação forte ao perder a bola.',
      'Construção: rápida e vertical, sem muito toque no fundo.',
      'Mantenha dois volantes de contenção e deixe os laterais com apoio moderado.',
    ],
    confidence: 'media',
    note: 'As fontes divergem entre 4-2-3-1 (com bola) e uma linha de quatro atacantes na fase ofensiva. Use o 4-2-3-1 como base.',
    reviewedAt: '2026-09-20',
    sources: [{ label: 'FootballUser: Flamengo', url: 'https://www.footballuser.com/2061637/Flamengo' }],
  },
  {
    slug: 'palmeiras',
    name: 'Palmeiras',
    country: 'Brasil',
    formation: '4-2-3-1',
    style: ['Sistema flexível', 'Transição defensiva forte', 'Saída pelas pontas'],
    principles: ['Atrair a pressão com toques curtos e escapar pelas pontas', 'Ligação direta para os atacantes quando faz sentido', 'Reação rápida depois de perder a bola'],
    inGame: [
      'Construção: equilibrada, alternando toque curto e bola longa.',
      'Defesa: linha de quatro compacta, sem se expor.',
      'Ajuste a formação conforme o adversário, como o próprio time faz.',
    ],
    confidence: 'baixa',
    note: 'O técnico varia o sistema conforme o jogo (as fontes citam volta à linha de quatro). O 4-2-3-1 é só uma base aproximada.',
    reviewedAt: '2026-09-20',
    sources: [
      { label: 'É Gool: como Abel enxerga os sistemas', url: 'https://egool.com.br/noticias/palmeiras/palmeiras-abel-ferreira-explica-como-enxerga-os-sistemas-taticos-do-time-5665' },
      { label: 'Lance: Abel muda o esquema', url: 'https://www.lance.com.br/palmeiras/abel-muda-esquema-tatico-do-palmeiras-para-enfrentar-o-fluminense-veja.html' },
    ],
  },
  {
    slug: 'corinthians',
    name: 'Corinthians',
    country: 'Brasil',
    formation: '3-4-1-2',
    style: ['Três zagueiros', 'Alas dando largura'],
    principles: ['Linha de três atrás com alas subindo', 'Um meia por trás de dois atacantes'],
    inGame: ['Use alas com apoio ofensivo moderado e mantenha um volante na frente da zaga.', 'Pressão média para não expor a linha de três.'],
    confidence: 'baixa',
    note: 'Baseado em uma escalação citada em janeiro de 2026. O time testa esquemas diferentes ao longo da temporada. Se seu jogo não tiver o 3-4-1-2, use o 3-5-2.',
    reviewedAt: '2026-09-20',
    sources: [{ label: 'Lance: Corinthians em treino tático', url: 'https://www.lance.com.br/corinthians/corinthians-intensifica-preparacao-e-diniz-faz-testes-em-treino-tatico.html' }],
  },
  {
    slug: 'real-madrid',
    name: 'Real Madrid',
    country: 'Espanha',
    formation: '4-2-3-1',
    style: ['Contra-ataque veloz', 'Pressão do centroavante', 'Meia que carrega a bola'],
    principles: ['Atacante veloz atacando o espaço nas costas da defesa', 'Ponta esquerdo entrando por dentro', 'Meio-campo forte na segunda bola'],
    inGame: ['Contra-ataque: dê profundidade ao centroavante e liberdade ao ponta.', 'Dois volantes para ganhar a segunda bola.'],
    confidence: 'baixa',
    note: 'Baseado em reportagens sobre o sistema planejado para a temporada 2026/27. Pode mudar ao longo do ano.',
    reviewedAt: '2026-09-20',
    sources: [
      { label: 'Yahoo Sports: formação planejada', url: 'https://sports.yahoo.com/articles/report-formation-jose-mourinho-plans-102000058.html' },
      { label: 'Managing Madrid: formações e táticas', url: 'https://www.managingmadrid.com/formations-and-tactics' },
    ],
  },
  {
    slug: 'barcelona',
    name: 'Barcelona',
    country: 'Espanha',
    formation: '4-2-3-1',
    style: ['Linha defensiva muito alta', 'Pressão pós-perda', 'Toque curto e vertical'],
    principles: ['Linha alta para comprimir o campo', 'Armadilha de impedimento coordenada', 'Pressão imediata ao perder a bola'],
    inGame: [
      'Linha defensiva: alta, com pressão forte após a perda.',
      'Cuidado: linha alta pede zagueiros rápidos e coordenação. Sem isso, sofre bola nas costas.',
    ],
    confidence: 'media',
    note: 'Fontes concordam em 4-2-3-1 híbrido ou 4-3-3 flexível com linha alta. Use o 4-2-3-1 como base.',
    reviewedAt: '2026-09-20',
    sources: [{ label: 'Total Football Analysis: Flick no Barcelona', url: 'https://totalfootballanalysis.com/data-analysis/barcelona-2025-2026-hansi-flick-tactics-data-analysis-statistics' }],
  },
  {
    slug: 'manchester-city',
    name: 'Manchester City',
    country: 'Inglaterra',
    formation: '4-3-3',
    style: ['Posse de bola', 'Construção com goleiro', 'Meio-campo em caixa'],
    principles: ['Saída de bola com o goleiro entre os zagueiros', 'Meio-campo formando uma caixa na construção', 'Atacantes fixando a defesa adversária'],
    inGame: ['Construção: lenta e paciente, priorizando posse.', 'Peça paciência e triangulações; evite bola longa.'],
    confidence: 'media',
    note: 'A base é 4-3-3, e a construção baixa vira algo parecido com 4-2-5. Use o 4-3-3 como base.',
    reviewedAt: '2026-09-20',
    sources: [{ label: 'Total Football Analysis: Guardiola no City', url: 'https://totalfootballanalysis.com/head-coach-analysis/pep-guardiola-tactics-manchester-city-2025-2026-tactical-analysis' }],
  },
]

export const teamBySlug = (slug: string | undefined): TeamReference | undefined => TEAMS.find((t) => t.slug === slug)
