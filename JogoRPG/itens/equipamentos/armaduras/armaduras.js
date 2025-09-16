import { aplicarBonusDeConjunto } from "./../efeitos/armadurasEfeitos.js";
import { colors } from "./../../../utilitarios.js";
import { ARMOR_SLOTS } from "./../../../jogo.js";

import promptSync from "prompt-sync";
const prompt = promptSync();

export function gerenciarArmaduras(jogador) {
  console.log(`\n${colors.bright}=== ARMADURAS ===${colors.reset}`);

  ARMOR_SLOTS.forEach((slot) => {
    const equipado = jogador.equipamentos[slot];
    const nome = equipado
      ? `${colors.green}${equipado.nome}${colors.reset}`
      : `${colors.yellow}Nenhuma${colors.reset}`;
    console.log(` - ${slot}: ${nome}`);
  });

  console.log(
    `\n${colors.magenta}Seu inventário de armaduras disponíveis:${colors.reset}`
  );
  const armadurasNoInventario = jogador.inventario.filter(
    (i) => i.slot && i.slot !== "consumable"
  );

  if (armadurasNoInventario.length === 0) {
    console.log(
      `${colors.red}Nenhuma armadura disponível no inventário.${colors.reset}`
    );
    return;
  }

  armadurasNoInventario.forEach((item, index) => {
    console.log(
      `[${colors.green}${index + 1}${colors.reset}] ${colors.magenta}${
        item.nome
      }${colors.reset} (Def:${item.defesa} ATK+:${item.atkBonus} Set:${
        item.set || "-"
      })`
    );
  });
  console.log(`[${colors.gray}0${colors.reset}] Voltar`);

  const idxRaw = prompt("Escolha a armadura para equipar: ");
  const idx = parseInt(idxRaw);

  if (isNaN(idx) || idx < 0 || idx > armadurasNoInventario.length) {
    console.log(`${colors.red}Escolha inválida.${colors.reset}`);
    return;
  }
  if (idx === 0) return;

  const armaduraEscolhida = armadurasNoInventario[idx - 1];

  // Guarda armadura atual no inventário
  if (jogador.equipamentos[armaduraEscolhida.slot]) {
    jogador.inventario.push(jogador.equipamentos[armaduraEscolhida.slot]);
  }

  // Equipa a nova armadura
  jogador.equipamentos[armaduraEscolhida.slot] = armaduraEscolhida;

  // Remove do inventário
  jogador.inventario = jogador.inventario.filter(
    (i) => i !== armaduraEscolhida
  );

  console.log(
    `✅ ${colors.green}Equipou:${colors.reset} ${colors.magenta}${armaduraEscolhida.nome}${colors.reset}`
  );

  // Recalcula bônus de conjunto
  aplicarBonusDeConjunto(jogador);
}
