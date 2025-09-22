import { rand } from "./../utilitarios.js";

// A função agora recebe o nome e a dificuldade como parâmetros
export function criarInimigoMasmorra(nome, dificuldade) {
  let inimigoBase = {};

  switch (nome) {
    // === TIER 1: INIMIGOS FRÁGEIS ===
    case "Esqueleto Errante":
      inimigoBase = {
        nome: "Esqueleto Errante",
        hp: 12,
        atk: 4,
        class: 1,
        tipo: "monstro",
      };
      break;
    case "Zumbi Corrompido":
      inimigoBase = {
        nome: "Zumbi Corrompido",
        hp: 15,
        atk: 5,
        class: 1,
        tipo: "monstro",
      };
      break;
    case "Rato Gigante":
      inimigoBase = {
        nome: "Rato Gigante",
        hp: 10,
        atk: 3,
        class: 1,
        tipo: "monstro",
      };
      break;
    case "Espectro Sombrio":
      inimigoBase = {
        nome: "Espectro Sombrio",
        hp: 13,
        atk: 6,
        class: 1,
        tipo: "monstro",
      };
      break;
    case "Lobo Selvagem":
      inimigoBase = {
        nome: "Lobo Selvagem",
        hp: 18,
        atk: 7,
        class: 1,
        tipo: "monstro",
      };
      break;
    case "Aranha Venenosa":
      inimigoBase = {
        nome: "Aranha Venenosa",
        hp: 16,
        atk: 6,
        class: 1,
        tipo: "monstro",
      };
      break;
    case "Bandido da Selva":
      inimigoBase = {
        nome: "Bandido da Selva",
        hp: 20,
        atk: 8,
        class: 1,
        tipo: "monstro",
      };
      break;
    case "Guerreiro Congelado":
      inimigoBase = {
        nome: "Guerreiro Congelado",
        hp: 25,
        atk: 9,
        class: 1,
        tipo: "monstro",
      };
      break;
    case "Harpia Gelada":
      inimigoBase = {
        nome: "Harpia Gelada",
        hp: 22,
        atk: 10,
        class: 1,
        tipo: "monstro",
      };
      break;

    // === TIER 2: INIMIGOS PADRÕES ===
    case "Caranguejo de Cristal":
      inimigoBase = {
        nome: "Caranguejo de Cristal",
        hp: 30,
        atk: 9,
        class: 2,
        tipo: "monstro",
      };
      break;
    case "Lacaio de Fogo":
      inimigoBase = {
        nome: "Lacaio de Fogo",
        hp: 28,
        atk: 11,
        class: 2,
        tipo: "monstro",
      };
      break;
    case "Golem de Lava":
      inimigoBase = {
        nome: "Golem de Lava",
        hp: 35,
        atk: 12,
        class: 2,
        tipo: "monstro",
      };
      break;
    case "Escorpião Flamejante":
      inimigoBase = {
        nome: "Escorpião Flamejante",
        hp: 32,
        atk: 13,
        class: 2,
        tipo: "monstro",
      };
      break;
    case "Acólito Corrompido":
      inimigoBase = {
        nome: "Acólito Corrompido",
        hp: 25,
        atk: 10,
        class: 2,
        tipo: "monstro",
      };
      break;
    case "Livro Animado":
      inimigoBase = {
        nome: "Livro Animado",
        hp: 20,
        atk: 8,
        class: 2,
        tipo: "monstro",
      };
      break;
    case "Gárgula de Pedra":
      inimigoBase = {
        nome: "Gárgula de Pedra",
        hp: 40,
        atk: 14,
        class: 2,
        tipo: "monstro",
      };
      break;
    case "Rato do Subsolo":
      inimigoBase = {
        nome: "Rato do Subsolo",
        hp: 15,
        atk: 6,
        class: 2,
        tipo: "monstro",
      };
      break;
    case "Bandido Mineiro":
      inimigoBase = {
        nome: "Bandido Mineiro",
        hp: 35,
        atk: 11,
        class: 2,
        tipo: "monstro",
      };
      break;

    // === TIER 3: INIMIGOS AVANÇADOS ===
    case "Autômato Danificado":
      inimigoBase = {
        nome: "Autômato Danificado",
        hp: 45,
        atk: 12,
        class: 3,
        tipo: "monstro",
      };
      break;
    case "Répteis do Lodo":
      inimigoBase = {
        nome: "Répteis do Lodo",
        hp: 38,
        atk: 10,
        class: 3,
        tipo: "monstro",
      };
      break;
    case "Híbrido Putrefato":
      inimigoBase = {
        nome: "Híbrido Putrefato",
        hp: 42,
        atk: 13,
        class: 3,
        tipo: "monstro",
      };
      break;
    case "Mosca Gigante":
      inimigoBase = {
        nome: "Mosca Gigante",
        hp: 30,
        atk: 11,
        class: 3,
        tipo: "monstro",
      };
      break;
    case "Sentinela Obscura":
      inimigoBase = {
        nome: "Sentinela Obscura",
        hp: 55,
        atk: 18,
        class: 3,
        tipo: "monstro",
      };
      break;
    case "Acólito Maldito":
      inimigoBase = {
        nome: "Acólito Maldito",
        hp: 40,
        atk: 15,
        class: 3,
        tipo: "monstro",
      };
      break;
    case "Neófito Sombrio":
      inimigoBase = {
        nome: "Neófito Sombrio",
        hp: 48,
        atk: 16,
        class: 3,
        tipo: "monstro",
      };
      break;
    case "Faísca Viva":
      inimigoBase = {
        nome: "Faísca Viva",
        hp: 30,
        atk: 14,
        class: 3,
        tipo: "monstro",
      };
      break;
    case "Metalúnculo":
      inimigoBase = {
        nome: "Metalúnculo",
        hp: 50,
        atk: 15,
        class: 3,
        tipo: "monstro",
      };
      break;
    case "Operário Enlouquecido":
      inimigoBase = {
        nome: "Operário Enlouquecido",
        hp: 45,
        atk: 12,
        class: 3,
        tipo: "monstro",
      };
      break;
    case "Eco Errante":
      inimigoBase = {
        nome: "Eco Errante",
        hp: 40,
        atk: 17,
        class: 3,
        tipo: "monstro",
      };
      break;
    case "Guardião de Pedra":
      inimigoBase = {
        nome: "Guardião de Pedra",
        hp: 60,
        atk: 20,
        class: 3,
        tipo: "monstro",
      };
      break;
    case "Magus Errático":
      inimigoBase = {
        nome: "Magus Errático",
        hp: 50,
        atk: 19,
        class: 3,
        tipo: "monstro",
      };
      break;

    // --- MINI-CHEFE: ATRIBUTOS ELEVADOS ---
    case "Coveiro Errante":
      inimigoBase = {
        nome: "Coveiro Errante",
        hp: 80,
        atk: 15,
        class: 1,
        tipo: "miniboss",
      };
      break;
    case "Ceifador":
      inimigoBase = {
        nome: "Ceifador",
        hp: 100,
        atk: 18,
        class: 1,
        tipo: "miniboss",
      };
      break;
    case "Mago Negro":
      inimigoBase = {
        nome: "Mago Negro",
        hp: 90,
        atk: 17,
        class: 1,
        tipo: "miniboss",
      };
      break;
    case "Feiticeiro das Asas Negras":
      inimigoBase = {
        nome: "Feiticeiro das Asas Negras",
        hp: 85,
        atk: 16,
        class: 1,
        tipo: "miniboss",
      };
      break;
    case "Lobo Espectral":
      inimigoBase = {
        nome: "Lobo Espectral",
        hp: 110,
        atk: 20,
        class: 1,
        tipo: "miniboss",
      };
      break;
    case "Ent Enraizado":
      inimigoBase = {
        nome: "Ent Enraizado",
        hp: 130,
        atk: 18,
        class: 1,
        tipo: "miniboss",
      };
      break;
    case "Lorde Glacial":
      inimigoBase = {
        nome: "Lorde Glacial",
        hp: 150,
        atk: 25,
        class: 1,
        tipo: "miniboss",
      };
      break;
    case "Górgula de Gelo":
      inimigoBase = {
        nome: "Górgula de Gelo",
        hp: 120,
        atk: 22,
        class: 1,
        tipo: "miniboss",
      };
      break;
    case "Urso de Cristal":
      inimigoBase = {
        nome: "Urso de Cristal",
        hp: 160,
        atk: 24,
        class: 1,
        tipo: "miniboss",
      };
      break;
    case "Forjador Ardente":
      inimigoBase = {
        nome: "Forjador Ardente",
        hp: 140,
        atk: 28,
        class: 1,
        tipo: "miniboss",
      };
      break;
    case "Senhor das Brasas":
      inimigoBase = {
        nome: "Senhor das Brasas",
        hp: 170,
        atk: 26,
        class: 1,
        tipo: "miniboss",
      };
      break;
    case "Ancião de Magma":
      inimigoBase = {
        nome: "Ancião de Magma",
        hp: 155,
        atk: 27,
        class: 1,
        tipo: "miniboss",
      };
      break;
    case "Bibliotecário Louco":
      inimigoBase = {
        nome: "Bibliotecário Louco",
        hp: 100,
        atk: 19,
        class: 1,
        tipo: "miniboss",
      };
      break;
    case "Escriba Profano":
      inimigoBase = {
        nome: "Escriba Profano",
        hp: 115,
        atk: 21,
        class: 1,
        tipo: "miniboss",
      };
      break;
    case "Ancião Arcano":
      inimigoBase = {
        nome: "Ancião Arcano",
        hp: 125,
        atk: 23,
        class: 1,
        tipo: "miniboss",
      };
      break;
    case "Capataz Caído":
      inimigoBase = {
        nome: "Capataz Caído",
        hp: 95,
        atk: 18,
        class: 1,
        tipo: "miniboss",
      };
      break;
    case "Gárgula de Minério":
      inimigoBase = {
        nome: "Gárgula de Minério",
        hp: 110,
        atk: 20,
        class: 2,
        tipo: "miniboss",
      };
      break;
    case "Homem de Pedra das Minas":
      inimigoBase = {
        nome: "Homem de Pedra das Minas",
        hp: 140,
        atk: 21,
        class: 2,
        tipo: "miniboss",
      };
      break;
    case "Xamã Venenoso":
      inimigoBase = {
        nome: "Xamã Venenoso",
        hp: 105,
        atk: 22,
        class: 2,
        tipo: "miniboss",
      };
      break;
    case "Feiticeira do Brejo":
      inimigoBase = {
        nome: "Feiticeira do Brejo",
        hp: 95,
        atk: 24,
        class: 2,
        tipo: "miniboss",
      };
      break;
    case "Monstro da Lama":
      inimigoBase = {
        nome: "Monstro da Lama",
        hp: 150,
        atk: 20,
        class: 2,
        tipo: "miniboss",
      };
      break;
    case "Sacerdote Negro":
      inimigoBase = {
        nome: "Sacerdote Negro",
        hp: 180,
        atk: 28,
        class: 2,
        tipo: "miniboss",
      };
      break;
    case "Arauto das Trevas":
      inimigoBase = {
        nome: "Arauto das Trevas",
        hp: 190,
        atk: 30,
        class: 2,
        tipo: "miniboss",
      };
      break;
    case "Sentinela Eterna":
      inimigoBase = {
        nome: "Sentinela Eterna",
        hp: 200,
        atk: 32,
        class: 3,
        tipo: "miniboss",
      };
      break;
    case "Mestre Ferreiro":
      inimigoBase = {
        nome: "Mestre Ferreiro",
        hp: 170,
        atk: 27,
        class: 3,
        tipo: "miniboss",
      };
      break;
    case "Centurião Metálico":
      inimigoBase = {
        nome: "Centurião Metálico",
        hp: 200,
        atk: 30,
        class: 3,
        tipo: "miniboss",
      };
      break;
    case "Arcanista de Ferros":
      inimigoBase = {
        nome: "Arcanista de Ferros",
        hp: 180,
        atk: 29,
        class: 3,
        tipo: "miniboss",
      };
      break;
    case "Senhor do Eco":
      inimigoBase = {
        nome: "Senhor do Eco",
        hp: 220,
        atk: 35,
        class: 3,
        tipo: "miniboss",
      };
      break;
    case "Mestre das Runas":
      inimigoBase = {
        nome: "Mestre das Runas",
        hp: 210,
        atk: 33,
        class: 3,
        tipo: "miniboss",
      };
      break;
    case "Sentinela Temporal":
      inimigoBase = {
        nome: "Sentinela Temporal",
        hp: 250,
        atk: 36,
        class: 3,
        tipo: "miniboss",
      };
      break;

    // === CHEFE: ATRIBUTOS MÁXIMOS ===
    case "Kaelthos, Mestre das Catacumbas":
      inimigoBase = {
        nome: "Kaelthos, Mestre das Catacumbas",
        hp: 300,
        atk: 30,
        class: 1,
        tipo: "boss",
        poder: "Necromancia",
      };
      break;
    case "Verdanth, Guardião Primordial da Selva":
      inimigoBase = {
        nome: "Verdanth, Guardião Primordial da Selva",
        hp: 350,
        atk: 35,
        class: 1,
        tipo: "boss",
        poder: "Raízes Presas",
      };
      break;
    case "Aurlion, o Dragão Glacial":
      inimigoBase = {
        nome: "Aurlion, o Dragão Glacial",
        hp: 450,
        atk: 40,
        class: 2,
        tipo: "boss",
        poder: "Sopro Glaciar",
      };
      break;
    case "Ignarok, Senhor das Chamas Eternas":
      inimigoBase = {
        nome: "Ignarok, Senhor das Chamas Eternas",
        hp: 420,
        atk: 45,
        class: 1,
        tipo: "boss",
        poder: "Erupção Infernal",
      };
      break;
    case "Thal’Mor, Guardião dos Segredos Proibidos":
      inimigoBase = {
        nome: "Thal’Mor, Guardião dos Segredos Proibidos",
        hp: 380,
        atk: 42,
        class: 1,
        tipo: "boss",
        poder: "Feitiços Antigos",
      };
      break;
    case "Golem Minerador, Sentinela das Profundezas":
      inimigoBase = {
        nome: "Golem Minerador, Sentinela das Profundezas",
        hp: 500,
        atk: 50,
        class: 2,
        tipo: "boss",
        poder: "Impacto Sísmico",
      };
      break;
    case "Morghul, o Decompositor":
      inimigoBase = {
        nome: "Morghul, o Decompositor",
        hp: 400,
        atk: 40,
        class: 3,
        tipo: "boss",
        poder: "Praga da Corrupção",
      };
      break;
    case "Sombra Suprema, Guardiã das Trevas":
      inimigoBase = {
        nome: "Sombra Suprema, Guardiã das Trevas",
        hp: 480,
        atk: 55,
        class: 2,
        tipo: "boss",
        poder: "Lâmina Etérea",
      };
      break;
    case "Forjador Elemental, Senhor do Martelo":
      inimigoBase = {
        nome: "Forjador Elemental, Senhor do Martelo",
        hp: 550,
        atk: 60,
        class: 3,
        tipo: "boss",
        poder: "Martelo Incandescente",
      };
      break;
    case "Lorde do Tempo, Mestre das Areias":
      inimigoBase = {
        nome: "Lorde do Tempo, Mestre das Areias",
        hp: 600,
        atk: 65,
        class: 3,
        tipo: "boss",
        poder: "Ruptura Temporal",
      };
      break;
    default:
      console.error(`Inimigo '${nome}' não encontrado!`);
      return null;
  }

  // Multiplica os stats pela dificuldade da masmorra
  if (dificuldade > 1) {
    inimigoBase.hp = Math.floor(inimigoBase.hp * (1 + (dificuldade - 1) * 0.2));
    inimigoBase.atk = Math.floor(
      inimigoBase.atk * (1 + (dificuldade - 1) * 0.2)
    );
  }
  // Recompensas base para cada tipo e classe de monstro

  const recompensaBase = {
    monstro: {
      1: { xp: 15, ouro: 8 },
      2: { xp: 30, ouro: 15 },
      3: { xp: 50, ouro: 25 },
    },
    miniboss: {
      1: { xp: 100, ouro: 50 },
      2: { xp: 150, ouro: 80 },
      3: { xp: 250, ouro: 120 },
    },
    boss: {
      1: { xp: 400, ouro: 200 },
      2: { xp: 600, ouro: 300 },
      3: { xp: 1000, ouro: 500 },
    },
  };

  const multiplicadorDificuldade = 1 + (dificuldade - 1) * 0.2;

  // Aplica o escalonamento aos atributos de HP e ATK
  inimigoBase.hp = Math.floor(inimigoBase.hp * multiplicadorDificuldade);
  inimigoBase.atk = Math.floor(inimigoBase.atk * multiplicadorDificuldade);

  // Adiciona uma pequena variação de stats (sua lógica original)
  inimigoBase.hp = Math.max(1, inimigoBase.hp + rand(-5, 5));
  inimigoBase.atk = Math.max(1, inimigoBase.atk + rand(-2, 2));

  // Busca a recompensa base usando as propriedades do monstro
  const classe = Number(inimigoBase.class);
  const base = recompensaBase[inimigoBase.tipo][classe];

  // Aplica o multiplicador de dificuldade à XP e ao Ouro
  inimigoBase.xp = Math.floor(base.xp * multiplicadorDificuldade);
  inimigoBase.ouro = Math.floor(base.ouro * multiplicadorDificuldade);

  // Retorna o objeto completo com todos os dados
  return inimigoBase;
}
