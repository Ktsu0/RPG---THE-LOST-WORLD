import { colors } from "../../utilitarios.js";
import { escolherClasse } from "./classe.js";
import { escolherRaca } from "./raca.js";

import promptSync from "prompt-sync";
const prompt = promptSync({ sigint: true });

export function criarPersonagem() {
  const { raca, bonusRaca, restricoes } = escolherRaca();
  const { classe, habilidadeClasse, bonusClasse } = escolherClasse();
  const bonusRacaSeguro = bonusRaca || { critChance: 0, atk: 0, def: 0, hp: 0 };
  let nome;
  do {
    nome = prompt(
      `${colors.bright}${colors.white}Digite o nome do seu personagem: ${colors.reset}`
    ).trim();
  } while (!nome);
  process.stdout.write("\x1Bc");

  let jogador = {
    nome,
    raca,
    classe,
    habilidadeClasse,
    bonusClasse,
    hp: 100000 + bonusRaca.hp,
    hpMax: 100000 + bonusRaca.hp,
    nivel: 10,
    xp: 0,
    ouro: 10000000000,
    ataque: 1 + bonusRaca.atk + bonusClasse.atk,
    defesa: 5 + bonusRaca.def + bonusClasse.def,
    bonusRaca: bonusRacaSeguro,
    restricoes,
    equipamentos: {
      head: null,
      chest: null,
      hands: null,
      legs: null,
      feet: null,
    },
    itens: [],
    inventario: [],
    armas: [],
    armaEquipada: null,
    amuletoEquipado: false,
  };

  return jogador;
}
