import { calcularDefesaTotal } from "./../../ataqueJogador/calcular/calcularDef.js";
import { rand, colors } from "./../../../utilitarios.js";

export function calcularDanoInimigo(inimigo, jogador) {
  let danoBase = Math.max(
    1,
    inimigo.atk + rand(0, 3) - Math.floor(calcularDefesaTotal(jogador) / 5)
  );

  let dano = danoBase;

  // ------------------------
  // ⚔️ STATUS DO INIMIGO
  // ------------------------
  if (inimigo.status && inimigo.status.length > 0) {
    for (let efeito of inimigo.status) {
      switch (efeito.tipo) {
        case "esquiva":
          // não altera dano, mas impede ataques recebidos (já tratado fora)
          break;

        case "invulneravel":
          console.log(
            `${colors.cyan}${inimigo.nome} está invulnerável e ignora danos físicos!${colors.reset}`
          );
          return 0;

        case "petrificado":
          dano = Math.floor(dano * 0.5);
          console.log(
            `${colors.gray}${inimigo.nome} está petrificado, seu ataque é reduzido.${colors.reset}`
          );
          break;

        case "dano_extra":
          dano = Math.floor(dano * 1.5);
          console.log(
            `${colors.red}${inimigo.nome} está furioso e causa mais dano!${colors.reset}`
          );
          break;

        case "contra_ataque":
          // Ele não ataca agora, só reage se for atingido
          console.log(
            `${colors.yellow}${inimigo.nome} espera para contra-atacar...${colors.reset}`
          );
          return 0;

        default:
          break;
      }
    }
  }

  // ------------------------
  // 🛡️ DEFESAS DO JOGADOR
  // ------------------------

  // Esquiva do jogador
  let esquivaTotal =
    (jogador.bonusClasse?.esquiva || 0) +
    (jogador.armaEquipada?.efeito?.tipo === "esquiva"
      ? jogador.armaEquipada.efeito.chance
      : 0) +
    (jogador.bonusEsquiva || 0);

  if (rand(1, 100) <= esquivaTotal) {
    console.log(
      `${colors.green}💨 Você esquivou do ataque inimigo!${colors.reset}`
    );
    return 0;
  }

  // Bloqueio do jogador
  let chanceBloqueio =
    (jogador.bonusClasse?.bloqueioChance || 0) +
    (jogador.armaEquipada?.efeito?.tipo === "bloqueio"
      ? jogador.armaEquipada.efeito.chance
      : 0) +
    (jogador.bonusBloqueio || 0);

  if (rand(1, 100) <= chanceBloqueio) {
    console.log(
      `${colors.blue}🛡 Você bloqueou o ataque inimigo!${colors.reset}`
    );
    return 0;
  }

  return dano;
}
