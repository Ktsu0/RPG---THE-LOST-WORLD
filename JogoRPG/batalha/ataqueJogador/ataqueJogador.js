import {
  aplicarFuria,
  criarEsqueleto,
  processarCuraXama,
} from "./../../personagem/habilidades.js";
import { colors, rand } from "./../../utilitarios.js";
import { danoDoJogador } from "./calcular/danoJogador.js";
import { processarInvulneravel } from "./../ataqueInimigo/funcionAuxiliares/invunerabilidade.js";
import { aplicarEfeitoArma } from "./../../itens/equipamentos/efeitos/armasEfeitos.js";
import { processarEnvenenamento } from "./../ataqueInimigo/funcionAuxiliares/envenenamento.js";
import { usarPocao } from "./../../itens/pocaoCura.js";
import { calcularDefesaFinal } from "./calcular/defesaInimigo.js";
import { processarParalisia } from "./../ataqueInimigo/funcionAuxiliares/teia.js";
import { processarDanoExtra } from "./../ataqueInimigo/funcionAuxiliares/danoExtra.js";
import { processarBuffDefesa } from "../ataqueInimigo/funcionAuxiliares/buffDefesa.js";

export async function ataqueJogador(
  inimigo,
  jogador,
  rodadas,
  esqueletosInvocados,
  escolha
) {
  if (processarParalisia(jogador)) {
    return "continua"; // Pula o turno se estiver paralisado
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
      let danoBruto = danoDoJogador(jogador);
      let defesaEfetiva = calcularDefesaFinal(inimigo);
      let danoFinal = Math.max(1, danoBruto - defesaEfetiva);
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
      // ESQUIVA DO INIMIGO (Verificação de STATUS ativo)
      // ---------------------
      if (inimigo.habilidade === "esquiva" && rand(1, 100) <= 15) {
        console.log(
          `\n💨 ${inimigo.nome} reagiu rapidamente e esquivou do seu ataque!`
        );
        return "continua";
      }

      // ---------------------
      // INVULNERÁVEL
      // ---------------------

      if (inimigo.status.some((s) => s.tipo === "invulneravel")) {
        console.log(
          `${colors.cyan}👻 ${inimigo.nome} está etéreo e não sofreu dano!${colors.reset}`
        );
        processarInvulneravel(inimigo);
        return "continua";
      }
      // 1. Verifica se o status está presente
      if (
        inimigo.habilidade === "bloquear_e_contra_atacar" &&
        rand(1, 100) <= 10
      ) {
        const multiplicador = 0.9; // 90% do dano recebido
        // 2. Calcula o dano de contra-ataque
        const danoContraAtaque = Math.floor(danoFinal * multiplicador);
        // 3. Bloqueia o dano do jogador e notifica
        console.log(
          `\n🛡️ ${colors.bright}${inimigo.nome} ${colors.gray}bloqueou seu ataque e contra-atacou!${colors.reset}`
        );

        // 4. Aplica o dano ao jogador
        jogador.hp = Math.max(0, jogador.hp - danoContraAtaque);

        console.log(
          `🗡️ Você recebeu ${colors.red}${danoContraAtaque}${colors.reset} de dano de contra-ataque!`
        );

        // 5. Retorna para pular a aplicação normal do danoFinal no inimigo
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
      if (inimigo.hp <= 0) {
        aplicarEfeitoArma(jogador, inimigo);
        return "continua";
      }
      if (inimigo.habilidade === "roubo_e_fuga" && rand(1, 100) <= 20) {
        if (jogador.ouro > 0) {
          const valor = Math.min(jogador.ouro, rand(20, 50));
          jogador.ouro -= valor;
          console.log(`\n💰 ${inimigo.nome} roubou ${valor} de ouro e fugiu!`);
          return "fuga";
        } else {
          console.log(
            `\n💰 ${inimigo.nome} tentou roubar, mas você não tinha ouro! Inimigo não fugiu.`
          );
        }
      }
      aplicarEfeitoArma(jogador, inimigo);
      processarEnvenenamento(jogador);
      processarDanoExtra(inimigo);
      processarBuffDefesa(inimigo);
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
