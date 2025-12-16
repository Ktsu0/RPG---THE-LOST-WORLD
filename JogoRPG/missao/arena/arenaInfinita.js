import { colors } from "./../../utilitarios.js";
import { ICONS } from "./../../icons.js";
import {
  salvarInventario,
  restaurarInventario,
  limparInventarioArena,
  carregarPontosArena,
  salvarPontosArena,
} from "./backupInventario.js";
import { montarArsenal } from "./montarArsenal.js";
import { combateInfinito } from "./combateInfinito.js";
import { lojaArena } from "./lojaArena.js";

const POCOES_INICIAIS = 5;
const NIVEL_MINIMO = 5;

/**
 * Verifica se o jogador pode acessar a arena
 */
export function podeAcessarArena(jogador) {
  return jogador.nivel >= NIVEL_MINIMO;
}

/**
 * Exibe introdução da arena
 */
async function exibirIntroducao() {
  console.log(`\n${"=".repeat(60)}`);
  console.log(`${ICONS.MASMORRA} ${colors.bright}${colors.red}ARENA INFINITA${colors.reset}`);
  console.log(`${"=".repeat(60)}\n`);
  
  console.log(`${colors.cyan}Bem-vindo à Arena Infinita!${colors.reset}\n`);
  
  console.log(`${colors.yellow}${colors.bright}📜 COMO FUNCIONA:${colors.reset}\n`);
  
  console.log(`${colors.green}✅ Seu inventário está SEGURO:${colors.reset}`);
  console.log(`   ${colors.gray}• Seus itens reais são salvos antes de entrar${colors.reset}`);
  console.log(`   ${colors.gray}• Você usa equipamentos temporários da arena${colors.reset}`);
  console.log(`   ${colors.gray}• Ao sair, tudo volta ao normal${colors.reset}\n`);
  
  console.log(`${colors.magenta}💾 CHECKPOINTS A CADA 5 ONDAS:${colors.reset}`);
  console.log(`   ${colors.gray}• Onda 5, 10, 15, 20... = MiniBoss${colors.reset}`);
  console.log(`   ${colors.gray}• Fragmentos são CONFIRMADOS após MiniBoss${colors.reset}`);
  console.log(`   ${colors.gray}• Se morrer antes, perde fragmentos não confirmados${colors.reset}\n`);
  
  console.log(`${colors.cyan}✨ BÊNÇÃOS ALEATÓRIAS:${colors.reset}`);
  console.log(`   ${colors.gray}• 15% de chance entre ondas${colors.reset}`);
  console.log(`   ${colors.gray}• Escolha entre: +HP, Cura ou +ATK${colors.reset}`);
  console.log(`   ${colors.gray}• Bônus são removidos ao morrer/sair${colors.reset}\n`);
  
  console.log(`${colors.yellow}Regras:${colors.reset}`);
  console.log(`  ${ICONS.ARMA} Enfrente ondas infinitas de inimigos`);
  console.log(`  ${ICONS.BOSS} A cada 5 ondas, enfrente um MiniBoss`);
  console.log(`  ${ICONS.TESOURO} Colete Fragmentos Antigos`);
  console.log(`  ${ICONS.OURO} Ganhe pontos da arena para comprar itens`);
  console.log(`  ${ICONS.DERROTA} Se morrer, NÃO perde o jogo!\n`);
  
  console.log(`${colors.magenta}Recursos:${colors.reset}`);
  console.log(`  ${ICONS.POCAO_CURA} ${POCOES_INICIAIS} Poções de Cura iniciais`);
  console.log(`  ${ICONS.LOJA} Loja da arena disponível após MiniBoss`);
  console.log(`  ${ICONS.ARMADURA} 6 peças de equipamento para escolher\n`);
  
  console.log(`${colors.red}${colors.bright}⚠️  IMPORTANTE:${colors.reset}`);
  console.log(`  ${colors.gray}• Fragmentos só salvam após MiniBoss${colors.reset}`);
  console.log(`  ${colors.gray}• Pontos da arena são permanentes${colors.reset}`);
  console.log(`  ${colors.gray}• Bônus de bênçãos são temporários${colors.reset}\n`);
  
  await aguardar(3000);
}

/**
 * Adiciona poções iniciais
 */
function adicionarPocoesIniciais(jogador) {
  for (let i = 0; i < POCOES_INICIAIS; i++) {
    jogador.inventario.push({
      nome: "Poção de Cura",
      slot: "consumable",
      preco: 200,
    });
  }
  
  console.log(`${ICONS.POCAO_CURA} ${colors.green}Você recebeu ${POCOES_INICIAIS} Poções de Cura!${colors.reset}\n`);
}

/**
 * Processa resultado final
 */
