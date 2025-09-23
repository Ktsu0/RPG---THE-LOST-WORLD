export const missoes = [
  {
    descricao: "Desafio da Arena Amaldiçoada",
    historia:
      "Um ritual arcano abriu um portal. Monstros surgem em ondas. Sobreviva e a recompensa será sua.",
    tipo: "lendario",
    nivelMinimo: 4,
    chanceSucesso: 100,
    // Recompensas escalam com o nível do jogador
    xp: (nivel) => 50 + nivel * 5,
    ouro: (nivel) => 100 + nivel * 10,
    item: { nome: "Fragmento Antigo", raridade: "lendario" },
    chanceMiniBoss: 1,
    chanceMissaoExtra: 15,
    chanceMasmorra: 5,
    falha: { tipo: "hp", percentual: 50 },
    tipoBatalha: "ondas",
    recompensaOndas: {
      item: { nome: "Fragmento Antigo", chance: 5 },
    },
    recompensaFinal: {
      item: { nome: "Fragmento Antigo", chance: 20 },
    },
  },
  {
    descricao: "Escoltar um mercador até a cidade",
    historia:
      "O mercador teme bandidos na estrada. Sua escolta é discreta, mas precisa ser rápida e firme.",
    tipo: "comum",
    nivelMinimo: 1,
    chanceSucesso: 85,
    // Recompensas escalam
    xp: (nivel) => 15 + nivel * 1,
    ouro: (nivel) => 10 + nivel * 1,
    chanceMiniBoss: 5, // Padronizado
    chanceMissaoExtra: 10, // Padronizado
    chanceMasmorra: 1, // Padronizado
    falha: { tipo: "hp", percentual: 10 },
  },
  {
    descricao: "Encontrar um amuleto escondido na floresta",
    historia:
      "Dizem que animais guardam um amuleto perdido. A floresta é traiçoeira; ouça os sinais antes de avançar.",
    tipo: "comum",
    nivelMinimo: 1,
    chanceSucesso: 80,
    xp: (nivel) => 25 + nivel * 2,
    ouro: (nivel) => 20 + nivel * 2,
    chanceMiniBoss: 5, // Padronizado
    chanceMissaoExtra: 10, // Padronizado
    chanceMasmorra: 1, // Padronizado
    falha: { tipo: "hp", percentual: 10 },
  },
  {
    descricao: "Ajudar o ferreiro local com materiais",
    historia:
      "O ferreiro precisa de minério raro para forjar uma lâmina. Trabalho braçal e risco de acidentes.",
    tipo: "comum",
    nivelMinimo: 1,
    chanceSucesso: 90,
    xp: (nivel) => 10 + nivel * 1,
    ouro: (nivel) => 8 + nivel * 1,
    chanceMiniBoss: 5, // Padronizado
    chanceMissaoExtra: 5, // Padronizado
    chanceMasmorra: 1, // Padronizado
    falha: { tipo: "hp", percentual: 10 },
  },
  {
    descricao: "Resgatar um aldeão perdido na floresta sombria",
    historia:
      "Gritos abafados ecoam entre as árvores. Encontrar o aldeão antes da noite é imperativo.",
    tipo: "comum",
    nivelMinimo: 2,
    chanceSucesso: 80,
    xp: (nivel) => 18 + nivel * 1.5,
    ouro: (nivel) => 12 + nivel * 1.5,
    item: { nome: "Pena do Corvo Sombrio", raridade: "comum" },
    chanceMiniBoss: 10,
    chanceMissaoExtra: 5,
    chanceMasmorra: 5,
    falha: { tipo: "hp", percentual: 10 },
  },
  {
    descricao: "Recuperar uma espada amaldiçoada em cavernas",
    historia:
      "A lâmina chama por sangue. Há sombras vivas nas profundezas — recupere a gema que a contém.",
    tipo: "lendario",
    nivelMinimo: 8,
    chanceSucesso: 50,
    xp: (nivel) => 40 + nivel * 4,
    ouro: (nivel) => 35 + nivel * 3,
    item: { nome: "Gema da Escuridão", raridade: "lendario" },
    chanceMiniBoss: 10,
    chanceMissaoExtra: 15,
    chanceMasmorra: 10,
    falha: { tipo: "item", chancePerdaItemPercent: 2 },
  },
  {
    descricao: "Proteger uma caravana de monstros à noite",
    historia:
      "Sob a lua, criaturas atacam em bando. Proteja a caravana e mantenha a rota aberta.",
    tipo: "raro",
    nivelMinimo: 4,
    chanceSucesso: 70,
    xp: (nivel) => 30 + nivel * 3,
    ouro: (nivel) => 25 + nivel * 2.5,
    item: { nome: "Essência da Noite", raridade: "raro" },
    chanceMiniBoss: 10,
    chanceMissaoExtra: 10,
    chanceMasmorra: 8,
    falha: { tipo: "ouro", percentualMin: 15, percentualMax: 20 },
  },
  {
    descricao: "Domar uma criatura mística",
    historia:
      "Domar o resistente espírito bestial exige coragem. Uma tentativa mal feita pode ferir gravemente.",
    tipo: "lendario",
    nivelMinimo: 8,
    chanceSucesso: 55,
    xp: (nivel) => 50 + nivel * 5,
    ouro: (nivel) => 40 + nivel * 4,
    item: { nome: "Escama de Dragão Azul", raridade: "lendario" },
    chanceMiniBoss: 10,
    chanceMissaoExtra: 5,
    chanceMasmorra: 10,
    falha: { tipo: "hp", percentual: 20 },
  },
  {
    descricao: "Roubar relíquias de um templo antigo",
    historia:
      "Guardas e armadilhas protegem tesouros sagrados. A audácia traz lucros, mas pode trazer caça.",
    tipo: "raro",
    nivelMinimo: 4,
    chanceSucesso: 70,
    xp: (nivel) => 45 + nivel * 4,
    ouro: (nivel) => 38 + nivel * 3.5,
    item: { nome: "Relíquia Brilhante", raridade: "raro" },
    chanceMiniBoss: 10,
    chanceMissaoExtra: 5,
    chanceMasmorra: 8,
    falha: { tipo: "ouro", percentualMin: 15, percentualMax: 20 },
  },
  {
    descricao: "Salvar um sábio em ruínas místicas",
    historia:
      "Um sábio preso pode oferecer conhecimento raro em troca da sua bravura. Corra contra o tempo.",
    tipo: "comum",
    nivelMinimo: 2,
    chanceSucesso: 85,
    xp: (nivel) => 28 + nivel * 2,
    ouro: (nivel) => 18 + nivel * 1.8,
    item: { nome: "Pergaminho Arcano", raridade: "comum" },
    chanceMiniBoss: 10,
    chanceMissaoExtra: 5,
    chanceMasmorra: 5,
    falha: { tipo: "hp", percentual: 10 },
  },
  {
    descricao: "Recuperar um livro proibido na biblioteca sombria",
    historia:
      "Entre estantes empoeiradas, o livro sussurra segredos que podem corromper ou capacitar.",
    tipo: "raro",
    nivelMinimo: 4,
    chanceSucesso: 75,
    xp: (nivel) => 42 + nivel * 3.5,
    ouro: (nivel) => 32 + nivel * 3,
    item: { nome: "Página Amaldiçoada", raridade: "raro" },
    chanceMiniBoss: 10,
    chanceMissaoExtra: 5,
    chanceMasmorra: 8,
    falha: { tipo: "ouro", percentualMin: 15, percentualMax: 20 },
  },
  {
    descricao: "Explorar o vulcão em erupção",
    historia:
      "Calor e cinzas testam sua resistência. No coração do vulcão, o poder ardente espera ser tomado.",
    tipo: "lendario",
    nivelMinimo: 8,
    chanceSucesso: 45,
    xp: (nivel) => 55 + nivel * 5,
    ouro: (nivel) => 50 + nivel * 4.5,
    item: { nome: "Coração de Magma", raridade: "lendario" },
    chanceMiniBoss: 10,
    chanceMissaoExtra: 5,
    chanceMasmorra: 10,
    falha: { tipo: "item", chancePerdaItemPercent: 2 },
  },
  {
    descricao: "Eliminar uma seita secreta",
    historia:
      "Rituais obscuros se aproximam do auge. Interrompa-os antes que criaturas sejam invocadas.",
    tipo: "raro",
    nivelMinimo: 4,
    chanceSucesso: 75,
    xp: (nivel) => 38 + nivel * 3,
    ouro: (nivel) => 28 + nivel * 2.8,
    item: { nome: "Máscara Sombria", raridade: "raro" },
    chanceMiniBoss: 10,
    chanceMissaoExtra: 5,
    chanceMasmorra: 8,
    falha: { tipo: "ouro", percentualMin: 15, percentualMax: 20 },
  },
  {
    descricao: "Ajudar a curandeira a coletar ervas raras",
    historia:
      "Ervas que florescem apenas ao amanhecer são preciosas. Proteja a curandeira durante a coleta.",
    tipo: "comum",
    nivelMinimo: 2,
    chanceSucesso: 85,
    xp: (nivel) => 20 + nivel * 1.8,
    ouro: (nivel) => 15 + nivel * 1.5,
    item: { nome: "Flor da Aurora", raridade: "comum" },
    chanceMiniBoss: 10,
    chanceMissaoExtra: 5,
    chanceMasmorra: 5,
    falha: { tipo: "hp", percentual: 10 },
  },
];
