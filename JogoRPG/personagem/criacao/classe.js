import { escolherOpcao } from "../../codigosUniversais.js";
import { colors } from "./../../utilitarios.js";

// --- Dados das classes ---
const classesDisponiveis = [
  { nome: "Arqueiro", desc: "Esquiva + bônus drop de ouro" },
  { nome: "Paladino", desc: "Crítico + chance de bloquear ataques" },
  { nome: "Assassino", desc: "Sangramento + bônus drop de itens" },
  { nome: "Bárbaro", desc: "Fúria quando HP baixo" },
  { nome: "Necromante", desc: "Invocar esqueleto aliado" },
  { nome: "Xamã", desc: "Chance de cura de 5% HP por turno + bônus esquiva" },
];

const classesBonus = {
  1: {
    habilidade: "esquiva",
    atk: 0,
    def: 0,
    dropOuro: 10,
    dropItem: 0,
    critChance: 0,
    esquiva: 10,
    bloqueioChance: 0,
  },
  2: {
    habilidade: "bloqueio",
    atk: 0,
    def: 0,
    dropOuro: 0,
    dropItem: 0,
    critChance: 10,
    esquiva: 0,
    bloqueioChance: 10,
  },
  3: {
    habilidade: "sangramento",
    atk: 0,
    def: 0,
    dropOuro: 0,
    dropItem: 10,
    critChance: 0,
    esquiva: 0,
    bloqueioChance: 0,
  },
  4: {
    habilidade: "furia",
    atk: 8,
    def: 0,
    dropOuro: 0,
    dropItem: 0,
    critChance: 0,
    esquiva: 0,
    bloqueioChance: 0,
  },
  5: {
    habilidade: "invocacao",
    atk: 5,
    def: 0,
    dropOuro: 0,
    dropItem: 0,
    critChance: 0,
    esquiva: 0,
    bloqueioChance: 0,
  },
  6: {
    habilidade: "cura",
    atk: 0,
    def: 0,
    dropOuro: 0,
    dropItem: 0,
    critChance: 0,
    esquiva: 15,
    bloqueioChance: 0,
  },
};

// --- Exibe todas as classes com cores ---
function exibirClasses() {
  console.log(
    `\n${colors.bright}${colors.cyan}⚔ Agora escolha sua CLASSE:${colors.reset}`
  );
  classesDisponiveis.forEach((c, i) => {
    console.log(
      `[${i + 1}] ${colors.magenta}${c.nome}${colors.reset} (${colors.green}${
        c.desc
      }${colors.reset})`
    );
  });
}
// --- Função principal para escolher classe ---
export function escolherClasse() {
  exibirClasses();
  const escolha = escolherOpcao("Escolha sua classe (1-6): ", [
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
  ]);
  const bonus = classesBonus[escolha];
  const nomeClasse = classesDisponiveis[escolha - 1].nome;
  return {
    classe: nomeClasse,
    habilidadeClasse: bonus.habilidade,
    bonusClasse: bonus,
  };
}