function processarResultado(jogador, resultado) {
  console.log(`\n${"=".repeat(60)}`);
  console.log(`${ICONS.VITORIA} ${colors.bright}${colors.yellow}RESULTADO FINAL${colors.reset}`);
  console.log(`${"=".repeat(60)}\n`);
  
  console.log(`${ICONS.MONSTRO} Ondas sobrevividas: ${colors.cyan}${resultado.ondaFinal}${colors.reset}`);
  console.log(`${ICONS.OURO} Pontos finais: ${colors.yellow}${resultado.pontosFinais}${colors.reset}`);
  console.log(`${ICONS.TESOURO} Fragmentos obtidos: ${colors.magenta}${resultado.fragmentos}${colors.reset}\n`);
  
  // Adicionar fragmentos ao inventário
  if (resultado.fragmentos > 0) {
    for (let i = 0; i < resultado.fragmentos; i++) {
      jogador.inventario.push({
        nome: "Fragmento Antigo",
        tipo: "material",
        descricao: "Material raro da Arena Infinita",
      });
    }
    console.log(`${ICONS.SUCESSO} ${colors.green}Fragmentos adicionados ao seu inventário!${colors.reset}\n`);
  }
  
  if (resultado.morreu) {
    console.log(`${colors.red}Você foi derrotado, mas seu progresso foi salvo.${colors.reset}`);
  } else {
    console.log(`${colors.green}Você saiu da arena com segurança!${colors.reset}`);
  }
}

/**
 * Função principal da Arena Infinita
 */
export async function arenaInfinita(jogador) {
  // Verificar nível
  if (!podeAcessarArena(jogador)) {
    console.log(`\n${ICONS.ERRO} ${colors.red}Você precisa ser nível ${NIVEL_MINIMO} ou superior para acessar a Arena Infinita!${colors.reset}`);
    console.log(`${colors.gray}Nível atual: ${jogador.nivel}${colors.reset}\n`);
    return;
  }
  
  // Introdução
  await exibirIntroducao();
  
  console.log(`${colors.yellow}Deseja entrar na Arena Infinita? (s/n)${colors.reset} `);
  const confirmacao = await new Promise((resolve) => {
    process.stdin.once("data", (key) => {
      resolve(key.toString().trim().toLowerCase());
    });
  });
  
  if (confirmacao !== "s") {
    console.log(`${colors.cyan}Você decidiu não entrar na arena.${colors.reset}`);
    return;
  }
  
  try {
    // 1. Salvar inventário original
    console.log(`\n${ICONS.INFO} ${colors.cyan}Salvando seu inventário...${colors.reset}`);
    salvarInventario(jogador);
    await aguardar(1000);
    
    // 2. Limpar inventário
    console.log(`${ICONS.INFO} ${colors.cyan}Preparando arena...${colors.reset}`);
    limparInventarioArena(jogador);
    await aguardar(1000);
    
    // 3. Montar arsenal
    await montarArsenal(jogador);
    await aguardar(2000);
    
    // 4. Adicionar poções iniciais
    adicionarPocoesIniciais(jogador);
    await aguardar(1000);
    
    // 5. Carregar pontos da arena
    const pontosIniciais = carregarPontosArena();
    if (pontosIniciais > 0) {
      console.log(`${ICONS.OURO} ${colors.yellow}Você tem ${pontosIniciais} pontos da arena salvos!${colors.reset}\n`);
    }
    
    // 6. Iniciar combate infinito
    console.log(`${ICONS.ARMA} ${colors.bright}${colors.red}A ARENA COMEÇA AGORA!${colors.reset}\n`);
    await aguardar(2000);
    
    const resultado = await combateInfinito(jogador, pontosIniciais, lojaArena);
    
    // 7. Salvar pontos finais
    salvarPontosArena(resultado.pontosFinais);
    
    // 8. Processar resultado
    processarResultado(jogador, resultado);
    
    // 9. Restaurar inventário
    console.log(`\n${ICONS.INFO} ${colors.cyan}Restaurando seu inventário...${colors.reset}`);
    restaurarInventario(jogador);
    await aguardar(1000);
    
    console.log(`\n${ICONS.SUCESSO} ${colors.green}Você saiu da Arena Infinita!${colors.reset}\n`);
    
  } catch (error) {
    console.error(`\n${ICONS.ERRO} ${colors.red}Erro na arena:${colors.reset}`, error);
    
    // Tentar restaurar inventário em caso de erro
    try {
      restaurarInventario(jogador);
    } catch (restoreError) {
      console.error(`${ICONS.ERRO} ${colors.red}Erro ao restaurar inventário:${colors.reset}`, restoreError);
    }
  }
}

function aguardar(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
