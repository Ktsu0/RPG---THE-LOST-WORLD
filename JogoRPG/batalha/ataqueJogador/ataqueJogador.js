import { aplicarEfeitoArma } from "../../itens/equipamentos/efeitos/armasEfeitos.js";
import { usarPocao } from "./../../itens/pocaoCura.js";
import { danoDoJogador } from "./calcular/danoJogador.js";
import {
  aplicarFuria,
  criarEsqueleto,
} from "./../../personagem/habilidades.js";
import { rand, colors } from "./../../utilitarios.js";

import promptSync from "prompt-sync";
const prompt = promptSync();

// --- ATAQUE DO JOGADOR ---
export function ataqueJogador(inimigo, jogador, rodadas, esqueletosInvocados) {
  if (jogador.stunned) {
    console.log(
      `${colors.yellow}Você está atordoado e não pode agir!${colors.reset}`
    );
    jogador.stunned = false;
    return "continua";
  }

  console.log(
    `${colors.red}[1] Atacar${colors.reset}  ${colors.blue}[2] Usar Poção${colors.reset}  ${colors.gray}[3] Fugir${colors.reset}`
  );
  const escolha = prompt("Escolha: ");

  if (escolha === "1") {
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
  } else if (escolha === "2") {
    usarPocao(jogador);
  } else if (escolha === "3") {
    if (rand(1, 100) <= 60) {
      console.log("🏃 Você conseguiu fugir!");
      return "fuga";
    } else {
      console.log(`${colors.red}❌ Falha na fuga!${colors.reset}`);
    }
  } else {
    console.log("Opção inválida.");
    return "invalido";
  }
}
