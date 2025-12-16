import { colors } from "./../../utilitarios.js";
import { ICONS } from "./../../icons.js";
import { criarInimigo } from "./../../inimigos/monstros.js";
import { sistemaBatalha } from "./../../batalha/sistemaBatalha.js";
import { deveMostrarBencao, oferecerBencao, removerBonusArena } from "./bencaos.js";

/**
 * Calcula a dificuldade baseada na onda
 */
function calcularDificuldade(onda) {
  // Dificuldade aumenta gradualmente
  return Math.min(10, Math.floor(1 + onda / 3));
}

/**
 * Calcula quantidade de inimigos baseada na onda
 */
function calcularQuantidadeInimigos(onda) {
  if (onda <= 3) return 1;
  if (onda <= 7) return 2;
  if (onda <= 12) return 3;
  return Math.min(5, Math.floor(onda / 4));
}

/**
 * Verifica se é onda de MiniBoss
 */
export function isOndaMiniBoss(onda) {
  return onda % 5 === 0;
}

/**
 * Cria um MiniBoss
 */
function criarMiniBoss(onda, jogador) {
  const dificuldade = calcularDificuldade(onda);
  const miniboss = criarInimigo(jogador);
  
  // MiniBoss é mais forte
  miniboss.hp = Math.floor(miniboss.hp * 2.5);
  miniboss.hpMax = miniboss.hp;
  miniboss.atk = Math.floor(miniboss.atk * 1.5);
  miniboss.nome = `⭐ ${miniboss.nome} (MiniBoss)`;
  
  return miniboss;
}

/**
 * Calcula pontos ganhos por inimigo
 */
function calcularPontos(onda, isMiniBoss) {
  const base = isMiniBoss ? 50 : 10;
  const multiplicador = 1 + (onda * 0.1);
  return Math.floor(base * multiplicador);
}

/**
 * Calcula chance de drop de fragmento
 * Base: 5% inimigos normais, 20% MiniBoss (igual à missão de ondas)
 */
function calcularChanceFragmento(onda, isMiniBoss, ondaDesdeUltimoMiniBoss) {
  if (isMiniBoss) {
    // MiniBoss: 20% base (igual missão de ondas) + escalonamento
    const baseChance = 20; // Mesmo da missão de ondas
    const bonusOnda = onda * 1.5; // +1.5% por onda
    return Math.min(70, baseChance + bonusOnda); // Máximo 70%
  } else {
    // Inimigos normais: 5% base (igual missão de ondas) + escalonamento
    const baseChance = 5; // Mesmo da missão de ondas
    const bonusOnda = onda * 0.3; // +0.3% por onda
    return Math.min(25, baseChance + bonusOnda); // Máximo 25%
  }
}

/**
 * Tenta dropar fragmento
 */
function tentarDropFragmento(onda, isMiniBoss, ondaDesdeUltimoMiniBoss) {
  const chance = calcularChanceFragmento(onda, isMiniBoss, ondaDesdeUltimoMiniBoss);
  const roll = Math.random() * 100;
  
  if (roll <= chance) {
    console.log(`\n${ICONS.TESOURO} ${colors.magenta}Um Fragmento Antigo caiu!${colors.reset}`);
    return 1;
  }
  
  return 0;
}

/**
 * Executa uma onda de combate
 */
