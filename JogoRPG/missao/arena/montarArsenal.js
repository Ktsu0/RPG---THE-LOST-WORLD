import { colors } from "./../../utilitarios.js";
import { ICONS } from "./../../icons.js";

/**
 * Opções de equipamentos para a arena
 * Cada categoria tem 3 opções com atributos diferentes
 */

export const EQUIPAMENTOS_ARENA = {
  elmo: [
    {
      nome: "Elmo do Gladiador",
      slot: "head",
      defesa: 15,
      atkBonus: 5,
      hpBonus: 20,
      descricao: "Equilibrado - Bom para iniciantes",
    },
    {
      nome: "Elmo do Berserker",
      slot: "head",
      defesa: 8,
      atkBonus: 12,
      hpBonus: 10,
      descricao: "Ofensivo - Alto ataque, baixa defesa",
    },
    {
      nome: "Elmo do Guardião",
      slot: "head",
      defesa: 22,
      atkBonus: 2,
      hpBonus: 35,
      descricao: "Defensivo - Alta defesa e HP",
    },
  ],

  peitoral: [
    {
      nome: "Peitoral do Gladiador",
      slot: "chest",
      defesa: 25,
      atkBonus: 8,
      hpBonus: 30,
      descricao: "Equilibrado - Proteção sólida",
    },
    {
      nome: "Peitoral do Berserker",
      slot: "chest",
      defesa: 15,
      atkBonus: 18,
      hpBonus: 15,
      descricao: "Ofensivo - Máximo dano",
    },
    {
      nome: "Peitoral do Guardião",
      slot: "chest",
      defesa: 35,
      atkBonus: 3,
      hpBonus: 50,
      descricao: "Defensivo - Tanque puro",
    },
  ],

  luvas: [
    {
      nome: "Luvas do Gladiador",
      slot: "hands",
      defesa: 10,
      atkBonus: 6,
      hpBonus: 15,
      descricao: "Equilibrado - Versatilidade",
    },
    {
      nome: "Luvas do Berserker",
      slot: "hands",
      defesa: 5,
      atkBonus: 14,
      hpBonus: 8,
      descricao: "Ofensivo - Golpes devastadores",
    },
    {
      nome: "Luvas do Guardião",
      slot: "hands",
      defesa: 18,
      atkBonus: 2,
      hpBonus: 25,
      descricao: "Defensivo - Resistência máxima",
    },
  ],

  calcas: [
    {
      nome: "Calças do Gladiador",
      slot: "legs",
      defesa: 18,
      atkBonus: 7,
      hpBonus: 25,
      descricao: "Equilibrado - Proteção das pernas",
    },
    {
      nome: "Calças do Berserker",
      slot: "legs",
      defesa: 10,
      atkBonus: 15,
      hpBonus: 12,
      descricao: "Ofensivo - Mobilidade agressiva",
    },
    {
      nome: "Calças do Guardião",
      slot: "legs",
      defesa: 28,
      atkBonus: 3,
      hpBonus: 40,
      descricao: "Defensivo - Base sólida",
    },
  ],

  botas: [
    {
      nome: "Botas do Gladiador",
      slot: "feet",
      defesa: 12,
      atkBonus: 4,
      hpBonus: 20,
      descricao: "Equilibrado - Mobilidade e proteção",
    },
    {
      nome: "Botas do Berserker",
      slot: "feet",
      defesa: 6,
      atkBonus: 10,
      hpBonus: 10,
      descricao: "Ofensivo - Velocidade de ataque",
    },
    {
      nome: "Botas do Guardião",
      slot: "feet",
      defesa: 20,
      atkBonus: 1,
      hpBonus: 30,
      descricao: "Defensivo - Inabalável",
    },
  ],

  arma: [
    {
      nome: "Espada da Arena",
      slot: "weapon",
      atk: 25,
      descricao: "Equilibrado - Dano consistente",
      efeito: null,
    },
    {
      nome: "Machado do Caos",
      slot: "weapon",
      atk: 35,
      descricao: "Ofensivo - Dano massivo",
      efeito: { tipo: "critico", chance: 20 },
    },
    {
      nome: "Lança do Protetor",
      slot: "weapon",
      atk: 20,
      descricao: "Defensivo - Roubo de vida",
      efeito: { tipo: "roubo_vida", valor: 15 },
    },
  ],
};

