export interface Formation {
  slug: string
  name: string
  /** Players per line from the defence to the attack, goalkeeper excluded. */
  lines: number[]
  summary: string
  strengths: string[]
  weaknesses: string[]
  tips: string[]
}

export const FORMATIONS: Formation[] = [
  {
    slug: '4-2-3-1',
    name: '4-2-3-1',
    lines: [4, 2, 3, 1],
    summary: 'Dois volantes protegem a zaga e três meias criam atrás de um centroavante. O mais equilibrado para quem quer defender bem sem abrir mão de ataque.',
    strengths: ['Proteção forte da entrada da área', 'Três meias para triangular', 'Fácil de trocar entre defender e atacar'],
    weaknesses: ['Centroavante pode ficar isolado', 'Depende dos meias chegarem à área'],
    tips: [
      'Mantenha um dos dois volantes sempre na frente da área, mesmo quando o time ataca.',
      'Se o centroavante ficar isolado, coloque o meia central com função de chegar à área.',
    ],
  },
  {
    slug: '4-3-3',
    name: '4-3-3',
    lines: [4, 3, 3],
    summary: 'Ataque largo com dois pontas e um centroavante, e um trio de meio-campo. Bom para pressionar alto e jogar pelas beiradas.',
    strengths: ['Largura e velocidade nas pontas', 'Pressão alta organizada', 'Muitas linhas de passe'],
    weaknesses: ['Espaço nas costas dos pontas', 'Laterais ficam expostos se subirem juntos'],
    tips: [
      'Use um volante fixo no trio do meio para dar cobertura aos laterais.',
      'Só um lateral sobe por vez; o outro fica como terceiro zagueiro.',
    ],
  },
  {
    slug: '4-4-2',
    name: '4-4-2',
    lines: [4, 4, 2],
    summary: 'Duas linhas de quatro compactas e dois atacantes que se ajudam. Simples e difícil de furar.',
    strengths: ['Muito compacto', 'Fácil de entender e de defender', 'Boa largura'],
    weaknesses: ['Meio-campo em inferioridade contra três meias', 'Pouca criação pelo centro'],
    tips: [
      'Um dos atacantes pode recuar para ajudar o meio-campo.',
      'Mantenha as duas linhas de quatro próximas para não deixar espaço entre elas.',
    ],
  },
  {
    slug: '4-1-4-1',
    name: '4-1-4-1',
    lines: [4, 1, 4, 1],
    summary: 'Um volante fixo protege a zaga e quatro meias se abrem e se aproximam. Boa base para bloco médio e contra-ataque.',
    strengths: ['Volante fixo protege a meia-lua', 'Quatro meias dão largura e chegada'],
    weaknesses: ['Atacante isolado', 'Volante único pode ser sobrecarregado'],
    tips: ['Escolha um volante com bom posicionamento, não só de força.', 'Peça a um meia por dentro para apoiar o atacante.'],
  },
  {
    slug: '4-5-1',
    name: '4-5-1',
    lines: [4, 5],
    summary: 'Cinco no meio para dominar o centro e proteger a defesa. Jogo mais paciente e de contra-ataque.',
    strengths: ['Domina o meio-campo', 'Difícil de atacar pelo centro'],
    weaknesses: ['Pouco ataque se os meias não chegam', 'Depende de um centroavante forte'],
    tips: ['Use os meias de fora para chegar à área em vez de esperar a bola.'],
  },
  {
    slug: '4-1-2-1-2',
    name: '4-1-2-1-2 (estreito)',
    lines: [4, 1, 2, 1, 2],
    summary: 'Losango no meio com dois atacantes. Forte por dentro, mas sem ninguém aberto: os laterais precisam dar a largura.',
    strengths: ['Superioridade no centro', 'Dois atacantes próximos do meia'],
    weaknesses: ['Sem largura natural', 'Vulnerável nas laterais'],
    tips: ['Deixe os laterais subirem, mas com um volante cobrindo o espaço deles.'],
  },
  {
    slug: '4-3-2-1',
    name: '4-3-2-1',
    lines: [4, 3, 2, 1],
    summary: 'Três no meio, dois meias por dentro e um centroavante. Muito jogo pelo centro, pouco pelas pontas.',
    strengths: ['Passes curtos por dentro', 'Meias perto do centroavante'],
    weaknesses: ['Pouca largura', 'Laterais precisam fazer tudo pelas beiradas'],
    tips: ['Alterne o jogo com o lateral aberto para esticar a defesa adversária.'],
  },
  {
    slug: '3-5-2',
    name: '3-5-2',
    lines: [3, 5, 2],
    summary: 'Três zagueiros, cinco no meio (com alas) e dois atacantes. Domina o meio, mas exige disciplina dos alas e da zaga.',
    strengths: ['Cinco no meio-campo', 'Dois atacantes na frente', 'Alas dão largura'],
    weaknesses: ['Espaço nas costas dos alas', 'Zaga exposta se os volantes saem da frente da área'],
    tips: [
      'Zagueiros com função de "Defesa" costumam proteger melhor a área do que funções que avançam.',
      'Mantenha pelo menos um volante fixo na frente da zaga.',
    ],
  },
  {
    slug: '3-4-3',
    name: '3-4-3',
    lines: [3, 4, 3],
    summary: 'Muito ataque: três atacantes, quatro no meio e três zagueiros. Alto risco e alto retorno.',
    strengths: ['Muitos jogadores no ataque', 'Pressão alta forte'],
    weaknesses: ['Contra-ataques pelas laterais', 'Só dois no meio para proteger'],
    tips: ['Use quando precisa buscar o resultado; troque para uma formação mais fechada ao ganhar.'],
  },
  {
    slug: '5-3-2',
    name: '5-3-2',
    lines: [5, 3, 2],
    summary: 'Cinco defensores com alas, trio no meio e dois atacantes. Muito sólido e bom para contra-atacar.',
    strengths: ['Defesa sólida', 'Bom para contra-ataque com dois atacantes'],
    weaknesses: ['Pouca criação', 'Pode ficar recuado demais'],
    tips: ['Use os alas para sair no contra-ataque, com um volante cobrindo o lado.'],
  },
]

export const formationBySlug = (slug: string | undefined): Formation | undefined => FORMATIONS.find((f) => f.slug === slug)