async function executarOnda(onda, jogador, stats) {
  const isMiniBoss = isOndaMiniBoss(onda);
  
  console.log(`\n${"=".repeat(50)}`);
  if (isMiniBoss) {
    console.log(`${ICONS.BOSS} ${colors.red}${colors.bright}ONDA ${onda} - MINIBOSS!${colors.reset}`);
  } else {
    console.log(`${ICONS.MONSTRO} ${colors.cyan}Onda ${onda}${colors.reset}`);
  }
  console.log(`${"=".repeat(50)}\n`);

  if (isMiniBoss) {
    // MiniBoss
    const miniboss = criarMiniBoss(onda, jogador);
    console.log(`${colors.red}${miniboss.nome} apareceu!${colors.reset}`);
    console.log(`${ICONS.HP} HP: ${miniboss.hp} | ${ICONS.ATAQUE} ATK: ${miniboss.atk}\n`);
    
    const vitoria = await sistemaBatalha(miniboss, jogador, { modo: 'onda' });
    
    if (!vitoria) {
      return { vitoria: false, pontos: 0, fragmentos: 0 };
    }
    
    // Recompensas do MiniBoss
    const pontos = calcularPontos(onda, true);
    const fragmentos = tentarDropFragmento(onda, true, stats.ondaDesdeUltimoMiniBoss);
    
    console.log(`\n${ICONS.VITORIA} ${colors.green}MiniBoss derrotado!${colors.reset}`);
    console.log(`${ICONS.OURO} +${pontos} pontos da arena`);
    
    if (fragmentos > 0) {
      stats.fragmentosNaoConfirmados += fragmentos;
    }
    
    // Checkpoint - confirma fragmentos
    stats.fragmentosConfirmados += stats.fragmentosNaoConfirmados;
    console.log(`\n${ICONS.SUCESSO} ${colors.yellow}CHECKPOINT! Fragmentos confirmados: ${stats.fragmentosConfirmados}${colors.reset}`);
    stats.fragmentosNaoConfirmados = 0;
    stats.ondaDesdeUltimoMiniBoss = 0;
    
    return { vitoria: true, pontos, fragmentos, isMiniBoss: true };
    
  } else {
    // Inimigos normais
    const quantidade = calcularQuantidadeInimigos(onda);
    console.log(`${colors.yellow}${quantidade} inimigo(s) aparecem!${colors.reset}\n`);
    
    let pontosTotal = 0;
    let fragmentosTotal = 0;
    
    for (let i = 0; i < quantidade; i++) {
      if (quantidade > 1) {
        console.log(`${colors.cyan}Inimigo ${i + 1}/${quantidade}${colors.reset}`);
      }
      
      const inimigo = criarInimigo(jogador);
      const vitoria = await sistemaBatalha(inimigo, jogador, { modo: 'onda' });
      
      if (!vitoria) {
        return { vitoria: false, pontos: pontosTotal, fragmentos: fragmentosTotal };
      }
      
      const pontos = calcularPontos(onda, false);
      const fragmentos = tentarDropFragmento(onda, false, stats.ondaDesdeUltimoMiniBoss);
      
      pontosTotal += pontos;
      fragmentosTotal += fragmentos;
      
      if (fragmentos > 0) {
        stats.fragmentosNaoConfirmados += fragmentos;
      }
    }
    
    console.log(`\n${ICONS.VITORIA} ${colors.green}Onda ${onda} completa!${colors.reset}`);
    console.log(`${ICONS.OURO} +${pontosTotal} pontos da arena`);
    
    stats.ondaDesdeUltimoMiniBoss++;
    
    return { vitoria: true, pontos: pontosTotal, fragmentos: fragmentosTotal, isMiniBoss: false };
  }
}

/**
 * Loop principal de combate infinito
 */
