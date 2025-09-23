import { checarLevelUp } from "./../personagem/experiencia.js";
import { colors, rand } from "./../utilitarios.js";
import { fazerMissao } from "./missoes.js";
import { aplicarPenalidade } from "./penalidade.js";

export function resultadoMissao(jogador, missao) {
  // 🎲 Resultado da missão
  const resultado = rand(1, 100);

  if (resultado <= missao.chanceSucesso) {
    console.log(
      `${colors.green}✅ Missão completada com sucesso!${colors.reset}`
    );

    const xpReward = Math.round(missao.xp(jogador.nivel));
    const ouroReward = Math.round(missao.ouro(jogador.nivel));

    console.log(
      `${colors.cyan}✨ Você recebeu ${xpReward} XP e ${ouroReward} ouro${colors.reset}`
    );

    jogador.xp += xpReward;
    jogador.ouro += ouroReward;

    // Entregar item (com chance por raridade)
    if (missao.item && typeof missao.item === "object") {
      const raridade = (missao.item.raridade || "comum").toLowerCase();
      let baseChance = 0;
      if (raridade === "comum") baseChance = 80;
      else if (raridade === "raro") baseChance = 50;
      else if (raridade === "lendario") baseChance = 30;

      const bonusClasse = jogador.classe === "Assassino" ? 10 : 0;
      const chanceFinal = Math.min(100, baseChance + bonusClasse);

      const rollDrop = rand(1, 100);
      if (rollDrop <= chanceFinal) {
        jogador.inventario.push(missao.item.nome);
        console.log(
          `${colors.bright}${colors.white}🎁 Você obteve o item da missão: ${
            colors.bright
          }${colors.magenta}${
            missao.item.nome
          } (${missao.item.raridade.toUpperCase()})${colors.reset}`
        );
      } else {
        console.log(
          `${colors.gray}Você não conseguiu pegar o item especial da missão.${colors.reset}`
        );
      }
    } else if (missao.item && typeof missao.item === "string") {
      jogador.inventario.push(missao.item);
      console.log(
        `${colors.yellow}🎁 Você obteve o item: ${missao.item}${colors.reset}`
      );
    }

    // Chance extra de encontrar Poção de Cura
    if (rand(1, 100) <= 30) {
      jogador.itens.push("Poção de Cura");
      console.log(
        `${colors.green}🧪 Além disso, você encontrou uma Poção de Cura!${colors.reset}`
      );
    }

    // Chance de missão extra
    if (rand(1, 100) <= missao.chanceMissaoExtra) {
      console.log(
        `${colors.magenta}🔥 Uma missão extra apareceu! Continue sua aventura...${colors.reset}`
      );
      fazerMissao(jogador);
    }

    checarLevelUp(jogador);
  } else {
    console.log(`${colors.red}❌ Falhou na missão!${colors.reset}`);
    const mensagemPenalidade = aplicarPenalidade(missao.falha.tipo, jogador);
    console.log(mensagemPenalidade);
  }
}
