import { escolherOpcao } from "../../codigosUniversais.js";
import { colors } from "./../../utilitarios.js";

// --- Dados das raças ---
const racasDisponiveis = [
  {
    nome: "Anão",
    desc: "+15 DEF, -3 ATK",
    bonus: { hp: 0, atk: -3, def: 15, critChance: 0 },
    restricoes: {},
  },
  {
    nome: "Elfo",
    desc: "+20 HP, -2 ATK",
    bonus: { hp: 20, atk: -2, def: 0, critChance: 0 },
    restricoes: {},
  },
  {
    nome: "Humano",
    desc: "Balanceado",
    bonus: { hp: 0, atk: 0, def: 0, critChance: 0 },
    restricoes: {},
  },
  {
    nome: "Morto-vivo",
    desc: "+5 ATK, -10 HP",
    bonus: { hp: -10, atk: 5, def: 0, critChance: 0 },
    restricoes: {},
  },
  {
    nome: "Orc",
    desc: "+8 ATK, -5 DEF",
    bonus: { hp: 0, atk: 8, def: -5, critChance: 0 },
    restricoes: {},
  },
  {
    nome: "Bestial",
    desc: "+10% Crítico, -7 HP",
    bonus: { hp: -7, atk: 0, def: 0, critChance: 10 },
    restricoes: {},
  },
  {
    nome: "Dragonoide",
    desc: "+15 HP, +5 ATK, não pode usar armaduras",
    bonus: { hp: 15, atk: 5, def: 0, critChance: 0 },
    restricoes: { semArmadura: true },
  },
];

// --- Exibe todas as raças com cores ---
function exibirRacas() {
  console.log(
    `${colors.bright}${colors.cyan}🎭 Escolha sua RAÇA:${colors.reset}`
  );
  racasDisponiveis.forEach((r, i) => {
    // Se for Humano, deixa em branco
    if (r.nome === "Humano") {
      console.log(
        `[${i + 1}] ${colors.magenta}${r.nome}${colors.reset} (${colors.white}${
          r.desc
        }${colors.reset})`
      );
    } else {
      // Destaca buffs em verde e nerfs em vermelho
      let descricaoColorida = r.desc
        .replace(/([+-]\d+ HP)/g, (m) =>
          m.startsWith("-")
            ? `${colors.red}${m}${colors.reset}`
            : `${colors.green}${m}${colors.reset}`
        )
        .replace(/([+-]\d+ ATK)/g, (m) =>
          m.startsWith("-")
            ? `${colors.red}${m}${colors.reset}`
            : `${colors.green}${m}${colors.reset}`
        )
        .replace(/([+-]\d+ DEF)/g, (m) =>
          m.startsWith("-")
            ? `${colors.red}${m}${colors.reset}`
            : `${colors.green}${m}${colors.reset}`
        )
        .replace(/([+-]\d+% Crítico)/g, `${colors.green}$1${colors.reset}`)
        .replace(
          /não pode usar armaduras/g,
          `${colors.red}não pode usar armaduras${colors.reset}`
        );

      console.log(
        `[${i + 1}] ${colors.magenta}${r.nome}${
          colors.reset
        } (${descricaoColorida})`
      );
    }
  });
}

// --- Função principal para escolher raça ---
export function escolherRaca() {
  exibirRacas();
  const escolha = escolherOpcao("Escolha sua raça (1-7): ", [
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
  ]);
  const racaSelecionada = racasDisponiveis[escolha - 1];
  return {
    raca: racaSelecionada.nome,
    bonusRaca: racaSelecionada.bonus,
    restricoes: racaSelecionada.restricoes,
  };
}
