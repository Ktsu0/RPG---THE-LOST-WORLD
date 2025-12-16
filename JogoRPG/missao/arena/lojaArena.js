import { colors } from "./../../utilitarios.js";
import { ICONS } from "./../../icons.js";
import { EQUIPAMENTOS_ARENA } from "./montarArsenal.js";

const PRECO_POCAO = 100; // pontos da arena

/**
 * Loja da Arena - Só acessível entre MiniBosses
 */
export async function lojaArena(jogador, pontosArena) {
  let sair = false;
  
  while (!sair) {
    console.log(`\n${ICONS.LOJA} ${colors.bright}${colors.cyan}=== LOJA DA ARENA ===${colors.reset}`);
    console.log(`${ICONS.OURO} Pontos disponíveis: ${colors.yellow}${pontosArena}${colors.reset}\n`);
    
    // Contar poções
    const pocoes = jogador.inventario.filter((i) => i.nome === "Poção de Cura").length;
    
    console.log(`[1] ${ICONS.POCAO_CURA} Comprar Poção de Cura - ${colors.yellow}${PRECO_POCAO}${colors.reset} pontos ${colors.gray}(Você tem: ${pocoes})${colors.reset}`);
    console.log(`[2] ${ICONS.ARMADURA} Trocar Equipamento - ${colors.yellow}Varia${colors.reset}`);
    console.log(`${colors.red}[0] Sair da loja${colors.reset}`);
    
    const escolha = await new Promise((resolve) => {
      process.stdin.once("data", (key) => {
        resolve(key.toString().trim());
      });
    });
    
    if (escolha === "1") {
      // Comprar poção
      if (pontosArena >= PRECO_POCAO) {
        pontosArena -= PRECO_POCAO;
        jogador.inventario.push({ nome: "Poção de Cura", slot: "consumable", preco: 200 });
        console.log(`\n${ICONS.SUCESSO} ${colors.green}Poção de Cura comprada!${colors.reset}`);
        console.log(`${ICONS.OURO} Pontos restantes: ${colors.yellow}${pontosArena}${colors.reset}`);
      } else {
        console.log(`\n${ICONS.ERRO} ${colors.red}Pontos insuficientes!${colors.reset}`);
      }
      await aguardar(1500);
      
    } else if (escolha === "2") {
      // Trocar equipamento
      pontosArena = await trocarEquipamento(jogador, pontosArena);
      
    } else if (escolha === "0") {
      sair = true;
    } else {
      console.log(`${ICONS.ERRO} ${colors.red}Opção inválida!${colors.reset}`);
      await aguardar(1000);
    }
  }
  
  return pontosArena;
}

/**
 * Sistema de troca de equipamento
 */
