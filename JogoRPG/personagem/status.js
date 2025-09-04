import { aplicarBonusDeConjunto, rand, ARMOR_SLOTS } from "./../jogo.js";
import { gerenciarEquipamentos } from "./../itens/gerenciarEquipamentos.js";
import promptSync from "prompt-sync";
const prompt = promptSync();

// --- Checar status / inventário ---
export function status() {
  console.log("\n--- STATUS ---");
  console.log(`Nome: ${jogador.nome}`);
  console.log(
    `Nível: ${jogador.nivel} | XP: ${jogador.xp}/${xpParaProximoNivel()}`
  );
  console.log(`HP: ${jogador.hp}/${jogador.hpMax}`);
  console.log(`Atk atual: ${calcularAtaque()}`);
  console.log(`Ouro: ${jogador.ouro}`);

  console.log(`Consumíveis: ${formatarItens(jogador.itens)}`);
  console.log(`Inventário: ${formatarItens(jogador.inventario)}`);

  console.log("Equipamentos:");
  for (const s of ARMOR_SLOTS) {
    const it = jogador.equipamentos[s];
    console.log(
      ` - ${s}: ${
        it
          ? it.nome + ` (Def:${it.defesa} ATK+:${it.atkBonus} Set:${it.set})`
          : "Nenhum"
      }`
    );
  }
  console.log(`Defesa total: ${calcularDefesaTotal()}`);
  console.log(
    `Arma equipada: ${
      jogador.armaEquipada ? jogador.armaEquipada.nome : "Nenhuma"
    }`
  );
  console.log("[M] Gerenciar Equipamentos e Armas");

  const opcao = prompt("Digite M para gerenciar ou Enter para sair: ");
  if (opcao.toLowerCase() === "m") {
    gerenciarEquipamentos();
  }
  console.log("---------------\n");
}

export function equiparItem(item) {
  // Verifica se o slot é válido
  if (!ARMOR_SLOTS.includes(item.slot)) {
    console.log("Slot desconhecido para esse item.");
    return;
  }

  // Bloqueia armaduras se a raça tiver restrição
  if (jogador.restricoes.semArmadura) {
    console.log("❌ Sua raça não pode equipar armaduras!");
    return;
  }

  // Equipar normalmente
  jogador.equipamentos[item.slot] = item;
  aplicarBonusDeConjunto();
  console.log(`✅ ${item.nome} equipado no slot ${item.slot}.`);
}

// --- Calcular Ataque ---
export function calcularAtaque() {
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
  const temSet =
    equipamentos.length === ARMOR_SLOTS.length &&
    equipamentos.every((it) => it.set) &&
    equipamentos.map((it) => it.set).every((s) => s === equipamentos[0].set);
  if (temSet) atk += Math.floor(jogador.nivel * 2);

  // bônus do amuleto
  if (jogador.amuletoEquipado)
    atk += Math.floor((jogador.ataqueOriginal || 0) * 0.02);

  // bônus da arma equipada
  if (jogador.armaEquipada && jogador.armaEquipada.atk) {
    atk += jogador.armaEquipada.atk;
  }

  return atk;
}

// --- Calcular Defesa ---
export function calcularDefesaTotal() {
  let def = jogador.defesa || 0; // inclui bônus de raça/classe

  const itens = Object.values(jogador.equipamentos).filter((it) => it);
  for (const it of itens) {
    if (it.defesa) def += it.defesa;
  }

  // bônus de set completo
  const temSet =
    itens.length === ARMOR_SLOTS.length &&
    itens.every((it) => it.set) &&
    itens.map((it) => it.set).every((s) => s === itens[0].set);
  if (temSet) def += 10;

  return def;
}
// === Cálculo de Dano do Jogador ===
export function danoDoJogador() {
  // Usa ataque centralizado + variação rand(0-4)
  return Math.max(1, Math.floor(calcularAtaque()) + rand(0, 4));
}

// === Progressão de Nível / XP ===
export function xpParaProximoNivel() {
  return Math.floor(50 * Math.pow(jogador.nivel, 1.4));
}

export function checarLevelUp() {
  while (jogador.xp >= xpParaProximoNivel()) {
    jogador.xp -= xpParaProximoNivel();
    jogador.nivel += 1;
    jogador.hpMax += 15;
    jogador.hp = jogador.hpMax;
    console.log(
      `\n🎉 Parabéns! Você subiu para o nível ${jogador.nivel}! HP restaurado para ${jogador.hpMax}.\n`
    );
  }
}

function formatarItens(array) {
  if (!array || array.length === 0) return "Nenhum";

  const contagem = array.reduce((acc, item) => {
    acc[item] = (acc[item] || 0) + 1;
    return acc;
  }, {});

  return Object.entries(contagem)
    .map(([nome, qtd]) => `${qtd}x ${nome}`)
    .join(", ");
}
