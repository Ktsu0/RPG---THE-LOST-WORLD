import {
  aplicarFuria,
  criarEsqueleto,
} from "./../../personagem/habilidades.js";
import { colors, rand } from "./../../utilitarios.js";
import { danoDoJogador } from "./calcular/danoJogador.js";
import { processarInvulneravel } from "./../ataqueInimigo/funcionAuxiliares/invunerabilidade.js";
import { aplicarEfeitoArma } from "./../../itens/equipamentos/efeitos/armasEfeitos.js";
import { processarEnvenenamento } from "./../ataqueInimigo/funcionAuxiliares/envenenamento.js";
import { usarPocao } from "./../../itens/pocaoCura.js";

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

  // ---------------------
  // SWITCH DE ESCOLHA
  // ---------------------
  switch (escolha) {
    case "1": {
      // ATACAR
      // Necromante invoca esqueletos a cada 4 rodadas
      if (jogador.classe === "Necromante" && rodadas % 4 === 0) {
        let numEsqueletos = 1;
        const chance = rand(1, 100);
        if (chance <= 95) numEsqueletos = 1;
        else if (chance <= 98) numEsqueletos = 2;
        else if (chance <= 99) numEsqueletos = 3;
        else numEsqueletos = 4;

        console.log(
          `\n${colors.dim}💀 Você invocou ${numEsqueletos} esqueleto(s)!${colors.reset}`
        );
        for (let i = 0; i < numEsqueletos; i++) {
          esqueletosInvocados.push(criarEsqueleto(jogador));
        }
      }

      // Calcula dano do jogador
      let danoFinal = danoDoJogador(jogador);
      danoFinal = aplicarFuria(jogador, danoFinal);

      // Crítico
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

      // ---------------------
      // ESQUIVA DO INIMIGO
      // ---------------------
      if (inimigo.status.some((s) => s.tipo === "esquiva")) {
        console.log(`\n💨 O ${inimigo.nome} se esquivou do seu ataque!`);
        inimigo.status = inimigo.status
          .map((s) =>
            s.tipo === "esquiva" ? { ...s, duracao: s.duracao - 1 } : s
          )
          .filter((s) => s.duracao > 0);
        return "continua";
      }

      // ---------------------
      // INVULNERÁVEL
      // ---------------------
      processarInvulneravel(inimigo);
      if (inimigo.status.some((s) => s.tipo === "invulneravel")) {
        console.log(
          `${colors.cyan}👻 ${inimigo.nome} está etéreo e não sofreu dano!${colors.reset}`
        );
        return "continua";
      }

      // ---------------------
      // APLICAR DANO
      // ---------------------
      inimigo.hp -= danoFinal;
      inimigo.hp = Math.max(0, inimigo.hp);
      console.log(
        `Você causou ${colors.red}${danoFinal}${colors.reset} de dano ao ${inimigo.nome}.`
      );
      aplicarEfeitoArma(jogador, inimigo);

      // ---------------------
      // CONTRA-ATAQUE
      // ---------------------
      if (inimigo.status.some((s) => s.tipo === "contra_ataque")) {
        const contra = Math.floor(danoFinal / 2);
        jogador.hp = Math.max(0, jogador.hp - contra);
        console.log(
          `\n🗡️ ${inimigo.nome} contra-atacou e causou ${contra} de dano!`
        );

        inimigo.status = inimigo.status
          .map((s) =>
            s.tipo === "contra_ataque" ? { ...s, duracao: s.duracao - 1 } : s
          )
          .filter((s) => s.duracao > 0);
      }

      processarEnvenenamento(jogador);
      return "continua";
    }

    case "2": // POÇÃO
      await usarPocao(jogador);
      return "continua";

    case "3": // FUGA
      if (rand(1, 100) <= 60) return "fuga";
      console.log(`${colors.red}❌ Falha na fuga!${colors.reset}`);
      return "continua";

    default:
      return "invalido";
  }
}
