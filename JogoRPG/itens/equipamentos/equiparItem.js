import { ARMOR_SLOTS } from "../../jogo.js";
import { aplicarBonusDeConjunto } from "./efeitos/armadurasEfeitos.js";
import { colors } from "../../utilitarios.js";

// --- Equipar item ---
export function equiparItem(jogador, item) {
  if (!ARMOR_SLOTS.includes(item.slot)) {
    console.log("Slot desconhecido para esse item.");
    return;
  }

  if (jogador.restricoes && jogador.restricoes.semArmadura) {
    console.log(
      `${colors.red}❌ Sua raça não pode equipar armaduras!${colors.reset}`
    );
    return;
  }

  // Verifica se o slot já está ocupado
  if (jogador.equipamentos[item.slot]) {
    // Slot ocupado, adiciona ao inventário
    jogador.inventario.push(item);
    console.log(
      `${colors.yellow}🔹 Slot de ${item.slot} já está ocupado. ${item.nome} foi para o inventário.${colors.reset}`
    );
  } else {
    // Slot vazio, equipa o item
    jogador.equipamentos[item.slot] = item;
    aplicarBonusDeConjunto(jogador);
    console.log(
      `${colors.bright}${colors.white}${item.nome} equipada com Sucesso.${colors.reset}`
    );
  }
}
