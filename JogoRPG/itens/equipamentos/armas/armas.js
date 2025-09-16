import { colors } from "./../../../utilitarios.js";

import promptSync from "prompt-sync";
const prompt = promptSync();

export function gerenciarArmas(jogador) {
  console.log(`\n${colors.bright}=== ARMAS ===${colors.reset}`);

  const armaAtual = jogador.armaEquipada
    ? `${colors.green}${jogador.armaEquipada.nome}${colors.reset}`
    : `${colors.yellow}Nenhuma${colors.reset}`;
  console.log(`Arma equipada: ${armaAtual}`);

  const armasDisponiveis = jogador.inventario.filter(
    (i) => i.slot === "weapon"
  );

  if (armasDisponiveis.length === 0) {
    console.log(
      `${colors.red}Nenhuma arma disponível no inventário.${colors.reset}`
    );
    return;
  }

  armasDisponiveis.forEach((arma, index) => {
    console.log(
      `[${colors.green}${index + 1}${colors.reset}] ${colors.magenta}${
        arma.nome
      }${colors.reset} (+${arma.atk} ATK, Efeito: ${arma.efeito || "Nenhum"})`
    );
  });
  console.log(`[${colors.gray}0${colors.reset}] Voltar`);

  const idxRaw = prompt("Escolha a arma para equipar: ");
  const idx = parseInt(idxRaw);

  if (isNaN(idx) || idx < 0 || idx > armasDisponiveis.length) {
    console.log(`${colors.red}Escolha inválida.${colors.reset}`);
    return;
  }
  if (idx === 0) return;

  const armaEscolhida = armasDisponiveis[idx - 1];

  // Guarda arma atual no inventário
  if (jogador.armaEquipada) {
    jogador.inventario.push(jogador.armaEquipada);
  }

  // Equipa a nova arma
  jogador.armaEquipada = armaEscolhida;

  // Remove do inventário
  jogador.inventario = jogador.inventario.filter((i) => i !== armaEscolhida);

  console.log(
    `✅ ${colors.green}Equipou:${colors.reset} ${colors.magenta}${armaEscolhida.nome}${colors.reset}`
  );
}
