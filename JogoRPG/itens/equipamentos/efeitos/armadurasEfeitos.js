import { colors } from "./../../../utilitarios.js"; // ajuste o caminho conforme seu projeto

export function aplicarBonusDeConjunto(jogador) {
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
      let bonusMensagem = "";
      switch (set) {
        case "Ferro":
          bonusMensagem = `${colors.cyan}+15% chance de bloquear ataque!${colors.reset}`;
          jogador.bonusBloqueio += 15;
          break;
        case "Ligeiro":
          bonusMensagem = `${colors.blue}+15% esquiva!${colors.reset}`;
          jogador.bonusEsquiva += 15;
          break;
        case "Sombra":
          bonusMensagem = `${colors.yellow}+10% crítico${colors.reset} e ${colors.blue}+10% esquiva!${colors.reset}`;
          jogador.bonusEsquiva += 10;
          jogador.bonusCritico += 10;
          break;
        case "Dragão":
          bonusMensagem = `${colors.green}+10% HP${colors.reset} e ${colors.red}+10% ATK!${colors.reset}`;
          jogador.bonusHP += 10;
          jogador.bonusAtk += 10;
          break;
      }

      console.log(
        `${colors.bright}✅ Você equipou todo o conjunto ${set}!${colors.reset}`
      );
      console.log(`🎁 Bônus aplicado: ${bonusMensagem}`);
    }
  }
}
