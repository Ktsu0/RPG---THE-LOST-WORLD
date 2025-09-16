import { colors } from "./../utilitarios.js";

export function exibirStatusInicial(jogador) {
  console.clear();
  console.log(
    `${colors.bright}${colors.magenta}=== RPG - THE LOST WORLD ===${colors.reset}`
  );
  console.log(
    `\n${colors.bright}${colors.white}Bem-vindo, ${colors.magenta}${jogador.nome}!${colors.reset}\n${colors.bright}${colors.white}Sua missão: ficar forte e salvar a princesa da Torre.${colors.reset}\n`
  );
}