async function trocarEquipamento(jogador, pontosArena) {
  console.log(`\n${ICONS.ARMADURA} ${colors.bright}${colors.cyan}=== TROCAR EQUIPAMENTO ===${colors.reset}`);
  console.log(`${colors.yellow}Escolha qual peça deseja trocar:${colors.reset}\n`);
  
  const slots = [
    { nome: "Elmo", slot: "head", categoria: "elmo", custo: 150 },
    { nome: "Peitoral", slot: "chest", categoria: "peitoral", custo: 200 },
    { nome: "Luvas", slot: "hands", categoria: "luvas", custo: 100 },
    { nome: "Botas", slot: "feet", categoria: "botas", custo: 100 },
    { nome: "Arma", slot: "weapon", categoria: "arma", custo: 250 },
  ];
  
  slots.forEach((s, i) => {
    const equipado = s.slot === "weapon" ? jogador.armaEquipada : jogador.equipamentos[s.slot];
    const nomeEquipado = equipado ? equipado.nome : "Nenhum";
    console.log(`[${i + 1}] ${s.nome} - ${colors.yellow}${s.custo}${colors.reset} pontos ${colors.gray}(Atual: ${nomeEquipado})${colors.reset}`);
  });
  
  console.log(`${colors.red}[0] Cancelar${colors.reset}`);
  
  const escolha = await new Promise((resolve) => {
    process.stdin.once("data", (key) => {
      resolve(key.toString().trim());
    });
  });
  
  const index = parseInt(escolha) - 1;
  
  if (escolha === "0") {
    return pontosArena;
  }
  
  if (index >= 0 && index < slots.length) {
    const slotEscolhido = slots[index];
    
    if (pontosArena < slotEscolhido.custo) {
      console.log(`\n${ICONS.ERRO} ${colors.red}Pontos insuficientes!${colors.reset}`);
      await aguardar(1500);
      return pontosArena;
    }
    
    // Mostrar opções
    const opcoes = EQUIPAMENTOS_ARENA[slotEscolhido.categoria];
    console.log(`\n${colors.cyan}Escolha a nova peça:${colors.reset}\n`);
    
    opcoes.forEach((item, i) => {
      const cor = i === 0 ? colors.cyan : i === 1 ? colors.red : colors.green;
      console.log(`${cor}[${i + 1}] ${item.nome}${colors.reset}`);
      console.log(`    ${colors.gray}${item.descricao}${colors.reset}`);
    });
    
    console.log(`${colors.red}[0] Cancelar${colors.reset}`);
    
    const escolhaItem = await new Promise((resolve) => {
      process.stdin.once("data", (key) => {
        resolve(key.toString().trim());
      });
    });
    
    const itemIndex = parseInt(escolhaItem) - 1;
    
    if (escolhaItem === "0") {
      return pontosArena;
    }
    
    if (itemIndex >= 0 && itemIndex < opcoes.length) {
      const novoItem = { ...opcoes[itemIndex] };
      
      // Remover stats do item antigo
      if (slotEscolhido.slot === "weapon") {
        const itemAntigo = jogador.armaEquipada;
        if (itemAntigo) {
          jogador.ataque -= itemAntigo.atk;
        }
        jogador.armaEquipada = novoItem;
        jogador.ataque += novoItem.atk;
      } else {
        const itemAntigo = jogador.equipamentos[slotEscolhido.slot];
        if (itemAntigo) {
          jogador.defesa -= itemAntigo.defesa;
          jogador.ataque -= itemAntigo.atkBonus;
          jogador.hpMax -= itemAntigo.hpBonus;
          jogador.hp = Math.min(jogador.hp, jogador.hpMax);
        }
        jogador.equipamentos[slotEscolhido.slot] = novoItem;
        jogador.defesa += novoItem.defesa;
        jogador.ataque += novoItem.atkBonus;
        jogador.hpMax += novoItem.hpBonus;
      }
      
      pontosArena -= slotEscolhido.custo;
      
      console.log(`\n${ICONS.SUCESSO} ${colors.green}Equipamento trocado!${colors.reset}`);
      console.log(`${ICONS.OURO} Pontos restantes: ${colors.yellow}${pontosArena}${colors.reset}`);
      console.log(`\n${colors.cyan}Novos stats:${colors.reset}`);
      console.log(`${ICONS.HP} HP: ${colors.green}${jogador.hp}/${jogador.hpMax}${colors.reset}`);
      console.log(`${ICONS.ATAQUE} ATK: ${colors.yellow}${jogador.ataque}${colors.reset}`);
      console.log(`${ICONS.DEFESA} DEF: ${colors.blue}${jogador.defesa}${colors.reset}`);
      
      await aguardar(2000);
    } else {
      console.log(`${ICONS.ERRO} ${colors.red}Opção inválida!${colors.reset}`);
      await aguardar(1000);
    }
  } else {
    console.log(`${ICONS.ERRO} ${colors.red}Opção inválida!${colors.reset}`);
    await aguardar(1000);
  }
  
  return pontosArena;
}

function aguardar(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
