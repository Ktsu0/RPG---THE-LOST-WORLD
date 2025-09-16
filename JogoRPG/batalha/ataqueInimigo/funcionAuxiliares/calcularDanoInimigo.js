import { calcularDefesaTotal } from "./../../ataqueJogador/calcular/calcularDef.js";
import { rand, colors } from "./../../../utilitarios.js";

export function calcularDanoInimigo(inimigo, jogador) {
  let dano = Math.max(
    1,
    inimigo.atk + rand(0, 3) - Math.floor(calcularDefesaTotal(jogador) / 5)
  );

  // Esquiva
  let esquivaTotal =
    (jogador.bonusClasse && jogador.bonusClasse.esquiva
      ? jogador.bonusClasse.esquiva
      : 0) +
    (jogador.armaEquipada &&
    jogador.armaEquipada.efeito &&
    jogador.armaEquipada.efeito.tipo === "esquiva"
      ? jogador.armaEquipada.efeito.chance
      : 0) +
    (jogador.bonusEsquiva || 0);

  // Bloqueio
  let chanceBloqueio =
    (jogador.bonusClasse && jogador.bonusClasse.bloqueioChance
      ? jogador.bonusClasse.bloqueioChance
      : 0) +
    (jogador.armaEquipada &&
    jogador.armaEquipada.efeito &&
    jogador.armaEquipada.efeito.tipo === "bloqueio"
      ? jogador.armaEquipada.efeito.chance
      : 0) +
    (jogador.bonusBloqueio || 0);

  if (dano > 0 && rand(1, 100) <= chanceBloqueio) {
    console.log(
      `${colors.blue}🛡 Você bloqueou o ataque inimigo!${colors.reset}`
    );
    dano = 0;
  }

  return dano;
}