/**
 * Exibe as opções de uma categoria
 */
export function exibirOpcoes(categoria, opcoes) {
  console.log(`\n${ICONS.ARMADURA} ${colors.bright}${colors.cyan}=== ESCOLHA SEU ${categoria.toUpperCase()} ===${colors.reset}\n`);
  
  opcoes.forEach((item, index) => {
    const cor = index === 0 ? colors.cyan : index === 1 ? colors.red : colors.green;
    
    console.log(`${cor}[${index + 1}] ${item.nome}${colors.reset}`);
    console.log(`    ${colors.gray}${item.descricao}${colors.reset}`);
    
    if (item.slot === "weapon") {
      console.log(`    ${ICONS.ATAQUE} ATK: ${colors.yellow}+${item.atk}${colors.reset}`);
      if (item.efeito) {
        console.log(`    ${ICONS.CRITICO} Efeito: ${colors.magenta}${item.efeito.tipo}${colors.reset}`);
      }
    } else {
      console.log(`    ${ICONS.DEFESA} DEF: ${colors.blue}+${item.defesa}${colors.reset} | ${ICONS.ATAQUE} ATK: ${colors.yellow}+${item.atkBonus}${colors.reset} | ${ICONS.HP} HP: ${colors.green}+${item.hpBonus}${colors.reset}`);
    }
    console.log();
  });
}

/**
 * Seleciona um equipamento
 */
export async function selecionarEquipamento(categoria, opcoes) {
  exibirOpcoes(categoria, opcoes);
  
  console.log(`${colors.yellow}Escolha sua opção (1-3):${colors.reset} `);
  
  const escolha = await new Promise((resolve) => {
    process.stdin.once("data", (key) => {
      resolve(key.toString().trim());
    });
  });

  const index = parseInt(escolha) - 1;
  
  if (index >= 0 && index < opcoes.length) {
    const item = { ...opcoes[index] };
    console.log(`\n${ICONS.SUCESSO} ${colors.green}Você escolheu: ${item.nome}${colors.reset}`);
    return item;
  } else {
    console.log(`${ICONS.ERRO} ${colors.red}Escolha inválida! Tente novamente.${colors.reset}`);
    return await selecionarEquipamento(categoria, opcoes);
  }
}

/**
 * Monta o arsenal completo
 */
export async function montarArsenal(jogador) {
  console.log(`\n${ICONS.ARMA} ${colors.bright}${colors.yellow}=== MONTAGEM DE ARSENAL ===${colors.reset}`);
  console.log(`${colors.cyan}Escolha seus equipamentos para a arena.${colors.reset}`);
  console.log(`${colors.gray}Cada escolha é final até você falhar ou sair.${colors.reset}\n`);

  await aguardar(2000);

  // Ordem obrigatória
  const categorias = [
    { nome: "elmo", opcoes: EQUIPAMENTOS_ARENA.elmo },
    { nome: "peitoral", opcoes: EQUIPAMENTOS_ARENA.peitoral },
    { nome: "luvas", opcoes: EQUIPAMENTOS_ARENA.luvas },
    { nome: "calcas", opcoes: EQUIPAMENTOS_ARENA.calcas },
    { nome: "botas", opcoes: EQUIPAMENTOS_ARENA.botas },
    { nome: "arma", opcoes: EQUIPAMENTOS_ARENA.arma },
  ];

  const equipamentosSelecionados = {};

  for (const categoria of categorias) {
    const item = await selecionarEquipamento(categoria.nome, categoria.opcoes);
    equipamentosSelecionados[categoria.nome] = item;
    await aguardar(1000);
  }

  // Aplicar equipamentos ao jogador
  aplicarEquipamentos(jogador, equipamentosSelecionados);

  // Mostrar resumo
  mostrarResumo(jogador, equipamentosSelecionados);

  return equipamentosSelecionados;
}

