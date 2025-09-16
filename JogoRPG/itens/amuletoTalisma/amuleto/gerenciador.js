import { colors } from "./../../../utilitarios.js";

// --- Gerenciar Amuleto (função original) ---
export function gerenciarAmuleto(jogador) {
  if (!jogador.inventario.includes("Amuleto Supremo")) {
    console.log(
      `${colors.red}❌ Você ainda não possui o Amuleto Supremo.${colors.reset}`
    );
    return;
  }

  if (!jogador.amuletoEquipado) {
    console.log(
      `${colors.green}✅ Você equipou o Amuleto Supremo! (+5% ATK e +10% VIDA)${colors.reset}`
    );
    jogador.ataqueOriginal = jogador.ataque;
    jogador.hpMaxOriginal = jogador.hpMax;
    jogador.ataque = Math.floor(jogador.ataqueOriginal * 1.05);
    jogador.hpMax = Math.floor(jogador.hpMaxOriginal * 1.1);
    jogador.hp = jogador.hpMax;
    jogador.amuletoEquipado = true;
  } else {
    console.log("Você removeu o Amuleto Supremo.");
    jogador.ataque = jogador.ataqueOriginal;
    jogador.hpMax = jogador.hpMaxOriginal;
    if (jogador.hp > jogador.hpMax) jogador.hp = jogador.hpMax;
    jogador.amuletoEquipado = false;
  }
}
