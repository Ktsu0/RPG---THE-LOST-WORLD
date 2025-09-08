import { rand, ARMOR_SLOTS } from "./../jogo.js";
import {
    gerenciarEquipamentos,
    aplicarBonusDeConjunto,
} from "./../itens/gerenciarEquipamentos.js";
import promptSync from "prompt-sync";
const prompt = promptSync();

// --- Função auxiliar: formata itens para exibição ---
function formatarItens(array) {
    if (!array || array.length === 0) return "Nenhum";
    const contagem = array.reduce((acc, item) => {
        const nome = item.nome || item; // caso seja string ou objeto
        acc[nome] = (acc[nome] || 0) + 1;
        return acc;
    }, {});
    return Object.entries(contagem)
        .map(([nome, qtd]) => `${qtd}x ${nome}`)
        .join(", ");
}

// --- Função auxiliar: verifica se todos os slots têm set completo ---
function temSetCompleto(equipamentos) {
    const itens = Object.values(equipamentos).filter((it) => it && it.set);
    return (
        itens.length === ARMOR_SLOTS.length &&
        itens.every((it) => it.set === itens[0].set)
    );
}

// --- Exibir status ---
export function status(jogador) {
    console.log("\n--- STATUS ---");
    console.log(`Nome: ${jogador.nome}`);
    console.log(
        `Nível: ${jogador.nivel} | XP: ${jogador.xp}/${xpParaProximoNivel(jogador)}`
    );
    console.log(`HP: ${jogador.hp}/${jogador.hpMax}`);
    console.log(`Atk atual: ${calcularAtaque(jogador)}`);
    console.log(`Ouro: ${jogador.ouro}`);
    console.log(`Consumíveis: ${formatarItens(jogador.itens)}`);
    console.log(`Inventário: ${formatarItens(jogador.inventario)}`);

    console.log("Equipamentos:");
    for (const s of ARMOR_SLOTS) {
        const it = jogador.equipamentos[s];
        console.log(
                ` - ${s}: ${
        it
          ? `${it.nome} (Def:${it.defesa} ATK+:${it.atkBonus} Set:${
              it.set || "Nenhum"
            })`
          : "Nenhum"
      }`
    );
  }
  console.log(`Defesa total: ${calcularDefesaTotal(jogador)}`);
  console.log(
    `Arma equipada: ${
      jogador.armaEquipada ? jogador.armaEquipada.nome : "Nenhuma"
    }`
  );

  const opcao = prompt("[M] Gerenciar Equipamentos/Armas ou Enter para sair: ");
  if (opcao.toLowerCase() === "m") {
    gerenciarEquipamentos(jogador);
  }
  console.log("---------------\n");
}

// --- Equipar item ---
export function equiparItem(jogador, item) {
  if (!ARMOR_SLOTS.includes(item.slot)) {
    console.log("Slot desconhecido para esse item.");
    return;
  }

  if (jogador.restricoes.semArmadura) {
    console.log("❌ Sua raça não pode equipar armaduras!");
    return;
  }

  jogador.equipamentos[item.slot] = item;
  aplicarBonusDeConjunto(jogador);
  console.log(`✅ ${item.nome} equipado no slot ${item.slot}.`);
}

// --- Calcular ataque ---
export function calcularAtaque(jogador) {
  let atk = jogador.ataque || 0;

  // bônus por nível
  atk += Math.floor(jogador.nivel * 2);

  // bônus de equipamentos
  const equipamentos = Object.values(jogador.equipamentos).filter((it) => it);
  const atkBonus = equipamentos.reduce(
    (acc, it) => acc + (it.atkBonus || 0),
    0
  );
  atk += atkBonus;

  // bônus de set completo
  if (temSetCompleto(jogador.equipamentos))
    atk += Math.floor(jogador.nivel * 2);

  // bônus do amuleto
  if (jogador.amuletoEquipado)
    atk += Math.floor((jogador.ataqueOriginal || jogador.ataque) * 0.02);

  // bônus da arma equipada
  if (jogador.armaEquipada && jogador.armaEquipada.atk)
    atk += jogador.armaEquipada.atk;

  return atk;
}

// --- Calcular defesa ---
export function calcularDefesaTotal(jogador) {
  let def = jogador.defesa || 0;

  const itens = Object.values(jogador.equipamentos).filter((it) => it);
  for (const it of itens) {
    def += it.defesa || 0;
  }

  if (temSetCompleto(jogador.equipamentos)) def += 10;

  return def;
}

// --- Cálculo de dano ---
export function danoDoJogador(jogador) {
  return Math.max(1, Math.floor(calcularAtaque(jogador)) + rand(0, 4));
}

// --- Progressão de nível ---
export function xpParaProximoNivel(jogador) {
  return Math.floor(50 * Math.pow(jogador.nivel, 1.4));
}

export function checarLevelUp(jogador) {
  while (jogador.xp >= xpParaProximoNivel(jogador)) {
    jogador.xp -= xpParaProximoNivel(jogador);
    jogador.nivel += 1;
    jogador.hpMax += 15;
    jogador.hp = jogador.hpMax;
    console.log(
      `\n🎉 Parabéns! Você subiu para o nível ${jogador.nivel}! HP restaurado para ${jogador.hpMax}.\n`
    );
  }
}

// --- Aplica Fúria do Bárbaro ---
export function aplicarFuria(jogador, dano) {
  // Verifica se o jogador é Bárbaro e está com <= 30% de HP
  if (jogador.classe === "Bárbaro" && jogador.hp <= jogador.hpMax * 0.3) {
    console.log("🔥 Fúria do Bárbaro ativada! Dano aumentado em 50%!");
    return Math.floor(dano * 1.5);
  }
  // Caso contrário, retorna o dano normal
  return dano;
}