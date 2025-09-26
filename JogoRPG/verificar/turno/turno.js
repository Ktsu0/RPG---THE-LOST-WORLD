// import { jogadaMasmorra } from "./../../masmorra/jogadaMasmorra.js";
// import { menuPrincipal } from "./../../menuPrincipal/menuPrincipal.js";

// let masmorraRodando = false;

// export function processarTurno(jogador) {
//   if (jogador.masmorraAtual) {
//     // Evita chamar a masmorra várias vezes
//     if (!masmorraRodando) {
//       masmorraRodando = true;

//       // Chama a masmorra, com callback ao sair
//       jogadaMasmorra(jogador, () => {
//         masmorraRodando = false; // reseta flag
//         menuPrincipal(jogador); // volta para o menu
//       });
//     }
//   } else {
//     // Se não estiver em masmorra, mostra o menu principal
//     return menuPrincipal(jogador);
//   }
// }
