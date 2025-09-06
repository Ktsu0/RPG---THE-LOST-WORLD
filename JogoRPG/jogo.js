import { criarPersonagem } from "./personagem/criacaoPersonagem.js";
import {
    status,
    checarLevelUp,
    danoDoJogador,
    calcularDefesaTotal,
    equiparItem,
} from "./personagem/status.js";
import { menuAmuleto } from "./itens/amuleto.js";
import promptSync from "prompt-sync";

const prompt = promptSync({ sigint: true });

// --- Utilitários ---
export function rand(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// --- Inicialização ---
global.jogador = criarPersonagem();
// --- Equipamentos / Armaduras ---
export const ARMOR_SLOTS = ["head", "chest", "hands", "legs", "feet"];

// Inicializa equipamentos caso ainda não exista
jogador.equipamentos = jogador.equipamentos || {
    head: null,
    chest: null,
    hands: null,
    legs: null,
    feet: null,
};

export function aplicarBonusDeConjunto() {
    // Reseta bônus antes de aplicar
    jogador.bonusEsquiva = 0;
    jogador.bonusCritico = 0;
    jogador.bonusBloqueio = 0;
    jogador.bonusHP = 0;
    jogador.bonusAtk = 0;

    const setsEquipados = {};
    for (const slot in jogador.equipamentos) {
        const item = jogador.equipamentos[slot];
        if (item && item.set) {
            setsEquipados[item.set] = (setsEquipados[item.set] || 0) + 1;
        }
    }

    for (const set in setsEquipados) {
        if (setsEquipados[set] === 5) {
            // Full set
            switch (set) {
                case "Ferro":
                    console.log(
                        "✅ Bônus de conjunto Ferro: +10% chance de bloquear ataque!"
                    );
                    jogador.bonusBloqueio += 10;
                    break;

                case "Ligeiro":
                    console.log("✅ Bônus de conjunto Ligeiro: +15% esquiva!");
                    jogador.bonusEsquiva += 15;
                    break;

                case "Sombra":
                    console.log(
                        "✅ Bônus de conjunto Sombra: +10% crítico e +10% esquiva!"
                    );
                    jogador.bonusEsquiva += 10;
                    jogador.bonusCritico += 10;
                    break;

                case "Dragão":
                    console.log("✅ Bônus de conjunto Dragão: +20% HP e +20% ATK!");
                    jogador.bonusHP += 0.2;
                    jogador.bonusAtk += 0.2;
                    break;
            }
        }
    }

    // ✅ Aplica bônus dinâmicos sem sobrescrever base
    jogador.hpMaxFinal = Math.floor(jogador.hpMax * (1 + jogador.bonusHP));
    jogador.ataqueFinal = Math.floor(jogador.ataque * (1 + jogador.bonusAtk));
}

const loja = [
    // --- Conjunto Ferro (Defesa Pura) ---
    {
        id: 1,
        nome: "Elmo de Ferro",
        slot: "head",
        defesa: 6,
        atkBonus: 0,
        preco: 1050,
        set: "Ferro",
        raridade: "comum",
    },
    {
        id: 2,
        nome: "Peitoral de Ferro",
        slot: "chest",
        defesa: 12,
        atkBonus: 0,
        preco: 1500,
        set: "Ferro",
        raridade: "comum",
    },
    {
        id: 3,
        nome: "Manoplas de Ferro",
        slot: "hands",
        defesa: 5,
        atkBonus: 1,
        preco: 890,
        set: "Ferro",
        raridade: "comum",
    },
    {
        id: 4,
        nome: "Grevas de Ferro",
        slot: "legs",
        defesa: 7,
        atkBonus: 0,
        preco: 1050,
        set: "Ferro",
        raridade: "comum",
    },
    {
        id: 5,
        nome: "Botas de Ferro",
        slot: "feet",
        defesa: 4,
        atkBonus: 0,
        preco: 650,
        set: "Ferro",
        raridade: "comum",
    },

    // --- Conjunto Ligeiro (Velocidade e Crítico) ---
    {
        id: 6,
        nome: "Capuz de Velo",
        slot: "head",
        defesa: 3,
        atkBonus: 1,
        preco: 670,
        set: "Ligeiro",
        raridade: "comum",
    },
    {
        id: 7,
        nome: "Túnica Ligeira",
        slot: "chest",
        defesa: 6,
        atkBonus: 2,
        preco: 890,
        set: "Ligeiro",
        raridade: "raro",
    },
    {
        id: 8,
        nome: "Luvas Leves",
        slot: "hands",
        defesa: 2,
        atkBonus: 2,
        preco: 550,
        set: "Ligeiro",
        raridade: "comum",
    },
    {
        id: 9,
        nome: "Calças Ligeiras",
        slot: "legs",
        defesa: 4,
        atkBonus: 1,
        preco: 710,
        set: "Ligeiro",
        raridade: "comum",
    },
    {
        id: 10,
        nome: "Botas Ágeis",
        slot: "feet",
        defesa: 3,
        atkBonus: 1,
        preco: 610,
        set: "Ligeiro",
        raridade: "comum",
    },

    // --- Conjunto Sombra (Crítico e Evasão) ---
    {
        id: 11,
        nome: "Máscara das Sombras",
        slot: "head",
        defesa: 4,
        atkBonus: 2,
        preco: 1300,
        set: "Sombra",
        raridade: "raro",
    },
    {
        id: 12,
        nome: "Peitoral das Sombras",
        slot: "chest",
        defesa: 8,
        atkBonus: 3,
        preco: 1800,
        set: "Sombra",
        raridade: "raro",
    },
    {
        id: 13,
        nome: "Luvas das Sombras",
        slot: "hands",
        defesa: 3,
        atkBonus: 2,
        preco: 950,
        set: "Sombra",
        raridade: "raro",
    },
    {
        id: 14,
        nome: "Calças das Sombras",
        slot: "legs",
        defesa: 5,
        atkBonus: 2,
        preco: 1200,
        set: "Sombra",
        raridade: "raro",
    },
    {
        id: 15,
        nome: "Botas das Sombras",
        slot: "feet",
        defesa: 4,
        atkBonus: 2,
        preco: 980,
        set: "Sombra",
        raridade: "raro",
    },

    // --- Conjunto Dragão (Poder Extremo) ---
    {
        id: 16,
        nome: "Elmo do Dragão",
        slot: "head",
        defesa: 12,
        atkBonus: 5,
        preco: 15500,
        set: "Dragão",
        raridade: "lendário",
    },
    {
        id: 17,
        nome: "Peitoral do Dragão",
        slot: "chest",
        defesa: 20,
        atkBonus: 7,
        preco: 17000,
        set: "Dragão",
        raridade: "lendário",
    },
    {
        id: 18,
        nome: "Manoplas do Dragão",
        slot: "hands",
        defesa: 8,
        atkBonus: 4,
        preco: 10200,
        set: "Dragão",
        raridade: "lendário",
    },
    {
        id: 19,
        nome: "Grevas do Dragão",
        slot: "legs",
        defesa: 12,
        atkBonus: 4,
        preco: 12800,
        set: "Dragão",
        raridade: "lendário",
    },
    {
        id: 20,
        nome: "Botas do Dragão",
        slot: "feet",
        defesa: 10,
        atkBonus: 3,
        preco: 10100,
        set: "Dragão",
        raridade: "lendário",
    },

    // Consumíveis
    {
        id: 21,
        nome: "Poção de Cura",
        slot: "consumable",
        defesa: 0,
        atkBonus: 0,
        preco: 100,
        set: null,
        raridade: "comum",
    },
];

// === Armas Disponíveis ===
const armasDisponiveis = [
    { nome: "Espada Longa", preco: 500, atk: 5, efeito: null, raridade: "comum" },
    {
        nome: "Arco Elfico",
        preco: 620,
        atk: 4,
        efeito: "esquiva",
        raridade: "raro",
    },
    {
        nome: "Adaga Sombria",
        preco: 790,
        atk: 6,
        efeito: "sangramento",
        raridade: "raro",
    },
    {
        nome: "Martelo de Guerra",
        preco: 910,
        atk: 8,
        efeito: "bloqueio",
        raridade: "raro",
    },
    {
        nome: "Lança Sagrada",
        preco: 1050,
        atk: 10,
        efeito: "critico",
        raridade: "lendario",
    },
];

function abrirLoja() {
    let sairLoja = false;

    while (!sairLoja) {
        console.log("\n🏪 Bem-vindo à Loja!");
        console.log(`Você tem ${jogador.ouro} de ouro`);
        console.log("O que deseja comprar?");
        console.log("[1] Armaduras");
        console.log("[2] Armas");
        console.log("[0] Sair");

        const escolha = prompt("Escolha: ");

        if (escolha === "1") {
            // --- Armaduras ---
            let voltarConjuntos = false;
            while (!voltarConjuntos) {
                const conjuntos = [
                    ...new Set(
                        loja.filter((i) => i.slot !== "consumable").map((i) => i.set)
                    ),
                ];

                console.log(`Você tem ${jogador.ouro} de ouro`);
                console.log("\nConjuntos disponíveis:");
                conjuntos.forEach((set, i) => console.log(`[${i + 1}] ${set}`));
                console.log("[0] Voltar");

                const setEscolhaRaw = prompt(
                    "Escolha o conjunto pelo número ou digite o nome: "
                );
                const setEscolhaNum = parseInt(setEscolhaRaw);
                let setNome;

                if (!isNaN(setEscolhaNum) &&
                    setEscolhaNum > 0 &&
                    setEscolhaNum <= conjuntos.length
                ) {
                    setNome = conjuntos[setEscolhaNum - 1];
                } else if (setEscolhaRaw === "0") {
                    voltarConjuntos = true; // volta para o menu principal
                    continue;
                } else {
                    setNome = setEscolhaRaw;
                }

                const pecas = loja.filter(
                    (i) => i.set === setNome && i.slot !== "consumable"
                );
                if (pecas.length === 0) {
                    console.log("Conjunto inválido!");
                    continue;
                }

                // --- Menu das peças ---
                let voltarPecas = false;
                while (!voltarPecas) {
                    console.log(`Você tem ${jogador.ouro} de ouro`);
                    console.log(`\nPeças disponíveis do conjunto ${setNome}:`);
                    pecas.forEach((p, i) => {
                        console.log(
                            `[${i + 1}] ${p.slot.toUpperCase()}: ${p.nome} (+${
                p.defesa
              } DEF, +${p.atkBonus} ATK) - ${p.preco} ouro`
                        );
                    });
                    console.log("[0] Voltar");

                    const pecaEscolhaRaw = prompt("Escolha a peça pelo número: ");
                    const pecaEscolha = parseInt(pecaEscolhaRaw);

                    if (pecaEscolha === 0) {
                        voltarPecas = true; // volta para menu de conjuntos
                        continue;
                    }

                    const itemEscolhido = pecas[pecaEscolha - 1];
                    if (!itemEscolhido) {
                        console.log("Peça inválida!");
                        continue;
                    }

                    if (jogador.ouro >= itemEscolhido.preco) {
                        jogador.ouro -= itemEscolhido.preco;
                        jogador.equipamentos[itemEscolhido.slot] = itemEscolhido;
                        console.log(`✅ Você comprou e equipou: ${itemEscolhido.nome}`);
                    } else {
                        console.log("Ouro insuficiente!");
                    }
                } // fim do menu peças
            } // fim do menu conjuntos
        } else if (escolha === "2") {
            // --- Armas ---
            let voltarArmas = false;
            while (!voltarArmas) {
                console.log(`\nVocê tem ${jogador.ouro} de ouro`);
                console.log("⚔ Armas disponíveis:");
                armasDisponiveis.forEach((arma, i) => {
                            console.log(
                                    `[${i + 1}] ${arma.nome} (+${arma.atk} ATK) ${
              arma.efeito ? `(Efeito: ${arma.efeito})` : ""
            } - ${arma.preco} ouro`
          );
        });
        console.log("[0] Voltar");

        const armaEscolhaRaw = prompt("Escolha a arma pelo número: ");
        const armaEscolha = parseInt(armaEscolhaRaw);

        if (armaEscolha === 0) {
          voltarArmas = true; // volta para o menu principal
          continue;
        }

        const arma = armasDisponiveis[armaEscolha - 1];
        if (!arma) {
          console.log("Escolha inválida!");
          continue;
        }

        if (jogador.ouro >= arma.preco) {
          jogador.ouro -= arma.preco;
          jogador.armas.push(arma);
          jogador.armaEquipada = arma;
          console.log(
            `✅ Você comprou e equipou: ${arma.nome} (+${arma.atk} ATK)`
          );
        } else {
          console.log("Ouro insuficiente!");
        }
      } // fim menu armas
    } else if (escolha === "0") {
      sairLoja = true;
      console.log("Saindo da loja.");
    } else {
      console.log("Escolha inválida!");
    }
  } // fim loop principal da loja
}

// --- Inimigos / Missões ---
// (mantive apenas a versão completa de criarInimigo)
function criarInimigo() {
  const templates = [
    { nome: "Goblin", baseHp: 18, baseAtk: 4, escalaHp: 3.5, escalaAtk: 0.7 },
    {
      nome: "Lobo das Sombras",
      baseHp: 25,
      baseAtk: 6,
      escalaHp: 4.5,
      escalaAtk: 0.9,
    },
    { nome: "Bandido", baseHp: 30, baseAtk: 7, escalaHp: 5.2, escalaAtk: 1.0 },
    {
      nome: "Arauto do Pântano",
      baseHp: 28,
      baseAtk: 8,
      escalaHp: 5.5,
      escalaAtk: 1.1,
    },
    {
      nome: "Espectro Errante",
      baseHp: 34,
      baseAtk: 9,
      escalaHp: 6.0,
      escalaAtk: 1.2,
    },
    {
      nome: "Mercenário Caído",
      baseHp: 40,
      baseAtk: 11,
      escalaHp: 7.0,
      escalaAtk: 1.4,
    },
  ];

  const t = templates[rand(0, templates.length - 1)];
  const hp = Math.max(
    8,
    Math.round(t.baseHp + Math.floor(jogador.nivel * t.escalaHp) + rand(-5, 5))
  );
  const atk = Math.max(
    1,
    Math.round(t.baseAtk + Math.floor(jogador.nivel * t.escalaAtk) + rand(0, 1))
  );
  const xp = Math.max(8, Math.round(hp / 4));
  const ouro = Math.max(3, Math.round(hp / 3));

  return { nome: t.nome, hp, atk, xp, ouro };
}

// Mini-boss (mais forte) — stats escalam com nível
function criarMiniBoss() {
  const minibosses = [
    { nome: "Capitão Sombrio", baseHp: 120, baseAtk: 14 },
    { nome: "Guardião de Ruínas", baseHp: 140, baseAtk: 16 },
    { nome: "Feiticeiro Caído", baseHp: 110, baseAtk: 18 },
  ];

  const m = minibosses[rand(0, minibosses.length - 1)];
  const hp = m.baseHp + Math.floor(jogador.nivel * 8) + rand(-10, 10);
  const atk = m.baseAtk + Math.floor(jogador.nivel * 1.2) + rand(0, 3);
  const xp = Math.max(15, Math.round(hp / 2.2)); // recompensas maiores
  const ouro = Math.max(10, Math.round(hp / 1.8));

  return { nome: m.nome, hp, atk, xp, ouro };
}

// Estado global temporário (dentro da batalha)
let esqueleto = null;
let turnosDesdeUltimoEsqueleto = 0;

// No início de cada turno:
turnosDesdeUltimoEsqueleto++;

// Criar esqueleto a cada 4 turnos
if (
  jogador.habilidadeClasse === "necromante" &&
  turnosDesdeUltimoEsqueleto >= 4
) {
  esqueleto = {
    hp: 15,
    dano: 3 + (jogador.nivel - 1),
  };
  turnosDesdeUltimoEsqueleto = 0;
  console.log("☠️ Um esqueleto aliado foi invocado!");
}

// Antes de aplicar dano do inimigo:
if (esqueleto && esqueleto.hp > 0) {
  let danoAbsorvido = Math.min(danoInimigo, esqueleto.hp);
  esqueleto.hp -= danoAbsorvido;
  danoInimigo -= danoAbsorvido;
  console.log(`🛡 O esqueleto absorveu ${danoAbsorvido} de dano!`);
  if (esqueleto.hp <= 0) console.log("💀 O esqueleto aliado caiu!");
}

// Esqueleto ataca após o jogador
if (esqueleto && esqueleto.hp > 0) {
  console.log(`☠️ O esqueleto causa ${esqueleto.dano} de dano ao inimigo!`);
  inimigo.hp -= esqueleto.dano;
  inimigo.hp = Math.max(0, inimigo.hp);
}

// --- Missões ---
const missoes = [
  {
    descricao: "Escoltar um mercador até a cidade",
    chanceSucesso: 80,
    xp: 15,
    ouro: 10,
  },
  {
    descricao: "Encontrar um amuleto escondido na floresta",
    chanceSucesso: 65,
    xp: 25,
    ouro: 20,
    item: "Insígnia do Viajante",
  },
  {
    descricao: "Ajudar o ferreiro local com materiais",
    chanceSucesso: 90,
    xp: 10,
    ouro: 8,
  },
  {
    descricao: "Investigar ruínas antigas (perigoso)",
    chanceSucesso: 50,
    xp: 35,
    ouro: 30,
    item: "Fragmento Antigo",
  },

  // Novas missões com itens para Amuleto Supremo
  {
    descricao: "Resgatar um aldeão perdido na floresta sombria",
    chanceSucesso: 85,
    xp: 18,
    ouro: 12,
    item: { nome: "Pena do Corvo Sombrio", raridade: "comum" },
  },
  {
    descricao: "Recuperar uma espada amaldiçoada em cavernas",
    chanceSucesso: 60,
    xp: 40,
    ouro: 35,
    item: { nome: "Gema da Escuridão", raridade: "lendario" },
  },
  {
    descricao: "Proteger uma caravana de monstros à noite",
    chanceSucesso: 70,
    xp: 30,
    ouro: 25,
    item: { nome: "Essência da Noite", raridade: "raro" },
  },
  {
    descricao: "Domar uma criatura mística",
    chanceSucesso: 55,
    xp: 50,
    ouro: 40,
    item: { nome: "Escama de Dragão Azul", raridade: "lendario" },
  },
  {
    descricao: "Roubar relíquias de um templo antigo",
    chanceSucesso: 50,
    xp: 45,
    ouro: 38,
    item: { nome: "Relíquia Brilhante", raridade: "raro" },
  },
  {
    descricao: "Salvar um sábio em ruínas místicas",
    chanceSucesso: 65,
    xp: 28,
    ouro: 18,
    item: { nome: "Pergaminho Arcano", raridade: "comum" },
  },
  {
    descricao: "Recuperar um livro proibido na biblioteca sombria",
    chanceSucesso: 55,
    xp: 42,
    ouro: 32,
    item: { nome: "Página Amaldiçoada", raridade: "raro" },
  },
  {
    descricao: "Explorar o vulcão em erupção",
    chanceSucesso: 45,
    xp: 55,
    ouro: 50,
    item: { nome: "Coração de Magma", raridade: "lendario" },
  },
  {
    descricao: "Eliminar uma seita secreta",
    chanceSucesso: 60,
    xp: 38,
    ouro: 28,
    item: { nome: "Máscara Sombria", raridade: "raro" },
  },
  {
    descricao: "Ajudar a curandeira a coletar ervas raras",
    chanceSucesso: 85,
    xp: 20,
    ouro: 15,
    item: { nome: "Flor da Aurora", raridade: "comum" },
  },
];
function aplicarFuria(jogador, danoBase) {
  const hpPercent = (jogador.hp / jogador.hpMax) * 100;
  if (jogador.habilidadeClasse === "furia" && hpPercent <= 30) {
    console.log("🔥 Fúria do Bárbaro ativada! Dano aumentado em 50%!");
    return danoBase * 1.5; // aumenta dano em 50%
  }
  return danoBase;
}

function batalha(inimigo) {
  console.log(
    `\n🔥 Você encontrou um ${inimigo.nome}! (HP: ${inimigo.hp}, ATK: ${inimigo.atk})`
  );

  // Inicializa status e necromante
  if (!inimigo.status) inimigo.status = [];
  let esqueleto = null;
  let turnosDesdeUltimoEsqueleto = 0;

  // Função interna para encerrar batalha quando o inimigo morrer
  function finalizarVitoria() {
    console.log(
      `\n✅ Você derrotou o ${inimigo.nome}! Ganhou ${inimigo.xp} XP.`
    );

    // Ganha XP
    jogador.xp += inimigo.xp;

    // Calcula ouro com bônus da classe
    let ouroDrop = inimigo.ouro;
    if (jogador.bonusClasse.dropOuro) {
      ouroDrop = Math.floor(
        ouroDrop + (ouroDrop * jogador.bonusClasse.dropOuro) / 100
      );
    }
    jogador.ouro += ouroDrop;
    console.log(`Você ganhou ${ouroDrop} de ouro.`);

    // Chance de drops (com bônus da classe)
    const chancePocao = 15 + (jogador.bonusClasse.dropItem || 0);
    const chanceArmadura = 10 + (jogador.bonusClasse.dropItem || 0);

    if (rand(1, 100) <= chancePocao) {
      jogador.itens.push("Poção de Cura");
      console.log("🎁 Você encontrou uma Poção de Cura!");
    }

    if (rand(1, 100) <= chanceArmadura) {
      const armors = loja.filter((i) => i.slot !== "consumable");
      if (armors.length > 0) {
        const drop = armors[rand(0, armors.length - 1)];
        equiparItem(drop);
        console.log(
          `🎁 O inimigo dropou e você equipou: ${drop.nome} (Set: ${drop.set})`
        );
      }
    }

    checarLevelUp();
  }

  while (inimigo.hp > 0 && jogador.hp > 0) {
    console.log(
      `\nSeu HP: ${jogador.hp}/${jogador.hpMax} | ${inimigo.nome} HP: ${inimigo.hp}`
    );

    // Cura do Suporte no início do turno
    if (jogador.habilidadeClasse === "suporte") {
      const cura = Math.floor(jogador.hpMax * 0.1);
      jogador.hp = Math.min(jogador.hp + cura, jogador.hpMax);
      console.log(`💚 Suporte cura ${cura} HP!`);
    }

    console.log("[1] Atacar  [2] Usar Poção  [3] Fugir");
    const escolha = prompt("Escolha: ");

    if (escolha === "1") {
      let dmg = danoDoJogador();

      // Fúria do Bárbaro
      const hpPercent = (jogador.hp / jogador.hpMax) * 100;
      if (jogador.habilidadeClasse === "furia" && hpPercent <= 30) {
        console.log("🔥 Fúria ativada! Dano aumentado em 50%!");
        dmg *= 1.5;
      }

      // Crítico
      const critTotal =
        (jogador.bonusClasse.critChance || 0) +
        ((jogador.bonusRaca && jogador.bonusRaca.critChance) || 0) +
        (jogador.bonusCritico || 0);

      if (critTotal > 0 && rand(1, 100) <= critTotal) {
        console.log("💥 Golpe crítico! Dano dobrado!");
        dmg *= 2;
      }

      // Efeitos da arma
      if (jogador.armaEquipada && jogador.armaEquipada.efeito) {
        switch (jogador.armaEquipada.efeito) {
          case "sangramento":
            if (rand(1, 100) <= 30) {
              const duracao = rand(3, 6);
              console.log(
                `🩸 A arma causou sangramento! O inimigo perderá 5 HP por ${duracao} turnos.`
              );
              inimigo.status.push({ tipo: "sangramento", duracao, dano: 5 });
            }
            break;
          case "critico":
            if (rand(1, 100) <= 15) {
              console.log("💥 Golpe crítico da arma! Dano dobrado!");
              dmg *= 2;
            }
            break;
        }
      }

      // Aplica dano principal
      inimigo.hp -= dmg;
      inimigo.hp = Math.max(0, inimigo.hp);
      console.log(`Você causou ${dmg} de dano ao ${inimigo.nome}.`);

      // Sangramento da classe Assassino
      if (jogador.habilidadeClasse === "sangramento" && rand(1, 100) <= 20) {
        const duracao = rand(3, 6);
        console.log(`🩸 O inimigo começou a sangrar por ${duracao} turnos!`);
        inimigo.status.push({ tipo: "sangramento", duracao, dano: 5 });
      }

      // Necromante invoca esqueleto a cada 4 turnos
      if (jogador.habilidadeClasse === "necromante") {
        turnosDesdeUltimoEsqueleto++;
        if (turnosDesdeUltimoEsqueleto >= 4) {
          esqueleto = { hp: 15, dano: 3 + (jogador.nivel - 1) };
          turnosDesdeUltimoEsqueleto = 0;
          console.log("☠️ Um esqueleto aliado foi invocado!");
        }
      }

      // Checa morte do inimigo
      if (inimigo.hp === 0) {
        finalizarVitoria();
        return true;
      }
    } else if (escolha === "2") {
      usarPocao();
    } else if (escolha === "3") {
      if (rand(1, 100) <= 60) {
        console.log("🏃 Você conseguiu fugir!");
        return false;
      } else {
        console.log("❌ Falha na fuga!");
      }
    } else {
      console.log("Opção inválida.");
    }

    // ✅ Aplica status do inimigo (sangramento)
    inimigo.status.forEach((efeito, index) => {
      if (efeito.tipo === "sangramento") {
        console.log(
          `🩸 O inimigo sofre ${efeito.dano} de dano por sangramento!`
        );
        inimigo.hp -= efeito.dano;
        efeito.duracao--;
        if (efeito.duracao <= 0) {
          console.log("✅ O sangramento no inimigo parou.");
          inimigo.status.splice(index, 1);
        }
      }
    });

    // Turno do inimigo
    if (inimigo.hp > 0) {
      const defesaTotal = calcularDefesaTotal();
      let danoInimigo = Math.max(
        1,
        inimigo.atk + rand(0, 3) - Math.floor(defesaTotal / 5)
      );

      // Chance de esquiva (classe + suporte)
      const esquivaTotal =
        (jogador.bonusClasse.esquiva || 0) +
        (jogador.habilidadeClasse === "suporte" ? 10 : 0) +
        (jogador.bonusEsquiva || 0);
      if (rand(1, 100) <= esquivaTotal) {
        console.log("💨 Você esquivou do ataque inimigo!");
        danoInimigo = 0;
      }

      // Chance de bloqueio
      let chanceBloqueio = 0;
      if (jogador.habilidadeClasse === "bloqueio") {
        chanceBloqueio += 10;
      }
      if (jogador.bonusBloqueio) {
        chanceBloqueio += jogador.bonusBloqueio;
      }
      if (rand(1, 100) <= chanceBloqueio) {
        console.log("🛡 Você bloqueou o ataque inimigo!");
        danoInimigo = 0;
      }

      // Esqueleto absorve dano do jogador se ativo
      if (esqueleto && esqueleto.hp > 0 && danoInimigo > 0) {
        const danoAbsorvido = Math.min(danoInimigo, esqueleto.hp);
        esqueleto.hp -= danoAbsorvido;
        danoInimigo -= danoAbsorvido;
        console.log(`🛡 O esqueleto absorveu ${danoAbsorvido} de dano!`);
        if (esqueleto.hp <= 0) console.log("💀 O esqueleto aliado caiu!");
      }

      jogador.hp -= danoInimigo;
      jogador.hp = Math.max(0, jogador.hp);

      if (danoInimigo > 0) {
        console.log(
          `${inimigo.nome} atacou e causou ${danoInimigo} de dano. (Defesa: ${defesaTotal})`
        );
      }

      // Esqueleto ataca o inimigo
      if (esqueleto && esqueleto.hp > 0 && inimigo.hp > 0) {
        console.log(
          `☠️ O esqueleto causa ${esqueleto.dano} de dano ao inimigo!`
        );
        inimigo.hp -= esqueleto.dano;
        inimigo.hp = Math.max(0, inimigo.hp);
      }
    }
  }

  if (jogador.hp === 0) {
    console.log("\n💀 Você foi derrotado... Fim de jogo.");
    return false;
  }

  return true;
}

const torreBosses = [
  {
    nome: "Guardião de Pedra",
    hp: 80,
    ataque: 12,
    defesa: 6,
    xp: 50,
    ouro: 30,
  },
  {
    nome: "Sentinela de Ferro",
    hp: 100,
    ataque: 14,
    defesa: 8,
    xp: 70,
    ouro: 40,
  },
  { nome: "Mago Sombrio", hp: 120, ataque: 16, defesa: 10, xp: 90, ouro: 50 },
  { nome: "Lobo Alfa", hp: 140, ataque: 18, defesa: 12, xp: 110, ouro: 60 },
  {
    nome: "Cavaleiro Sombrio",
    hp: 160,
    ataque: 20,
    defesa: 14,
    xp: 130,
    ouro: 70,
  },
  {
    nome: "Hidra das Sombras",
    hp: 180,
    ataque: 22,
    defesa: 16,
    xp: 150,
    ouro: 80,
  },
  {
    nome: "Golem Titânico",
    hp: 200,
    ataque: 24,
    defesa: 18,
    xp: 170,
    ouro: 90,
  },
  {
    nome: "Senhor dos Mortos",
    hp: 220,
    ataque: 26,
    defesa: 20,
    xp: 190,
    ouro: 100,
  },
  { nome: "Dragão Negro", hp: 250, ataque: 30, defesa: 22, xp: 220, ouro: 120 },
  {
    nome: "Lorde do Caos",
    hp: 300,
    ataque: 35,
    defesa: 25,
    xp: 300,
    ouro: 200,
  },
];

// === Função para criar bosses da torre com escala por nível ===
function criarBossTorre(i) {
  const t = torreBosses[i];
  const hp = t.hp + Math.floor(jogador.nivel * 5) + rand(-10, 10);
  const atk = t.ataque + Math.floor(jogador.nivel * 1.5) + rand(0, 3);
  const xp = Math.floor(hp / 2);
  const ouro = Math.floor(hp / 3);
  return { nome: t.nome, hp, atk, xp, ouro };
}

// === Torre do Destino ===
function entrarNaTorre() {
  console.log(
    "\n🏰 Você entrou na Torre do Destino! Enfrente 10 bosses para salvar a princesa!"
  );
  const torreBosses = [
    {
      nome: "Guardião de Pedra",
      hp: 80,
      ataque: 12,
      defesa: 6,
      xp: 50,
      ouro: 30,
    },
    {
      nome: "Sentinela de Ferro",
      hp: 100,
      ataque: 14,
      defesa: 8,
      xp: 70,
      ouro: 40,
    },
    { nome: "Mago Sombrio", hp: 120, ataque: 16, defesa: 10, xp: 90, ouro: 50 },
    { nome: "Lobo Alfa", hp: 140, ataque: 18, defesa: 12, xp: 110, ouro: 60 },
    {
      nome: "Cavaleiro Amaldiçoado",
      hp: 160,
      ataque: 20,
      defesa: 14,
      xp: 130,
      ouro: 70,
    },
    {
      nome: "Hidra das Sombras",
      hp: 180,
      ataque: 22,
      defesa: 16,
      xp: 150,
      ouro: 80,
    },
    {
      nome: "Golem Titânico",
      hp: 200,
      ataque: 24,
      defesa: 18,
      xp: 170,
      ouro: 90,
    },
    {
      nome: "Senhor dos Mortos",
      hp: 220,
      ataque: 26,
      defesa: 20,
      xp: 190,
      ouro: 100,
    },
    {
      nome: "Dragão Negro",
      hp: 250,
      ataque: 30,
      defesa: 22,
      xp: 220,
      ouro: 120,
    },
    {
      nome: "Lorde do Caos",
      hp: 300,
      ataque: 35,
      defesa: 25,
      xp: 300,
      ouro: 200,
    },
  ];

  for (let i = 0; i < torreBosses.length; i++) {
    const boss = criarBossTorre(i);
    console.log(`\n⚔️ Boss ${i + 1}: ${boss.nome}`);

    const venceu = batalha(boss);
    if (!venceu) {
      console.log("❌ Você foi derrotado e expulso da torre!");
      return;
    }

    console.log(`✅ Você derrotou ${boss.nome}!`);
    console.log("Você pode se curar antes do próximo combate.");
    jogador.hp = jogador.hpMax;

    const opcao = prompt("[01] Continuar | [02] Sair da Torre: ");
    if (opcao === "2") {
      console.log("Você saiu da torre. Os bosses serão resetados!");
      return;
    }
  }

  console.log(
    "\n🎉 Você derrotou todos os bosses e salvou a princesa! FIM DE JOGO!"
  );
  process.exit();
}
// === Poções ===
function usarPocao() {
  const pocaoIndex = jogador.itens.indexOf("Poção de Cura");
  if (pocaoIndex === -1) {
    console.log("Você não tem Poção de Cura.");
    return;
  }
  jogador.itens.splice(pocaoIndex, 1);
  const cura = Math.min(jogador.hpMax - jogador.hp, 40);
  jogador.hp += cura;
  console.log(
    `Você usou uma Poção de Cura e recuperou ${cura} HP. (HP atual: ${jogador.hp}/${jogador.hpMax})`
  );
}

function obterDrop(itensDisponiveis, bonus = 0) {
  const comuns = itensDisponiveis.filter((i) => i.raridade === "comum");
  const raros = itensDisponiveis.filter((i) => i.raridade === "raro");
  const lendarios = itensDisponiveis.filter((i) => i.raridade === "lendario");

  // Monta pools com pesos
  const pools = [];
  if (comuns.length > 0) pools.push({ pool: comuns, weight: 80 + bonus });
  if (raros.length > 0) pools.push({ pool: raros, weight: 50 + bonus });
  if (lendarios.length > 0) pools.push({ pool: lendarios, weight: 30 + bonus });

  if (pools.length === 0) return null;

  const totalWeight = pools.reduce((s, p) => s + p.weight, 0);
  let roll = rand(1, totalWeight);
  for (const p of pools) {
    if (roll <= p.weight) {
      // escolhe um item aleatório do pool selecionado
      return p.pool[rand(0, p.pool.length - 1)];
    }
    roll -= p.weight;
  }

  return null;
}

// === Verificação do Amuleto Supremo ===
function verificarAmuletoSupremo() {
  const itensNecessarios = [
    "Pena do Corvo Sombrio",
    "Gema da Escuridão",
    "Essência da Noite",
    "Escama de Dragão Azul",
    "Relíquia Brilhante",
    "Pergaminho Arcano",
    "Página Amaldiçoada",
    "Coração de Magma",
    "Máscara Sombria",
    "Flor da Aurora",
  ];

  const possuiTodos = itensNecessarios.every((item) =>
    jogador.inventario.includes(item)
  );

  if (possuiTodos && !jogador.inventario.includes("Amuleto Supremo")) {
    jogador.inventario.push("Amuleto Supremo");
    console.log("\n🔥 Você combinou todos os itens e criou o Amuleto Supremo!");
    console.log("O poder do amuleto aumenta seu ataque e defesa em 20 cada!");
    jogador.ataque += 20;
    jogador.defesa += 20;
  }
}

// === Missões com drops por raridade ===
function fazerMissao() {
  const missao = missoes[rand(0, missoes.length - 1)];
  console.log(`\n📜 Missão: ${missao.descricao}`);

  let recompensaTexto = `Chance de sucesso: ${missao.chanceSucesso}% | Recompensa: ${missao.xp} XP e ${missao.ouro} ouro`;
  if (missao.item) {
    if (typeof missao.item === "string") {
      recompensaTexto += ` + item (${missao.item})`;
    } else {
      recompensaTexto += ` + item ${missao.item.nome} [${missao.item.raridade}]`;
    }
  }
  console.log(recompensaTexto + ".");

  const confirmar = prompt("Deseja tentar a missão? (s/n) ");
  if (confirmar.toLowerCase() !== "s") {
    console.log("Missão cancelada.");
    return;
  }

  const resultado = rand(1, 100);
  if (resultado <= missao.chanceSucesso) {
    console.log("✅ Missão completada com sucesso!");
    jogador.xp += missao.xp;
    jogador.ouro += missao.ouro;

    // Se a missão tem um item específico (objeto com raridade), aplica chance por raridade
    if (missao.item && typeof missao.item === "object") {
      const raridade = (missao.item.raridade || "comum").toLowerCase();
      let baseChance = 0;
      if (raridade === "comum") baseChance = 80;
      else if (raridade === "raro") baseChance = 50;
      else if (raridade === "lendario") baseChance = 30;

      // bônus de classe Assassino
      const bonusClasse = jogador.classe === "Assassino" ? 10 : 0;
      const chanceFinal = Math.min(100, baseChance + bonusClasse);

      const rollDrop = rand(1, 100);
      if (rollDrop <= chanceFinal) {
        jogador.inventario.push(missao.item.nome);
        console.log(
          `🎁 Você obteve o item da missão: ${
            missao.item.nome
          } (${missao.item.raridade.toUpperCase()})`
        );
        // verifica se já pode montar o amuleto
        verificarAmuletoSupremo();
      } else {
        console.log("Você não conseguiu pegar o item especial da missão.");
      }
    } else if (missao.item && typeof missao.item === "string") {
      // item string é sempre entregue (ou mantive esse comportamento)
      jogador.inventario.push(missao.item);
      console.log(`Você obteve o item: ${missao.item}`);
      verificarAmuletoSupremo();
    }

    // Chance de achar Poção de Cura (opcional)
    if (rand(1, 100) <= 30) {
      jogador.itens.push("Poção de Cura");
      console.log("Além disso, você encontrou uma Poção de Cura!");
    }

    checarLevelUp();
  } else {
    console.log("❌ Falhou na missão. Voltou machucado.");
    const dano = rand(8, 18);
    jogador.hp -= dano;
    if (jogador.hp < 0) jogador.hp = 0;
    console.log(`Você perdeu ${dano} HP.`);
  }
}

// --- Descansar ---
function descansar() {
  const cura = Math.min(jogador.hpMax - jogador.hp, rand(15, 30));
  jogador.hp += cura;
  console.log(
    `\n🛌 Você descansou e recuperou ${cura} HP. (HP: ${jogador.hp}/${jogador.hpMax})`
  );
  // custo de tempo/risco: chance encontrar inimigo leve
  if (rand(1, 100) <= 20) {
    console.log("Durante o descanso você foi surpreendido!");
    batalha(criarInimigo());
  }
}

// --- Checar condição para enfrentar o chefe ---
function podeEnfrentarChefe() {
  // Requisitos: nível >= 5 OU possuir 'Insígnia do Viajante' OU xp acumulada >= 80
  return (
    jogador.nivel >= 5 ||
    jogador.itens.includes("Insígnia do Viajante") ||
    jogador.xp >= 80
  );
}

// --- Chefe final (salvar princesa) ---
function enfrentarChefe() {
  console.log(
    "\n🏰 Você se aproxima do Castelo. O Guardião impede sua passagem!"
  );

  if (!podeEnfrentarChefe()) {
    console.log(
      "⚠️ Você não está pronto para enfrentar o chefe final. Precisa estar mais forte (nível 5 ou ter a 'Insígnia do Viajante' ou >=80 XP)."
    );
    return false;
  }

  const chefe = {
    nome: "Guardião do Castelo",
    hp: 180 + jogador.nivel * 10,
    atk: 14 + jogador.nivel * 2,
  };
  console.log(`⚔️ Chefe: ${chefe.nome} (HP: ${chefe.hp}, ATK: ${chefe.atk})`);

  while (chefe.hp > 0 && jogador.hp > 0) {
    console.log(
      `\nSeu HP: ${jogador.hp}/${jogador.hpMax} | ${chefe.nome} HP: ${chefe.hp}`
    );
    console.log("[1] Atacar  [2] Usar Poção  [3] Tentar Negociar");
    const escolha = prompt("Escolha: ");

    if (escolha === "1") {
      let dmg = danoDoJogador() + Math.floor(jogador.nivel / 2);

      // Efeitos de arma (opcional, consistência com batalha normal)
      if (
        jogador.armaEquipada &&
        jogador.armaEquipada.efeito === "critico" &&
        rand(1, 100) <= 15
      ) {
        dmg *= 2;
        console.log("💥 Golpe crítico!");
      }

      chefe.hp -= dmg;
      console.log(`Você causou ${dmg} de dano no ${chefe.nome}.`);
    } else if (escolha === "2") {
      usarPocao();
    } else if (escolha === "3") {
      if (rand(1, 100) <= 20 + jogador.nivel) {
        console.log(
          "Você convenceu o Guardião a se retirar (negociação bem sucedida)!"
        );
        console.log("👑 Você salvou a princesa sem lutar! Vitória limpa.");
        return true;
      } else {
        console.log("Negociação falhou. O Guardião ataca você furiosamente!");
      }
    } else {
      console.log("Opção inválida.");
    }

    if (chefe.hp > 0) {
      const defesaTotal = calcularDefesaTotal();
      const danoBruto = chefe.atk + rand(0, 6);
      const reducao = Math.floor(defesaTotal / 5);
      const dano = Math.max(1, danoBruto - reducao);
      jogador.hp -= dano;
      console.log(
        `${chefe.nome} causou ${dano} de dano em você. (Defesa: ${defesaTotal})`
      );
    }
  }

  if (jogador.hp <= 0) {
    console.log(
      "\n💀 Você foi derrotado pelo Guardião... A princesa permanece presa."
    );
    return false;
  }

  console.log(
    "\n🏆 Você derrotou o Guardião! Correu até a torre e libertou a princesa."
  );
  console.log("✨ Fim de jogo: PARABÉNS! Você salvou a princesa!");
  return true;
}

// --- Jogo principal ---
function iniciarJogo() {
  console.clear();
  console.log("=== RPG - THE LOST WORLD ===");
  console.log(
    `\nBem-vindo, ${jogador.nome}! Sua missão: ficar forte e salvar a princesa da Torre.\n`
  );

  let jogoAtivo = true;

  while (jogoAtivo) {
    if (jogador.hp <= 0) {
      console.log("\n💀 Você está inconsciente. Fim de jogo.");
      break;
    }

    console.log("\nO que deseja fazer agora?");
    console.log("[1] Explorar");
    console.log("[2] Fazer uma missão");
    console.log("[3] Descansar");
    console.log("[4] Status / Inventário");
    console.log("[5] Amuleto");
    console.log("[6] Loja");
    console.log("[7] Enfrentar Torre");
    console.log("[0] Sair do jogo");

    const escolha = prompt("Escolha: ");

    switch (escolha) {
      case "1":
        if (rand(1, 100) <= 90) {
          if (jogador.nivel > 10 && rand(1, 100) <= 10) {
            const miniboss = criarMiniBoss();
            console.log("\n⚠️ Atenção! Um MINI-BOSS apareceu!");
            batalha(miniboss);
          } else {
            const inimigo = criarInimigo();
            batalha(inimigo);
          }
        } else {
          console.log("Você explorou, mas não encontrou nada interessante.");
        }
        break;

      case "2":
        fazerMissao();
        break;

      case "3":
        descansar();
        break;

      case "4":
        status();
        break;

      case "5":
        menuAmuleto();
        break;

      case "6":
        abrirLoja();
        break;

      case "7":
        entrarNaTorre();
        break;

      case "0":
        console.log("Saindo do jogo. Até a próxima!");
        jogoAtivo = false;
        break;

      default:
        console.log("Escolha inválida, tente novamente.");
        break;
    }

    // Recuperação passiva
    if (jogador.hp > 0 && rand(1, 100) <= 25) {
      const regen = rand(2, 6);
      jogador.hp = Math.min(jogador.hp + regen, jogador.hpMax);
      console.log(
        `\n💚 Recuperação passiva: +${regen} HP (HP: ${jogador.hp}/${jogador.hpMax})`
      );
    }
  }

  console.log("\n--- JOGO ENCERRADO ---");
}

// Inicia o jogo
iniciarJogo();