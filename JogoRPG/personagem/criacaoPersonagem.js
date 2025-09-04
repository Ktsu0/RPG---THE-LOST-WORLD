// --- Criação de Personagem ---
import promptSync from "prompt-sync";
const prompt = promptSync({ sigint: true });

export function criarPersonagem() {
  console.log("🎭 Escolha sua RAÇA:");
  console.log("[1] Anão (+10 DEF, -5 ATK)");
  console.log("[2] Elfo (+20 HP, -2 ATK)");
  console.log("[3] Humano (Balanceado)");
  console.log("[4] Morto-vivo (+5 ATK, -10 HP)");
  console.log("[5] Orc (+8 ATK, -10 DEF)");
  console.log("[6] Drow (+10% Crítico, -10 HP)");
  console.log("[7] Dragãoide (+20 HP, +10 ATK, não pode usar armaduras)");

  let racaEscolha;
  do {
    racaEscolha = prompt("Escolha sua raça (1-7): ");
  } while (!["1", "2", "3", "4", "5", "6", "7"].includes(racaEscolha));

  let raca = "";
  let bonusRaca = { hp: 0, atk: 0, def: 0, critChance: 0 };
  let restricoes = {};

  switch (racaEscolha) {
    case "1": // Anão
      raca = "Anão";
      bonusRaca.def = 10;
      bonusRaca.atk = -5;
      break;
    case "2": // Elfo
      raca = "Elfo";
      bonusRaca.hp = 20;
      bonusRaca.atk = -2;
      break;
    case "3": // Humano
      raca = "Humano";
      break;
    case "4": // Morto-vivo
      raca = "Morto-vivo";
      bonusRaca.atk = 5;
      bonusRaca.hp = -10;
      break;
    case "5": // Orc
      raca = "Orc";
      bonusRaca.atk = 8;
      bonusRaca.def = -10;
      break;
    case "6": // Drow
      raca = "Drow";
      bonusRaca.critChance = 10;
      bonusRaca.hp = -10;
      break;
    case "7": // Dragãoide
      raca = "Dragãoide";
      bonusRaca.hp = 20;
      bonusRaca.atk = 10;
      restricoes.semArmadura = true;
      break;
  }

  console.log("\n⚔ Agora escolha sua CLASSE:");
  console.log("[1] Arqueiro (Esquiva + bônus drop de ouro)");
  console.log("[2] Paladino (Crítico + chance de bloquear ataques)");
  console.log("[3] Assassino (Sangramento + bônus drop de itens)");
  console.log("[4] Bárbaro (Fúria quando HP baixo)");
  console.log("[5] Necromante (Invocar esqueleto aliado)");
  console.log("[6] Suporte (Cura 10% HP por turno + bônus esquiva)");

  let classeEscolha;
  do {
    classeEscolha = prompt("Escolha sua classe (1-6): ");
  } while (!["1", "2", "3", "4", "5", "6"].includes(classeEscolha));

  let classe = "";
  let habilidadeClasse = "";
  let bonusClasse = {
    atk: 0,
    def: 0,
    dropOuro: 0,
    dropItem: 0,
    critChance: 0,
    esquiva: 0,
  };

  switch (classeEscolha) {
    case "1": // Arqueiro
      classe = "Arqueiro";
      habilidadeClasse = "esquiva";
      bonusClasse.dropOuro = 10;
      bonusClasse.esquiva = 10;
      break;
    case "2": // Paladino
      classe = "Paladino";
      habilidadeClasse = "bloqueio";
      bonusClasse.critChance = 20;
      break;
    case "3": // Assassino
      classe = "Assassino";
      habilidadeClasse = "sangramento";
      bonusClasse.dropItem = 10;
      break;
    case "4": // Bárbaro
      classe = "Bárbaro";
      habilidadeClasse = "furia";
      bonusClasse.atk = 8;
      break;
    case "5": // Necromante
      classe = "Necromante";
      habilidadeClasse = "invocacao";
      bonusClasse.atk = 5;
      break;
    case "6": // Suporte
      classe = "Suporte";
      habilidadeClasse = "cura";
      bonusClasse.esquiva = 15;
      break;
  }

  // Nome do personagem
  let nome;
  do {
    nome = prompt("Digite o nome do seu personagem: ").trim();
  } while (nome.length === 0);

  let jogador = {
    nome,
    raca,
    classe,
    habilidadeClasse,
    bonusClasse,
    hp: 90 + bonusRaca.hp,
    hpMax: 90 + bonusRaca.hp,
    nivel: 1,
    xp: 0,
    ouro: 0,
    ataque: 5 + bonusRaca.atk + bonusClasse.atk,
    defesa: 2 + bonusRaca.def + bonusClasse.def,
    criticoExtra: bonusRaca.critChance || 0,
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

  console.log(
    `\n✅ Personagem criado: ${jogador.nome} | ${jogador.raca} ${jogador.classe}`
  );
  console.log(
    `HP: ${jogador.hp} | ATK: ${jogador.ataque} | DEF: ${jogador.defesa}`
  );
  return jogador;
}