/**
 * Aplica os equipamentos ao jogador
 */
function aplicarEquipamentos(jogador, equipamentos) {
  // Resetar stats base
  jogador.ataque = 5 + (jogador.bonusRaca?.atk || 0) + (jogador.bonusClasse?.atk || 0);
  jogador.defesa = 5 + (jogador.bonusRaca?.def || 0) + (jogador.bonusClasse?.def || 0);
  let hpBonus = 0;

  // Aplicar armaduras
  if (equipamentos.elmo) {
    jogador.equipamentos.head = equipamentos.elmo;
    jogador.defesa += equipamentos.elmo.defesa;
    jogador.ataque += equipamentos.elmo.atkBonus;
    hpBonus += equipamentos.elmo.hpBonus;
  }

  if (equipamentos.peitoral) {
    jogador.equipamentos.chest = equipamentos.peitoral;
    jogador.defesa += equipamentos.peitoral.defesa;
    jogador.ataque += equipamentos.peitoral.atkBonus;
    hpBonus += equipamentos.peitoral.hpBonus;
  }

  if (equipamentos.luvas) {
    jogador.equipamentos.hands = equipamentos.luvas;
    jogador.defesa += equipamentos.luvas.defesa;
    jogador.ataque += equipamentos.luvas.atkBonus;
    hpBonus += equipamentos.luvas.hpBonus;
  }

  if (equipamentos.calcas) {
    jogador.equipamentos.legs = equipamentos.calcas;
    jogador.defesa += equipamentos.calcas.defesa;
    jogador.ataque += equipamentos.calcas.atkBonus;
    hpBonus += equipamentos.calcas.hpBonus;
  }

  if (equipamentos.botas) {
    jogador.equipamentos.feet = equipamentos.botas;
    jogador.defesa += equipamentos.botas.defesa;
    jogador.ataque += equipamentos.botas.atkBonus;
    hpBonus += equipamentos.botas.hpBonus;
  }

  // Aplicar arma
  if (equipamentos.arma) {
    jogador.armaEquipada = equipamentos.arma;
    jogador.ataque += equipamentos.arma.atk;
  }

  // Aplicar HP bonus
  jogador.hpMax += hpBonus;
  jogador.hp = jogador.hpMax;
}

/**
 * Mostra resumo do build
 */
function mostrarResumo(jogador, equipamentos) {
  console.log(`\n${ICONS.SUCESSO} ${colors.bright}${colors.green}=== ARSENAL COMPLETO ===${colors.reset}\n`);
  
  console.log(`${ICONS.HP} HP: ${colors.green}${jogador.hp}/${jogador.hpMax}${colors.reset}`);
  console.log(`${ICONS.ATAQUE} ATK: ${colors.yellow}${jogador.ataque}${colors.reset}`);
  console.log(`${ICONS.DEFESA} DEF: ${colors.blue}${jogador.defesa}${colors.reset}\n`);

  console.log(`${colors.cyan}Equipamentos:${colors.reset}`);
  console.log(`  ${ICONS.ARMADURA} ${equipamentos.elmo.nome}`);
  console.log(`  ${ICONS.ARMADURA} ${equipamentos.peitoral.nome}`);
  console.log(`  ${ICONS.ARMADURA} ${equipamentos.luvas.nome}`);
  console.log(`  ${ICONS.ARMADURA} ${equipamentos.calcas.nome}`);
  console.log(`  ${ICONS.ARMADURA} ${equipamentos.botas.nome}`);
  console.log(`  ${ICONS.ARMA} ${equipamentos.arma.nome}\n`);
}

function aguardar(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
