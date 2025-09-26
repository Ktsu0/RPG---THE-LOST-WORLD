import { calcularDefesaTotal } from "./../../ataqueJogador/calcular/calcularDef.js";
import { rand, colors } from "./../../../utilitarios.js";

export function calcularDanoInimigo(inimigo, jogador) {
  // ------------------------
  // 1️⃣ Cálculo base de dano
  // ------------------------
  let danoBase = Math.max(
    1,
    inimigo.atk + rand(0, 3) - Math.floor(calcularDefesaTotal(jogador) / 5)
  );

  let danoFinal = danoBase;

  // ------------------------
  // 2️⃣ Modificadores de status do inimigo
  // ------------------------
  if (inimigo.status && inimigo.status.length > 0) {
    inimigo.status.forEach((efeito) => {
      switch (efeito.tipo) {
        case "petrificado":
          danoFinal = Math.floor(danoFinal * 0.5);
          console.log(
            `${colors.gray}${inimigo.nome} está petrificado, causando menos dano.${colors.reset}`
          );
          break;

        case "dano_extra":
          danoFinal = Math.floor(danoFinal * 1.5);
          console.log(
            `${colors.red}${inimigo.nome} está furioso e causa mais dano!${colors.reset}`
          );
          break;

        // invulnerável e contra_ataque não afetam o dano do próprio inimigo
        default:
          break;
      }
    });
  }

  // ------------------------
  // 3️⃣ Defesa do jogador
  // ------------------------
  // Esquiva do jogador
  const esquivaTotal =
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
  const chanceBloqueio =
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
  return danoFinal;
}
