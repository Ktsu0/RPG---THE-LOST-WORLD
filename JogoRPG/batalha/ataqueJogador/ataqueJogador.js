import { aplicarEfeitoArma } from "../../itens/equipamentos/efeitos/armasEfeitos.js";
import { usarPocao } from "./../../itens/pocaoCura.js";
import { danoDoJogador } from "./calcular/danoJogador.js";
import {
  aplicarFuria,
  criarEsqueleto,
} from "./../../personagem/habilidades.js";
import { rand, colors } from "./../../utilitarios.js";
import { processarEnvenenamento } from "./../ataqueInimigo/funcionAuxiliares/envenenamento.js";
import { processarInvulneravel } from "./../ataqueInimigo/funcionAuxiliares/invunerabilidade.js";

// --- ATAQUE DO JOGADOR ---
export async function ataqueJogador(
  inimigo,
  jogador,
  rodadas,
  esqueletosInvocados,
  escolha
) {
  if (jogador.stunned) {
    console.log(
      `${colors.yellow}Você está atordoado e não pode agir!${colors.reset}`
    );
    jogador.stunned = false;
    return "continua";
  }
  processarEnvenenamento(jogador);
  processarInvulneravel(inimigo);

  // Verifica se está invulnerável
  if (inimigo.status.some((s) => s.tipo === "invulneravel")) {
    console.log(
      `${colors.cyan}👻 ${inimigo.nome} está etéreo e não sofreu dano!${colors.reset}`
    );
    return "continua"; // pula ataque
  }

  switch (escolha) {
    case "1": {
      // Lógica de ataque
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

      let danoFinal = danoDoJogador(jogador);
      danoFinal = aplicarFuria(jogador, danoFinal);

      const bonusCriticoArma =
        jogador.armaEquipada?.efeito?.tipo === "critico"
          ? jogador.armaEquipada.efeito.chance
          : 0;

      const critChanceTotal =
        (jogador.bonusClasse?.critChance || 0) +
        (jogador.bonusRaca?.critChance || 0) +
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
      // Lógica de poção
      await usarPocao(jogador);
      return "continua";
    }
    case "3": {
      // Lógica de fuga
      if (rand(1, 100) <= 60) {
        return "fuga";
      } else {
        console.log(`${colors.red}❌ Falha na fuga!${colors.reset}`);
        return "continua";
      }
    }
    default: {
      return "invalido";
    }
  }
}
