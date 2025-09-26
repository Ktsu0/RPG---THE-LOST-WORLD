import { colors } from "./../../../utilitarios.js";

// A função agora é assíncrona
export async function gerenciarArmas(jogador) {
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
    const efeitoNome = arma.efeito ? arma.efeito.tipo : "Nenhum";
    console.log(
      `[${colors.green}${index + 1}${colors.reset}] ${colors.magenta}${
        arma.nome
      }${colors.reset} (ATK:${colors.green}+${arma.atk}${
        colors.reset
      }, Efeito: ${colors.magenta}${efeitoNome}${colors.reset})`
    );
  });
  console.log(`[${colors.gray}0${colors.reset}] Voltar`);

  // Remove o prompt-sync e espera pela entrada do usuário
  const idxRaw = await new Promise((resolve) => {
    process.stdin.once("data", (key) => {
      resolve(key.toString().trim());
    });
  });
  const idx = parseInt(idxRaw);

  if (isNaN(idx) || idx < 0 || idx > armasDisponiveis.length) {
    console.log(`${colors.red}Escolha inválida.${colors.reset}`);
    return;
  }
  if (idx === 0) return;

  const armaEscolhida = armasDisponiveis[idx - 1];

  // Guarda arma atual no inventário, se houver
  if (jogador.armaEquipada) {
    jogador.inventario.push(jogador.armaEquipada);
  }

  // Equipa a nova arma
  jogador.armaEquipada = armaEscolhida;

  // Remove do inventário (garantindo que apenas uma seja removida)
  const indexParaRemover = jogador.inventario.findIndex(
    (i) => i === armaEscolhida
  );
  if (indexParaRemover > -1) {
    jogador.inventario.splice(indexParaRemover, 1);
  }

  console.log(
    `✅ ${colors.green}Equipou:${colors.reset} ${colors.magenta}${armaEscolhida.nome}${colors.reset}`
  );
}
