import { colors } from "./../../utilitarios.js";
import { ICONS } from "./../../icons.js";

const CHANCE_BENCAO = 15; // 15% de chance

/**
 * Verifica se uma bênção deve aparecer
 */
export function deveMostrarBencao() {
  return Math.random() * 100 <= CHANCE_BENCAO;
}

/**
 * Oferece uma bênção ao jogador
 */
export async function oferecerBencao(jogador, bonusArena) {
  console.log(`\n${"=".repeat(60)}`);
  console.log(`${ICONS.INFO} ${colors.bright}${colors.magenta}✨ UMA BÊNÇÃO APARECE! ✨${colors.reset}`);
  console.log(`${"=".repeat(60)}\n`);
  
  console.log(`${colors.cyan}Os deuses da arena olham favoravelmente para você...${colors.reset}\n`);
  
  await aguardar(1500);
  
  console.log(`${colors.yellow}Escolha sua bênção:${colors.reset}\n`);
  
  // Opção 1: Aumentar HP máximo
  const hpBonus = Math.floor(jogador.hpMax * 0.15); // 15% do HP máximo
  console.log(`[1] ${ICONS.HP} ${colors.green}Bênção da Vitalidade${colors.reset}`);
  console.log(`    ${colors.gray}Aumenta seu HP máximo em ${colors.green}${hpBonus}${colors.gray} permanentemente${colors.reset}`);
  console.log(`    ${colors.gray}HP atual: ${jogador.hp}/${jogador.hpMax} → ${jogador.hp}/${jogador.hpMax + hpBonus}${colors.reset}\n`);
  
  // Opção 2: Curar
  const curaMin = Math.floor(jogador.hpMax * 0.50); // 50%
  const curaMax = Math.floor(jogador.hpMax * 0.70); // 70%
  const curaMedia = Math.floor((curaMin + curaMax) / 2);
  console.log(`[2] ${ICONS.POCAO_CURA} ${colors.cyan}Bênção da Cura${colors.reset}`);
  console.log(`    ${colors.gray}Restaura entre ${colors.green}50-70%${colors.gray} do seu HP máximo${colors.reset}`);
  console.log(`    ${colors.gray}Cura estimada: ~${curaMedia} HP${colors.reset}\n`);
  
  // Opção 3: Aumentar ATK
  const atkBonus = Math.floor(jogador.ataque * 0.10); // 10% do ATK
  console.log(`[3] ${ICONS.ATAQUE} ${colors.red}Bênção do Poder${colors.reset}`);
  console.log(`    ${colors.gray}Aumenta seu ATK em ${colors.yellow}${atkBonus}${colors.gray} permanentemente${colors.reset}`);
  console.log(`    ${colors.gray}ATK atual: ${jogador.ataque} → ${jogador.ataque + atkBonus}${colors.reset}\n`);
  
  const escolha = await new Promise((resolve) => {
    process.stdin.once("data", (key) => {
      resolve(key.toString().trim());
    });
  });
  
  if (escolha === "1") {
    // Bênção da Vitalidade
    jogador.hpMax += hpBonus;
    bonusArena.hpBonus += hpBonus;
    
    console.log(`\n${ICONS.SUCESSO} ${colors.green}Você recebeu a Bênção da Vitalidade!${colors.reset}`);
    console.log(`${ICONS.HP} HP máximo: ${colors.green}${jogador.hpMax}${colors.reset} (+${hpBonus})\n`);
    
  } else if (escolha === "2") {
    // Bênção da Cura
    const cura = Math.floor(Math.random() * (curaMax - curaMin + 1)) + curaMin;
    const hpAntes = jogador.hp;
    jogador.hp = Math.min(jogador.hp + cura, jogador.hpMax);
    const curaReal = jogador.hp - hpAntes;
    
    console.log(`\n${ICONS.SUCESSO} ${colors.cyan}Você recebeu a Bênção da Cura!${colors.reset}`);
    console.log(`${ICONS.POCAO_CURA} HP restaurado: ${colors.green}+${curaReal}${colors.reset}`);
    console.log(`${ICONS.HP} HP: ${colors.green}${jogador.hp}/${jogador.hpMax}${colors.reset}\n`);
    
  } else if (escolha === "3") {
    // Bênção do Poder
    jogador.ataque += atkBonus;
    bonusArena.atkBonus += atkBonus;
    
    console.log(`\n${ICONS.SUCESSO} ${colors.red}Você recebeu a Bênção do Poder!${colors.reset}`);
    console.log(`${ICONS.ATAQUE} ATK: ${colors.yellow}${jogador.ataque}${colors.reset} (+${atkBonus})\n`);
    
  } else {
    console.log(`\n${ICONS.AVISO} ${colors.yellow}Escolha inválida! A bênção desapareceu...${colors.reset}\n`);
  }
  
  await aguardar(2000);
}

/**
 * Remove bônus da arena ao morrer
 */
export function removerBonusArena(jogador, bonusArena) {
  if (bonusArena.hpBonus > 0) {
    jogador.hpMax -= bonusArena.hpBonus;
    jogador.hp = Math.min(jogador.hp, jogador.hpMax);
    console.log(`${ICONS.AVISO} ${colors.gray}Bônus de HP removido: -${bonusArena.hpBonus}${colors.reset}`);
  }
  
  if (bonusArena.atkBonus > 0) {
    jogador.ataque -= bonusArena.atkBonus;
    console.log(`${ICONS.AVISO} ${colors.gray}Bônus de ATK removido: -${bonusArena.atkBonus}${colors.reset}`);
  }
  
  // Resetar bônus
  bonusArena.hpBonus = 0;
  bonusArena.atkBonus = 0;
}

function aguardar(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
