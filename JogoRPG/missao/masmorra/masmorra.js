import { colors } from "./../../utilitarios.js";
import { criarInimigoMasmorra } from "./criarInimigos.js";
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
    boss: {
      nome: "Ignarok, Senhor das Chamas Eternas",
      poder: "Erupção Infernal",
    },
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
    boss: { nome: "Morghul, o Decompositor", poder: "Praga da Corrupção" },
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
  shuffle(candidates); // Embaralha todos os candidatos // A lógica de BOSS deve ser a mesma

  let candidatesForBoss = [...candidates];
  candidatesForBoss.sort(function (a, b) {
    return manhattan(b, entrance) - manhattan(a, entrance);
  });
  let bossCellCoord = candidatesForBoss[0];
  grid[bossCellCoord.y][bossCellCoord.x].roomType = "boss"; // === ALTERAÇÃO AQUI: Usa a nova função para criar o chefe ===
  grid[bossCellCoord.y][bossCellCoord.x].content = criarInimigoMasmorra(
    tpl.boss.nome,
    dificuldade
  );
  const chanceDeDrop = 0.15 * dificuldade;
  if (Math.random() < chanceDeDrop / 100) {
    const orbe = itens.find((item) => item.nome === "Orbe da Fênix Flamejante");
    grid[bossCellCoord.y][bossCellCoord.x].content.recompensa = orbe;
    console.log(
      `${colors.cyan}O chefe esconde um tesouro lendário...${colors.reset}`
    );
  }
  bossPlaced = true; // Remova o chefe da lista de candidatos para outras salas
  candidates = candidates.filter(
    (c) => c.x !== bossCellCoord.x || c.y !== bossCellCoord.y
  ); // NOVO: Coloque os mini-chefes em salas aleatórias, sem ordenação

  let placedMinis = [];
  for (let i = 0; i < minibossCount && candidates.length > 0; i++) {
    let coord = candidates.shift();
    grid[coord.y][coord.x].roomType = "miniboss";
    const nomeMiniboss = tpl.minibosses[rand(0, tpl.minibosses.length - 1)]; // === ALTERAÇÃO AQUI: Usa a nova função para criar o mini-chefe ===
    grid[coord.y][coord.x].content = criarInimigoMasmorra(
      nomeMiniboss,
      dificuldade
    );
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
      // === ALTERAÇÃO AQUI: Usa a nova função para criar os monstros ===
      mobs.push(criarInimigoMasmorra(mobName, dificuldade));
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

// --- Importante: Adicione esta função auxiliar ---
// Essa função deve ser chamada sempre que o jogador entrar em uma nova sala
// Por exemplo, na sua função 'move()'
function marcarSalaComoVisitada(jogador, masmorra) {
  if (masmorra && jogador.posicao) {
    const salaAtual = masmorra.grid[jogador.posicao.y][jogador.posicao.x];
    if (salaAtual) {
      salaAtual.visited = true;
    }
  }
}

// --- Função auxiliar para centralizar o texto da célula ---
function centerText(text, width) {
  // Caso o texto já seja a largura máxima, não adicione padding
  if (text.length >= width) {
    return text;
  }
  const padding = width - text.length;
  const padStart = Math.floor(padding / 2);
  const padEnd = padding - padStart;
  return " ".repeat(padStart) + text + " ".repeat(padEnd);
}

// --- Nova Função 'look()' ---
export function look(state) {
  let mapLines = [];
  const grid = state.dungeon.grid;
  const mapWidth = grid[0].length;
  const mapHeight = grid.length;

  const cellWidth = 3;

  for (let y = 0; y < mapHeight; y++) {
    let topRow = "";
    let midRow = "";

    for (let x = 0; x < mapWidth; x++) {
      let cell = grid[y][x];

      // Adiciona uma verificação para a célula e a propriedade 'saida'
      const northCell = y > 0 ? grid[y - 1][x] : null;
      const hasNorthPath =
        northCell &&
        northCell.visited &&
        northCell.saida &&
        northCell.saida.includes("sul");

      topRow += "+";
      topRow += hasNorthPath ? "   " : "---";

      // Adiciona uma verificação para a célula e a propriedade 'saida'
      const westCell = x > 0 ? grid[y][x - 1] : null;
      const hasWestPath =
        westCell &&
        westCell.visited &&
        westCell.saida &&
        westCell.saida.includes("leste");

      midRow += hasWestPath ? " " : "|";

      if (state.x === x && state.y === y) {
        midRow += centerText("👤", cellWidth);
      } else if (cell.visited) {
        let content;
        switch (cell.roomType) {
          case "entrada":
            content = "E";
            break;
          case "saida":
            content = "S";
            break;
          case "inimigo":
            content = "M";
            break;
          case "miniboss":
            content = "M B";
          case "boss":
            content = "B";
            break;
          case "armadilha":
            content = "T";
            break;
          case "tesouro":
            content = "$";
            break;
          case "vazio":
            content = ".";
            break;
          default:
            content = " ";
            break;
        }
        midRow += centerText(content, cellWidth);
      } else {
        midRow += centerText("???", cellWidth);
      }
    }

    topRow += "+";
    midRow += "|";
    mapLines.push(topRow);
    mapLines.push(midRow);
  }

  // Desenha a última linha inferior
  let lastRow = "";
  for (let x = 0; x < mapWidth; x++) {
    lastRow += "+---";
  }
  lastRow += "+";
  mapLines.push(lastRow);

  return mapLines.join("\n");
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
  console.log(look(state));

  function inBounds(x, y) {
    return x >= 0 && y >= 0 && x < dungeon.size && y < dungeon.size;
  }

  function cellAt(x, y) {
    return dungeon.grid[y][x];
  }

  function move(dir) {
    marcarSalaComoVisitada();
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
    if (!cell.visited) {
      cell.visited = true;
      state.discoveries.push({ x: nx, y: ny, tipo: cell.roomType });
    }

    if (cell.roomType === "monstro") {
      const monstroEscolhido =
        cell.content.mobs[rand(0, cell.content.mobs.length - 1)];
      return {
        msg: `${colors.white}Um ${monstroEscolhido.nome} apareceu! Prepare-se para a batalha.${colors.reset}`,
        type: "batalha",
        inimigo: monstroEscolhido,
      };
    } else if (cell.roomType === "miniboss") {
      return {
        msg: `${colors.cyan}Você encontrou o mini-chefe da masmorra, ${cell.content.nome}!${colors.reset}`,
        type: "miniboss",
        inimigo: cell.content,
      };
    } else if (cell.roomType === "boss") {
      return {
        msg: `${colors.red}O Guardião da Masmorra, ${cell.content.nome}, se levanta para te enfrentar!${colors.reset}`,
        type: "boss",
        inimigo: cell.content,
      };
    } else if (cell.roomType === "trap") {
      return {
        msg: `${colors.yellow}Você caiu em uma armadilha! Tome cuidado ao andar.${colors.reset}`,
        type: "armadilha",
        dano: cell.content.dano,
      };
    } else if (cell.roomType === "treasure") {
      return {
        msg: `${colors.yellow}Você encontrou um Tesouro!${colors.reset}`,
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
      const mensagemSecreta =
        secretMessages[rand(0, secretMessages.length - 1)];
      return {
        msg: `${colors.gray}${mensagemSecreta}${colors.reset}`,
        type: "segredo",
      };
    } else if (cell.roomType === "entrada") {
      return {
        msg: `${colors.white}Você está na entrada da masmorra. O ar é pesado e misterioso...${colors.reset}`,
        type: "entrada",
      };
    } else {
      {
        return {
          msg: "Você se moveu, a sala está vazia.",
          type: "movimento",
        };
      }
    }
  }

  function investigate() {
    let cell = cellAt(state.x, state.y);

    if (cell.roomType === "trap") {
      let chance =
        30 +
        (state.jogador && state.jogador.bonusDesarme
          ? state.jogador.bonusDesarme
          : 0);

      if (rand(1, 100) <= chance) {
        // SUCESSO: Armadilha desarmada
        let msg = "Você desarmou a armadilha com sucesso!";
        // Apenas aqui a sala é limpa
        cell.roomType = "vazio";
        cell.content = null;
        return { ok: true, result: "disarmed", msg: msg };
      } else {
        // FALHA: Armadilha ativada
        let dano =
          cell.content && cell.content.dano ? cell.content.dano : rand(5, 15);
        state.jogador.hp -= dano;
        let msg2 = "Você acionou a armadilha e levou " + dano + " de dano!";
        // A sala NÃO é limpa. O jogador pode voltar e tentar novamente.
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

        // Limpa a sala após o baú ser saqueado
        cell.roomType = "vazio";
        cell.content = null;

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
      // A lógica de "secret" já limpa a sala, então está correta
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
    look: look.bind(null, state),
    move: move,
    investigate: investigate,
    getCurrentSummary: getCurrentSummary,
    distanceToBoss: distanceToBoss,
    grid: dungeon.grid,
  };
}

export { DUNGEON_TEMPLATES, gerarMasmorra, enterDungeon };
