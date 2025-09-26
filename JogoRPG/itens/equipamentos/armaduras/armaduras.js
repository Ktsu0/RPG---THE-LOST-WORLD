import { aplicarBonusDeConjunto } from "./../efeitos/armadurasEfeitos.js";
import { colors } from "./../../../utilitarios.js";
import { ARMOR_SLOTS } from "./../../../jogo.js";

// A função agora é assíncrona
export async function gerenciarArmaduras(jogador) {
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
    (item) => item.slot && ARMOR_SLOTS.includes(item.slot)
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
      }${colors.reset} (Def:${colors.green}+${item.defesa}${colors.reset} ATK:${
        colors.green
      }+${item.atkBonus}${colors.reset} Set:${colors.cyan}${item.set || "-"}${
        colors.reset
      })`
    );
  });
  console.log(`[${colors.gray}0${colors.reset}] Voltar`);

  const idxRaw = await new Promise((resolve) => {
    process.stdin.once("data", (key) => resolve(key.toString().trim()));
  });
  const idx = parseInt(idxRaw);

  if (isNaN(idx) || idx < 0 || idx > armadurasNoInventario.length) {
    console.log(`${colors.red}Escolha inválida.${colors.reset}`);
    return;
  }
  if (idx === 0) return;

  const armaduraEscolhida = armadurasNoInventario[idx - 1];

  // --- VERIFICA RESTRIÇÃO DE RAÇA ---
  if (jogador.restricoes?.semArmadura) {
    console.log(
      `${colors.red}❌ Sua raça não pode equipar armaduras.${colors.reset}`
    );
    return;
  }

  // Guarda a armadura atual no inventário, se houver
  if (jogador.equipamentos[armaduraEscolhida.slot]) {
    jogador.inventario.push(jogador.equipamentos[armaduraEscolhida.slot]);
  }

  // Equipa a nova armadura
  jogador.equipamentos[armaduraEscolhida.slot] = armaduraEscolhida;

  // Remove do inventário
  const indexParaRemover = jogador.inventario.findIndex(
    (i) => i === armaduraEscolhida
  );
  if (indexParaRemover > -1) jogador.inventario.splice(indexParaRemover, 1);

  console.log(
    `✅ ${colors.green}Equipou:${colors.reset} ${colors.magenta}${armaduraEscolhida.nome}${colors.reset}`
  );

  aplicarBonusDeConjunto(jogador);
}
