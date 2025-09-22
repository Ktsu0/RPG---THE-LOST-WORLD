import { ARMOR_SLOTS } from "../../jogo.js";
import { aplicarBonusDeConjunto } from "./efeitos/armadurasEfeitos.js";
import { colors } from "../../utilitarios.js";

// --- Equipar item ---
export function equiparItem(jogador, item) {
  // Se for uma arma, chama a função específica
  if (item.slot === "weapon") {
    equiparArma(jogador, item);
  }
  // Se for uma armadura, chama a função específica
  else if (ARMOR_SLOTS.includes(item.slot)) {
    equiparArmadura(jogador, item);
  }
  // Caso o slot seja desconhecido
  else {
    console.log("Slot desconhecido para esse item.");
  }
}

function equiparArmadura(jogador, armadura) {
  // --- Lógica para o caso de o slot estar ocupado ---
  if (jogador.equipamentos[armadura.slot]) {
    // Adiciona o item recém-dropado ao inventário, sem equipá-lo
    jogador.inventario.push(armadura);

    console.log(
      `${colors.yellow}🔹 Slot de ${armadura.slot} já está ocupado.${colors.reset}`
    );
    console.log(
      `${colors.bright}${colors.white}${armadura.nome}${colors.reset} foi adicionada ao seu inventário.`
    );
  }
  // --- Lógica para o caso de o slot estar vazio ---
  else {
    // Slot vazio, equipa o item
    jogador.equipamentos[armadura.slot] = armadura;

    // Aplica o bônus de conjunto
    aplicarBonusDeConjunto(jogador);

    console.log(
      `${colors.bright}${colors.white}${armadura.nome} equipada com Sucesso.${colors.reset}`
    );
  }
}

function equiparArma(jogador, arma) {
  // Se já houver uma arma equipada, ela vai para o inventário
  if (jogador.armaEquipada) {
    jogador.inventario.push(jogador.armaEquipada);
  }

  // Equipa a nova arma
  jogador.armaEquipada = arma;

  console.log(
    `✅ ${colors.green}Equipou:${colors.reset} ${colors.magenta}${arma.nome}${colors.reset}`
  );
}
