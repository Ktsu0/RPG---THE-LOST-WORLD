import { colors } from "./../../utilitarios.js";

// ---------- Helpers ----------
function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    let tmp = array[i];
    array[i] = array[j];
    array[j] = tmp;
  }
  return array;
}

function manhattan(a, b) {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}
let itens = [
  {
    nome: "Orbe da Fênix Flamejante",
    tipo: "reliquia",
    qualidade: "Único",
    efeito: "ressuscitar",
  },
];
// ---------- Templates de masmorras (10 tipos) ----------
let DUNGEON_TEMPLATES = [
  {
    id: 0,
    nome: "Catacumbas Sombras",
    tema: "cripta",
    dificuldade: 1,
    mobs: [
      "Esqueleto Errante",
      "Zumbi Corrompido",
      "Rato Gigante",
      "Sombra Menor",
    ],
    minibosses: ["Coveiro Errante", "Guardião Ossudo", "Cenobita das Trevas"],
    boss: { nome: "Kaelthos, Mestre das Catacumbas", poder: "Necromancia" },
    trapChance: 20,
    secretChance: 18,
    treasureMultiplier: 1.1,
  },
  {
    id: 1,
    nome: "Ruínas da Floresta",
    tema: "floresta",
    dificuldade: 2,
    mobs: ["Lobo Selvagem", "Aranha Venenosa", "Bandido da Selva"],
    minibosses: ["Xamã Corvo", "Capitão dos Lobos", "Ent Enraizado"],
    boss: {
      nome: "Verdanth, Guardião Primordial da Selva",
      poder: "Raízes Presas",
    },
    trapChance: 12,
    secretChance: 22,
    treasureMultiplier: 1.0,
  },
  {
    id: 2,
    nome: "Caverna do Gelo",
    tema: "gelo",
    dificuldade: 5,
    mobs: ["Guerreiro Congelado", "Harpia Gelada", "Caranguejo de Cristal"],
    minibosses: ["Lorde Glacial", "Górgula de Gelo", "Urso de Cristal"],
    boss: { nome: "Aurlion, o Dragão Glacial", poder: "Sopro Glaciar" },
    trapChance: 10,
    secretChance: 15,
    treasureMultiplier: 1.2,
  },
  {
    id: 3,
    nome: "Fornalha Infernal",
    tema: "fogo",
    dificuldade: 5,
    mobs: ["Lacaio de Fogo", "Golem de Lava", "Escorpião Flamejante"],
    minibosses: ["Forjador Ardente", "Senhor das Brasas", "Ancião de Magma"],
    boss: { nome: "Ignarok, Senhor das Chamas Eternas", poder: "Erupção" },
    trapChance: 25,
    secretChance: 10,
    treasureMultiplier: 1.4,
  },
  {
    id: 4,
    nome: "Biblioteca Antiga",
    tema: "arcano",
    dificuldade: 3,
    mobs: ["Acólito Corrompido", "Livro Animado", "Gárgula de Pedra"],
    minibosses: ["Bibliotecário Louco", "Escriba Profano", "Ancião Arcano"],
    boss: {
      nome: "Thal’Mor, Guardião dos Segredos Proibidos",
      poder: "Feitiços Antigos",
    },
    trapChance: 8,
    secretChance: 30,
    treasureMultiplier: 1.3,
  },
  {
    id: 5,
    nome: "Mina Abandonada",
    tema: "mina",
    dificuldade: 2,
    mobs: ["Rato do Subsolo", "Bandido Mineiro", "Autômato Danificado"],
    minibosses: [
      "Capataz Caído",
      "Gárgula de Minério",
      "Homem de Pedra das Minas",
    ],
    boss: {
      nome: "Golem Minerador, Sentinela das Profundezas",
      poder: "Impacto Sísmico",
    },
    trapChance: 18,
    secretChance: 14,
    treasureMultiplier: 1.0,
  },
  {
    id: 6,
    nome: "Pântano Putrefato",
    tema: "pântano",
    dificuldade: 3,
    mobs: ["Répteis do Lodo", "Híbrido Putrefato", "Mosca Gigante"],
    minibosses: ["Xamã Venenoso", "Feiticeira do Brejo", "Monstro da Lama"],
    boss: { nome: "Morghul, o Decompositor", poder: "Praga" },
    trapChance: 22,
    secretChance: 16,
    treasureMultiplier: 0.9,
  },
  {
    id: 7,
    nome: "Templo das Sombras",
    tema: "templo",
    dificuldade: 7,
    mobs: ["Sentinela Obscura", "Acólito Maldito", "Neófito Sombrio"],
    minibosses: ["Sacerdote Negro", "Arauto das Trevas", "Sentinela Eterna"],
    boss: {
      nome: "Sombra Suprema, Guardiã das Trevas",
      poder: "Lâmina Etérea",
    },
    trapChance: 20,
    secretChance: 18,
    treasureMultiplier: 1.2,
  },
  {
    id: 8,
    nome: "Forja Elemental",
    tema: "forja",
    dificuldade: 5,
    mobs: ["Faísca Viva", "Metalúnculo", "Operário Enlouquecido"],
    minibosses: [
      "Mestre Ferreiro",
      "Centurião Metálico",
      "Arcanista de Ferros",
    ],
    boss: {
      nome: "Forjador Elemental, Senhor do Martelo",
      poder: "Martelo Incandescente",
    },
    trapChance: 15,
    secretChance: 12,
    treasureMultiplier: 1.5,
  },
  {
    id: 9,
    nome: "Torre dos Ecos",
    tema: "torre",
    dificuldade: 10,
    mobs: ["Eco Errante", "Guardião de Pedra", "Magus Errático"],
    minibosses: ["Senhor do Eco", "Mestre das Runas", "Sentinela Temporal"],
    boss: {
      nome: "Lorde do Tempo, Mestre das Areias",
      poder: "Ruptura Temporal",
    },
    trapChance: 14,
    secretChance: 20,
    treasureMultiplier: 1.6,
  },
];

