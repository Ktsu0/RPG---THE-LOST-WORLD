import { usarPocao } from "./../../itens/pocaoCura.js";
import { danoDoJogador } from "./calcular/danoJogador.js";
import { colors, rand } from "./../../utilitarios.js";
import {
  aplicarFuria,
  criarEsqueleto,
} from "./../../personagem/habilidades.js";
import { aplicarEfeitoArma } from "./../../itens/equipamentos/efeitos/armasEfeitos.js";

export async function ataqueJogadorOndas(
  inimigo,
  jogador,
  rodadas,
  esqueletosInvocados,
  escolha // Adicione este parâmetro
) {
  // Mantém a checagem de atordoamento
  if (jogador.stunned) {
    console.log(
      `${colors.yellow}Você está atordoado e não pode agir!${colors.reset}`
    );
    jogador.stunned = false;
    return "continua";
  }

  switch (escolha) {
    case "1": {
      // --- Necromante invoca esqueletos ---
      if (jogador.classe === "Necromante" && rodadas % 4 === 0) {
        let numEsqueletos = 1;
        const chance = rand(1, 100);
        if (chance <= 95) numEsqueletos = 1;
        else if (chance <= 98) numEsqueletos = 2;
        else if (chance <= 99) numEsqueletos = 3;
        else numEsqueletos = 4;

        console.log(
          `\n${colors.dim}💀 Você invocou ${numEsqueletos} esqueleto(s) para lutar ao seu lado!${colors.reset}`
        );

        for (let i = 0; i < numEsqueletos; i++) {
          esqueletosInvocados.push(criarEsqueleto(jogador));
        }
      }

      // --- Calcula dano ---
      let danoFinal = danoDoJogador(jogador);
      danoFinal = aplicarFuria(jogador, danoFinal);

      // --- Bônus crítico ---
      const bonusCriticoArma =
        jogador.armaEquipada &&
        jogador.armaEquipada.efeito &&
        jogador.armaEquipada.efeito.tipo === "critico"
          ? jogador.armaEquipada.efeito.chance
          : 0;

      const critChanceTotal =
        (jogador.bonusClasse && jogador.bonusClasse.critChance
          ? jogador.bonusClasse.critChance
          : 0) +
        (jogador.bonusRaca && jogador.bonusRaca.critChance
          ? jogador.bonusRaca.critChance
          : 0) +
        (jogador.bonusCritico || 0) +
        bonusCriticoArma;

      if (critChanceTotal > 0 && rand(1, 100) <= critChanceTotal) {
        console.log(
          `${colors.bright}💥 Golpe crítico! Dano dobrado!${colors.reset}`
        );
        danoFinal *= 2;
      }

      inimigo.hp -= danoFinal;
      inimigo.hp = Math.max(0, inimigo.hp);

      console.log(
        `Você causou ${colors.red}${danoFinal}${colors.reset} de dano ao ${inimigo.nome}.`
      );

      aplicarEfeitoArma(jogador, inimigo);
      return "continua";
    }
    case "2": {
      await usarPocao(jogador);
      return "continua";
    }
    default: {
      // Se a escolha não for 1 nem 2, é inválida.
      console.log("Opção inválida.");
      return "invalido";
    }
  }
}