export async function combateInfinito(jogador, pontosIniciais, lojaCallback) {
  const stats = {
    onda: 1,
    pontosArena: pontosIniciais,
    fragmentosConfirmados: 0,
    fragmentosNaoConfirmados: 0,
    ondaDesdeUltimoMiniBoss: 0,
  };

  // Rastrear bônus da arena para remover ao morrer
  const bonusArena = {
    hpBonus: 0,
    atkBonus: 0,
  };

  console.log(`\n${ICONS.ARMA} ${colors.bright}${colors.yellow}=== ARENA INFINITA ===${colors.reset}`);
  console.log(`${colors.cyan}Sobreviva o máximo possível!${colors.reset}`);
  console.log(`${colors.gray}A cada 5 ondas, enfrente um MiniBoss e ganhe um checkpoint.${colors.reset}\n`);

  await aguardar(2000);

  while (true) {
    // Mostrar stats
    console.log(`\n${colors.bright}Status:${colors.reset}`);
    console.log(`${ICONS.HP} HP: ${colors.green}${jogador.hp}/${jogador.hpMax}${colors.reset}`);
    console.log(`${ICONS.OURO} Pontos: ${colors.yellow}${stats.pontosArena}${colors.reset}`);
    console.log(`${ICONS.TESOURO} Fragmentos confirmados: ${colors.magenta}${stats.fragmentosConfirmados}${colors.reset}`);
    if (stats.fragmentosNaoConfirmados > 0) {
      console.log(`${ICONS.AVISO} Fragmentos não confirmados: ${colors.yellow}${stats.fragmentosNaoConfirmados}${colors.reset} ${colors.gray}(perdidos se morrer)${colors.reset}`);
    }

    // Executar onda
    const resultado = await executarOnda(stats.onda, jogador, stats);
    
    if (!resultado.vitoria) {
      // Morreu - Remover bônus da arena
      console.log(`\n${ICONS.DERROTA} ${colors.red}Você foi derrotado na onda ${stats.onda}!${colors.reset}`);
      
      // Remover bônus antes de mostrar fragmentos
      if (bonusArena.hpBonus > 0 || bonusArena.atkBonus > 0) {
        console.log(`\n${colors.gray}Removendo bônus temporários da arena...${colors.reset}`);
        removerBonusArena(jogador, bonusArena);
      }
      
      console.log(`\n${ICONS.TESOURO} Fragmentos recebidos: ${colors.magenta}${stats.fragmentosConfirmados}${colors.reset}`);
      console.log(`${ICONS.AVISO} Fragmentos perdidos: ${colors.red}${stats.fragmentosNaoConfirmados}${colors.reset}`);
      
      return {
        ondaFinal: stats.onda,
        pontosFinais: stats.pontosArena,
        fragmentos: stats.fragmentosConfirmados,
        morreu: true,
        bonusRemovidos: bonusArena,
      };
    }
    
    // Ganhou pontos
    stats.pontosArena += resultado.pontos;
    
    // Se foi MiniBoss, oferece loja
    if (resultado.isMiniBoss) {
      console.log(`\n${ICONS.LOJA} ${colors.yellow}A loja da arena está disponível!${colors.reset}`);
      console.log(`[1] Acessar loja`);
      console.log(`[2] Continuar lutando`);
      console.log(`[0] Sair da arena (salvar progresso)`);
      
      const escolha = await new Promise((resolve) => {
        process.stdin.once("data", (key) => {
          resolve(key.toString().trim());
        });
      });
      
      if (escolha === "1") {
        // Acessar loja
        stats.pontosArena = await lojaCallback(jogador, stats.pontosArena);
      } else if (escolha === "0") {
        // Sair - Remover bônus da arena
        if (bonusArena.hpBonus > 0 || bonusArena.atkBonus > 0) {
          console.log(`\n${colors.gray}Removendo bônus temporários da arena...${colors.reset}`);
          removerBonusArena(jogador, bonusArena);
        }
        
        console.log(`\n${ICONS.SAIDA} ${colors.cyan}Você saiu da arena com segurança.${colors.reset}`);
        console.log(`${ICONS.TESOURO} Fragmentos recebidos: ${colors.magenta}${stats.fragmentosConfirmados}${colors.reset}`);
        
        return {
          ondaFinal: stats.onda,
          pontosFinais: stats.pontosArena,
          fragmentos: stats.fragmentosConfirmados,
          morreu: false,
          bonusRemovidos: bonusArena,
        };
      }
    } else {
      // Entre ondas normais - Chance de bênção (15%)
      if (deveMostrarBencao()) {
        await oferecerBencao(jogador, bonusArena);
      }
    }
    
    // Próxima onda
    stats.onda++;
    await aguardar(1500);
  }
}

function aguardar(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