function determinarDificuldade(jogador) {
  let nivel;

  // Usa uma lógica de verificação mais simples
  if (jogador && typeof jogador.nivel === "number" && jogador.nivel >= 1) {
    nivel = jogador.nivel;
  } else {
    // Se o jogador ou o nível não for válido, define o valor padrão
    nivel = 1;
  }

  // Agora, `nivel` existe e pode ser usado nas próximas verificações.
  if (nivel >= 1 && nivel < 5) {
    return rand(1, 5);
  } else if (nivel >= 5 && nivel < 10) {
    return rand(3, 8);
  } else if (nivel >= 10) {
    return rand(5, 10);
  }

  // Retorno padrão de segurança
  return 1;
}

// ---------- Geração de mapa (Grade 5x5 por padrão) ----------
function createEmptyGrid(size) {
  let grid = [];
  for (let y = 0; y < size; y++) {
    grid[y] = [];
    for (let x = 0; x < size; x++) {
      grid[y][x] = {
        x: x,
        y: y,
        explored: false,
        roomType: "vazio",
        content: null,
      };
    }
  }
  return grid;
}

// colocamos entrada no centro
function getCenter(size) {
  let c = Math.floor(size / 2);
  return { x: c, y: c };
}

// ---------- Gerador de masmorra ----------
function gerarMasmorra(jogador, templateId, options) {
  options = options || {};

  const dificuldade = determinarDificuldade(jogador.nivel);

  let tpl = DUNGEON_TEMPLATES[templateId];
  if (!tpl) throw new Error("Template de masmorra inválido: " + templateId);

  let size = options.size || 5;
  let grid = createEmptyGrid(size);
  let entrance = getCenter(size);
  let entranceCell = grid[entrance.y][entrance.x];
  entranceCell.roomType = "entrada";
  entranceCell.explored = false;

  let mobRoomsCount = rand(10, 20);
  let minibossCount = rand(3, 5);
  let totalRooms = size * size;
  let remaining = totalRooms - 1;
  let bossPlaced = false;

  let candidates = [];
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (!(x === entrance.x && y === entrance.y))
        candidates.push({ x: x, y: y });
    }
  }
  shuffle(candidates); // Embaralha todos os candidatos

  // A lógica de BOSS deve ser a mesma
  let candidatesForBoss = [...candidates];
  candidatesForBoss.sort(function (a, b) {
    return manhattan(b, entrance) - manhattan(a, entrance);
  });
  let bossCellCoord = candidatesForBoss[0];
  grid[bossCellCoord.y][bossCellCoord.x].roomType = "boss";
  grid[bossCellCoord.y][bossCellCoord.x].content = {
    tipo: "boss",
    nome: tpl.boss.nome,
    poder: tpl.boss.poder,
    hp: rand(150, 300) * dificuldade,
    atk: rand(25, 45) * dificuldade,
    def: rand(15, 30) * dificuldade,
  };
  const chanceDeDrop = 100 * dificuldade;
  if (Math.random() < chanceDeDrop / 100) {
    const orbe = itens.find((item) => item.nome === "Orbe da Fênix Flamejante");
    grid[bossCellCoord.y][bossCellCoord.x].content.recompensa = orbe;
    console.log(
      `${colors.cyan}O chefe esconde um tesouro lendário...${colors.reset}`
    );
  }
  bossPlaced = true;
  // Remova o chefe da lista de candidatos para outras salas
  candidates = candidates.filter(
    (c) => c.x !== bossCellCoord.x || c.y !== bossCellCoord.y
  );

  // NOVO: Coloque os mini-chefes em salas aleatórias, sem ordenação
  let placedMinis = [];
  for (let i = 0; i < minibossCount && candidates.length > 0; i++) {
    let coord = candidates.shift();
    grid[coord.y][coord.x].roomType = "miniboss";
    const nomeMiniboss = tpl.minibosses[rand(0, tpl.minibosses.length - 1)];
    grid[coord.y][coord.x].content = {
      tipo: "miniboss",
      nome: nomeMiniboss,
      hp: rand(40, 80) * dificuldade,
      atk: rand(10, 20) * dificuldade,
      def: rand(5, 15) * dificuldade,
    };
    placedMinis.push(coord);
  }

  let placedMobs = 0;
  let mobCandidates = [];
  for (let y2 = 0; y2 < size; y2++) {
    for (let x2 = 0; x2 < size; x2++) {
      let cell = grid[y2][x2];
      if (cell.roomType === "vazio") mobCandidates.push({ x: x2, y: y2 });
    }
  }
  shuffle(mobCandidates);

  while (placedMobs < mobRoomsCount && mobCandidates.length > 0) {
    let c = mobCandidates.shift();
    grid[c.y][c.x].roomType = "monstro";
    let mobName = tpl.mobs[rand(0, tpl.mobs.length - 1)];
    let quantidade = rand(1, 3);
    let mobs = [];
    for (let k = 0; k < quantidade; k++) {
      mobs.push({
        nome: mobName,
        hp: Math.floor(Math.max(6, rand(6, 20) + rand(-2, 4)) * dificuldade),
        atk: Math.floor(rand(5, 10) * dificuldade),
        def: Math.floor(rand(1, 5) * dificuldade),
      });
    }
    grid[c.y][c.x].content = { tipo: "mobs", mobs: mobs };
    placedMobs++;
  }

  let remainingCells = [];
  for (let yy = 0; yy < size; yy++) {
    for (let xx = 0; xx < size; xx++) {
      let cc = grid[yy][xx];
      if (cc.roomType === "vazio") remainingCells.push(cc);
    }
  }
  shuffle(remainingCells);

  let trapChance = tpl.trapChance || 15;
  for (let i2 = 0; i2 < remainingCells.length; i2++) {
    let cell = remainingCells[i2];
    let r = rand(1, 100);
    if (r <= trapChance) {
      cell.roomType = "trap";
      cell.content = {
        tipo: "trap",
        dano: Math.floor(rand(5, 18) * dificuldade),
        descricao: "Armadilha oculta",
      };
    } else {
      let sroll = rand(1, 100);
      let secretChance = tpl.secretChance || 15;
      if (sroll <= secretChance) {
        cell.roomType = "secret";
        let stype = ["chest", "puzzle", "lore"][rand(0, 2)];
        const secretMessages = [
          "Você encontrou um mural antigo com runas esquecidas.",
          "Há um baú de madeira escondido atrás de uma pedra solta.",
          "Um quebra-cabeça de luzes está entalhado na parede.",
          "Você sente uma aura mística emanando de um símbolo no chão.",
          "Uma pequena fresta na parede revela um vislumbre de ouro.",
        ];
        cell.content = {
          tipo: "secret",
          kind: stype,
          reward: null,
          msg: secretMessages[rand(0, secretMessages.length - 1)],
        };
      } else if (sroll <= secretChance + 10) {
        cell.roomType = "treasure";
        let chanceHasReward = rand(1, 100);
        if (chanceHasReward <= 70) {
          let baseGold = rand(10, 60);
          let gold = Math.floor(
            baseGold * (tpl.treasureMultiplier || 1) * dificuldade
          );
          cell.content = { tipo: "treasure", ouro: gold, item: null };
        } else {
          cell.content = {
            tipo: "treasure",
            ouro: 0,
            item: null,
            msg: "Vazio — já saqueado",
          };
        }
      } else {
        cell.roomType = "vazio";
        cell.content = null;
      }
    }
  }

  let dungeon = {
    template: tpl,
    size: size,
    grid: grid,
    entrance: entrance,
    start: { x: entrance.x, y: entrance.y, facing: "north" },
    mobsExpected: placedMobs,
    minibosses: minibossCount,
    bossPlaced: bossPlaced,
    generatedAt: new Date(),
    cleared: false,
  };
  return dungeon;
}

