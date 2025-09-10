// A função precisa ser importada para o seu arquivo de batalha
import { rand } from "./../utilitarios.js";

export function aplicarEfeitoArma(jogador, inimigo) {
  const arma = jogador.armaEquipada;

  if (arma && arma.efeito) {
    // Verifica se a habilidade tem uma chance de ativação
    const chance = arma.efeito.chance;

    if (chance && rand(1, 100) > chance) {
      return; // A habilidade não ativou
    }

    switch (arma.efeito.tipo) {
      case "sangramento":
        console.log(
          `\n🩸 Você aplicou um sangramento em ${inimigo.nome} com sua ${arma.nome}!`
        );
        inimigo.status.push({
          tipo: "sangramento",
          duracao: arma.efeito.duracao,
          dano: arma.efeito.danoPorTurno,
        });
        break;
      case "roubo_de_vida":
        const danoCausado = jogador.ataque + jogador.ataqueFinal; // Assumindo que você tem a função que calcula o dano final
        const vidaRoubada = Math.floor(danoCausado * arma.efeito.percentual);
        jogador.hp = Math.min(jogador.hp + vidaRoubada, jogador.hpMaxFinal);
        console.log(
          `\n❤️ Você roubou ${vidaRoubada} de vida do inimigo com sua ${arma.nome}!`
        );
        break;
      case "critico":
        console.log(
          `\n💥 Sua ${arma.nome} aumenta sua chance de acerto crítico!`
        );
        break;
      case "ataque_duplo":
        console.log(`\n⚔️ Sua ${arma.nome} permitiu um ataque extra!`);
        // Chama a função de dano do jogador novamente para o ataque extra
        const danoExtra = danoDoJogador(jogador);
        inimigo.hp -= danoExtra;
        inimigo.hp = Math.max(0, inimigo.hp);
        console.log(
          `Você causou um dano extra de ${danoExtra} ao ${inimigo.nome}.`
        );
        break;
      case "confusao":
        console.log(`\n😵 Sua ${arma.nome} confundiu ${inimigo.nome}!`);
        inimigo.status.push({
          tipo: "confusao",
          duracao: arma.efeito.duracao,
        });
        break;
      case "congelamento":
        console.log(`\n❄️ Você congelou ${inimigo.nome} com sua ${arma.nome}!`);
        inimigo.status.push({
          tipo: "congelamento",
          duracao: arma.efeito.duracao,
        });
        break;
      case "incendio":
        console.log(
          `\n🔥 Você incendiou ${inimigo.nome} com sua ${arma.nome}!`
        );
        inimigo.status.push({
          tipo: "incendio",
          duracao: arma.efeito.duracao,
          dano: arma.efeito.danoPorTurno,
        });
        break;
      case "bloqueio":
      case "esquiva":
        break;
      default:
        break;
    }
  }
}

export function aplicarStatusPorTurno(inimigo) {
  // Aplica o dano de status
  inimigo.status = (inimigo.status || []).filter((status) => {
    switch (status.tipo) {
      case "sangramento":
        inimigo.hp -= status.dano;
        status.duracao--;
        console.log(
          `\n🩸 ${inimigo.nome} está sangrando e perdeu ${status.dano} HP.`
        );
        return status.duracao > 0;
      case "incendio":
        inimigo.hp -= status.dano;
        status.duracao--;
        console.log(
          `\n🔥 ${inimigo.nome} está em chamas e perdeu ${status.dano} HP.`
        );
        return status.duracao > 0;
      case "confusao":
      case "congelamento":
        status.duracao--;
        return status.duracao > 0;
      default:
        return true;
    }
  });
}
