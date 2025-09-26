import { ARMOR_SLOTS } from "./../jogo.js";
import { colors } from "./../utilitarios.js";
import { gerenciarEquipamentos } from "./../itens/equipamentos/gerenciarEquipamentos.js";
import { getRaridadeCor } from "./../codigosUniversais.js";
import { calcularAtaque } from "./../batalha/ataqueJogador/calcular/calcularAtk.js";
import { xpParaProximoNivel } from "./experiencia.js";
import { calcularDefesaTotal } from "./../batalha/ataqueJogador/calcular/calcularDef.js";

// Remova o prompt-sync
// import promptSync from "prompt-sync";
// const prompt = promptSync();

// --- Formata itens para exibição ---
function formatarItens(array) {
  if (!array || array.length === 0)
    return `${colors.gray}Nenhum${colors.reset}`;

  const contagem = array.reduce((acc, item) => {
    const nome = item && item.nome ? item.nome : item; // objeto ou string
    acc[nome] = (acc[nome] || 0) + 1;
    return acc;
  }, {});

  return Object.entries(contagem)
    .map(([nome, qtd]) => `${qtd}x ${nome}`)
    .join(", ");
}

// --- Exibe um equipamento específico ---
function exibirEquipamento(slot, equipamento) {
  if (!equipamento) return `${colors.gray}Nenhum${colors.reset}`;

  const cor = getRaridadeCor(equipamento.raridade);
  return `${cor}${equipamento.nome}${colors.reset} (DEF:${colors.green}${
    equipamento.defesa
  }${colors.reset} ATK:${colors.green}+${equipamento.atkBonus}${
    colors.reset
  } Set:${colors.cyan}${equipamento.set || "Nenhum"}${colors.reset})`;
}

// --- Exibe status do jogador (agora assíncrono) ---
export async function status(jogador) {
  console.log(`\n${colors.bright}--- STATUS ---${colors.reset}`);
  console.log(`${colors.cyan}Nome:${colors.reset} ${jogador.nome}`);
  console.log(
    `${colors.cyan}Raça:${colors.reset} ${jogador.raca} | ${colors.cyan}Class:${colors.reset} ${jogador.classe}`
  );
  console.log(
    `${colors.cyan}Nível:${colors.reset} ${jogador.nivel} | ${colors.green}XP:${
      colors.reset
    } ${jogador.xp}/${xpParaProximoNivel(jogador)}`
  );
  console.log(
    `${colors.green}HP:${colors.reset} ${jogador.hp}/${jogador.hpMax}`
  );
  console.log(
    `${colors.red}Atk atual:${colors.reset} ${calcularAtaque(jogador)}`
  );
  console.log(`${colors.yellow}Ouro:${colors.reset} ${jogador.ouro}`);
  console.log(
    `${colors.magenta}Consumíveis:${colors.reset} ${formatarItens(
      jogador.itens
    )}`
  );
  console.log(
    `${colors.magenta}Inventário:${colors.reset} ${formatarItens(
      jogador.inventario
    )}`
  );

  console.log(`\n${colors.bright}Equipamentos:${colors.reset}`);
  for (const slot of ARMOR_SLOTS) {
    console.log(
      ` - ${slot.toUpperCase()}: ${exibirEquipamento(
        slot,
        jogador.equipamentos[slot]
      )}`
    );
  }

  console.log(
    `${colors.blue}Defesa total:${colors.reset} ${calcularDefesaTotal(jogador)}`
  );

  const arma = jogador.armaEquipada
    ? `${getRaridadeCor(jogador.armaEquipada.raridade)}${
        jogador.armaEquipada.nome
      }${colors.reset}`
    : `${colors.gray}Nenhuma${colors.reset}`;
  console.log(`${colors.red}Arma equipada:${colors.reset} ${arma}`);

  // Espera a entrada do usuário de forma assíncrona
  const opcao = await new Promise((resolve) => {
    console.log(
      `\n${colors.bright}[M] Gerenciar Equipamentos/Armas${colors.reset} ou ${colors.bright}${colors.white}Enter para sair:${colors.reset} `
    );
    process.stdin.once("data", (key) => {
      resolve(key.toString().trim());
    });
  });

  if (opcao.toLowerCase() === "m") {
    await gerenciarEquipamentos(jogador);
  }

  console.log(`${colors.dim}---------------${colors.reset}\n`);
}