// ---------- API de exploração (estado da masmorra durante exploração) ----------
function enterDungeon(dungeon, jogador, callbacks) {
  callbacks = callbacks || {};
  let state = {
    dungeon: dungeon,
    jogador: jogador,
    x: dungeon.start.x,
    y: dungeon.start.y,
    facing: dungeon.start.facing,
    steps: 0,
    discoveries: [],
    cleared: false,
  };
  jogador.masmorraAtual = state.dungeon;

  function inBounds(x, y) {
    return x >= 0 && y >= 0 && x < dungeon.size && y < dungeon.size;
  }

  function cellAt(x, y) {
    return dungeon.grid[y][x];
  }

  function look() {
    let cell = cellAt(state.x, state.y);
    let desc = [];
    desc.push(
      "Você está na sala (" +
        state.x +
        "," +
        state.y +
        ") - tipo: " +
        cell.roomType
    );
    let dirs = [
      { dx: 0, dy: -1, name: "norte" },
      { dx: 0, dy: 1, name: "sul" },
      { dx: 1, dy: 0, name: "leste" },
      { dx: -1, dy: 0, name: "oeste" },
    ];
    for (let i = 0; i < dirs.length; i++) {
      let nx = state.x + dirs[i].dx;
      let ny = state.y + dirs[i].dy;
      if (inBounds(nx, ny)) {
        let c = cellAt(nx, ny);
        let summary = "(" + nx + "," + ny + "): " + c.roomType;
        desc.push("Ao " + dirs[i].name + " você vê: " + summary);
      }
    }
    return desc.join("\n");
  }

  function move(dir) {
    let realDir = dir;
    let mapping = {
      norte: { dx: 0, dy: -1 },
      sul: { dx: 0, dy: 1 },
      leste: { dx: 1, dy: 0 },
      oeste: { dx: -1, dy: 0 },
    };
    if (
      dir === "frente" ||
      dir === "tras" ||
      dir === "esquerda" ||
      dir === "direita"
    ) {
      let f = state.facing;
      if (dir === "frente") {
        if (f === "north") realDir = "norte";
        else if (f === "south") realDir = "sul";
        else if (f === "east") realDir = "leste";
        else realDir = "oeste";
      } else if (dir === "tras") {
        if (f === "north") realDir = "sul";
        else if (f === "south") realDir = "norte";
        else if (f === "east") realDir = "oeste";
        else realDir = "leste";
      } else if (dir === "esquerda") {
        if (f === "north") realDir = "oeste";
        else if (f === "south") realDir = "leste";
        else if (f === "east") realDir = "north";
        else realDir = "south";
      } else if (dir === "direita") {
        if (f === "north") realDir = "leste";
        else if (f === "south") realDir = "oeste";
        else if (f === "east") realDir = "sul";
        else realDir = "north";
      }
    }
    let shortMap = { n: "norte", s: "sul", e: "leste", o: "oeste" };
    if (shortMap[realDir]) realDir = shortMap[realDir];
    let vec = mapping[realDir];
    if (!vec) return { ok: false, msg: "Direção inválida." };

    let nx = state.x + vec.dx;
    let ny = state.y + vec.dy;
    if (!inBounds(nx, ny))
      return { ok: false, msg: "Você bateu em uma parede." };

    state.x = nx;
    state.y = ny;
    state.steps += 1;

    let cell = cellAt(nx, ny);
    if (!cell.explored) {
      cell.explored = true;
      state.discoveries.push({ x: nx, y: ny, tipo: cell.roomType });
    }

    if (cell.roomType === "monstro") {
      const monstroEscolhido =
        cell.content.mobs[rand(0, cell.content.mobs.length - 1)];
      return {
        msg: `Um ${monstroEscolhido.nome} apareceu! Prepare-se para a batalha.`,
        type: "batalha",
        inimigo: monstroEscolhido,
      };
    } else if (cell.roomType === "miniboss") {
      return {
        msg: `Você encontrou o mini-chefe da masmorra, ${cell.content.nome}!`,
        type: "miniboss",
        inimigo: cell.content,
      };
    } else if (cell.roomType === "boss") {
      return {
        msg: `O Guardião da Masmorra, ${cell.content.nome}, se levanta para te enfrentar!`,
        type: "boss",
        inimigo: cell.content,
      };
    } else if (cell.roomType === "trap") {
      return {
        msg: "Você caiu em uma armadilha! Tome cuidado ao andar.",
        type: "armadilha",
        dano: cell.content.dano,
      };
    } else if (cell.roomType === "treasure") {
      return {
        msg: "Você encontrou um tesouro!",
        type: "tesouro",
        item: cell.content.item,
        ouro: cell.content.ouro,
      };
    } else if (cell.roomType === "secret") {
      const secretMessages = [
        "Você encontrou um mural antigo com runas esquecidas.",
        "Há um baú de madeira escondido atrás de uma pedra solta.",
        "Um quebra-cabeça de luzes está entalhado na parede.",
        "Você sente uma aura mística emanando de um símbolo no chão.",
        "Uma pequena fresta na parede revela um vislumbre de ouro.",
      ];
      return {
        msg: secretMessages[rand(0, secretMessages.length - 1)],
        type: "segredo",
      };
    } else {
      return {
        msg: "Você se moveu, a sala está vazia.",
        type: "movimento",
      };
    }
  }

  function investigate() {
    let cell = cellAt(state.x, state.y);
    if (cell.roomType === "trap") {
      let chance =
        50 +
        (state.jogador && state.jogador.bonusDesarme
          ? state.jogador.bonusDesarme
          : 0);
      if (rand(1, 100) <= chance) {
        let dmgAvoided = true;
        cell.roomType = "vazio";
        let msg = "Você desarmou a armadilha com sucesso!";
        return { ok: true, result: "disarmed", msg: msg };
      } else {
        let dano =
          cell.content && cell.content.dano ? cell.content.dano : rand(5, 15);
        state.jogador.hp -= dano;
        let msg2 = "Você acionou a armadilha e levou " + dano + " de dano!";
        cell.roomType = "vazio";
        cell.content = null;
        return { ok: true, result: "triggered", dano: dano, msg: msg2 };
      }
    } else if (cell.roomType === "treasure") {
      let cont = cell.content || {};
      if (cont.ouro && cont.ouro > 0) {
        let gold = cont.ouro;
        let item = null;
        if (rand(1, 100) <= 25) item = "Item Raro";
        cell.content.ouro = 0;
        cell.content.msg = "Vazio — saqueado";
        state.jogador.ouro = (state.jogador.ouro || 0) + gold;
        return {
          ok: true,
          result: "treasure",
          gold: gold,
          item: item,
          msg: "Você encontrou " + gold + " de ouro!",
        };
      } else {
        return {
          ok: true,
          result: "empty",
          msg: cont.msg || "O baú está vazio.",
        };
      }
    } else if (cell.roomType === "secret") {
      if (rand(1, 100) <= 60) {
        let rewardType = ["ouro", "fragmento", "item"][rand(0, 2)];
        if (rewardType === "ouro") {
          let g = rand(20, 80);
          state.jogador.ouro = (state.jogador.ouro || 0) + g;
          cell.roomType = "vazio";
          return {
            ok: true,
            result: "secret",
            gold: g,
            msg: "Você achou um esconderijo com " + g + " de ouro!",
          };
        } else if (rewardType === "fragmento") {
          state.jogador.fragmentos = (state.jogador.fragmentos || 0) + 1;
          cell.roomType = "vazio";
          return {
            ok: true,
            result: "secret",
            fragment: 1,
            msg: "Você encontrou um fragmento antigo!",
          };
        } else {
          cell.roomType = "vazio";
          return {
            ok: true,
            result: "secret",
            item: "Relíquia",
            msg: "Você encontrou uma relíquia!",
          };
        }
      } else {
        return {
          ok: true,
          result: "nothing",
          msg: "Você não encontrou nada relevante.",
        };
      }
    } else {
      return { ok: true, result: "nothing", msg: "Nada de especial aqui." };
    }
  }

  function getCurrentSummary() {
    let c = cellAt(state.x, state.y);
    return {
      pos: { x: state.x, y: state.y },
      roomType: c.roomType,
      content: c.content,
      playerHp: state.jogador.hp,
      playerOuro: state.jogador.ouro,
    };
  }

  function distanceToBoss() {
    let bossPos = null;
    for (let yy = 0; yy < dungeon.size; yy++) {
      for (let xx = 0; xx < dungeon.size; xx++) {
        if (dungeon.grid[yy][xx].roomType === "boss")
          bossPos = { x: xx, y: yy };
      }
    }
    if (!bossPos) return null;
    return manhattan({ x: state.x, y: state.y }, bossPos);
  }

  return {
    state: state,
    look: look,
    move: move,
    investigate: investigate,
    getCurrentSummary: getCurrentSummary,
    distanceToBoss: distanceToBoss,
    grid: dungeon.grid,
  };
}

export { DUNGEON_TEMPLATES, gerarMasmorra, enterDungeon };
