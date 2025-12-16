// A função precisa ser importada para o seu arquivo de batalha
import { rand, colors } from "../../../utilitarios.js";
import { danoDoJogador } from "../../../batalha/ataqueJogador/calcular/danoJogador.js";

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
          `\n🩸 ${colors.bright}Você aplicou um sangramento em ${inimigo.nome} com sua ${arma.nome}!${colors.reset}`
        );
        if (!inimigo.status) inimigo.status = [];
        inimigo.status.push({
          tipo: "sangramento",
          duracao: arma.efeito.duracao,
          dano: arma.efeito.danoPorTurno,
        });
        break;
      case "roubo_de_vida":
        const danoCausado = jogador.ataque + (jogador.ataqueFinal || 0);
        const vidaRoubada = Math.floor(danoCausado * arma.efeito.percentual);
        jogador.hp = Math.min(jogador.hp + vidaRoubada, jogador.hpMaxFinal);
        console.log(
          `\n❤️ ${colors.green}Você roubou ${vidaRoubada} de vida do inimigo com sua ${arma.nome}!${colors.reset}`
        );
        break;
      case "critico":
        // Este efeito é processado no cálculo de dano crítico
        console.log(
          `\n💥 ${colors.yellow}Sua ${arma.nome} aumenta sua chance de acerto crítico!${colors.reset}`
        );
        break;
      case "ataque_duplo":
        console.log(`\n⚔️ ${colors.bright}Sua ${arma.nome} permitiu um ataque extra!${colors.reset}`);
        // Chama a função de dano do jogador novamente para o ataque extra
        const danoExtra = danoDoJogador(jogador);
        inimigo.hp -= danoExtra;
        inimigo.hp = Math.max(0, inimigo.hp);
        console.log(
          `${colors.red}Você causou um dano extra de ${danoExtra} ao ${inimigo.nome}.${colors.reset}`
        );
        break;
      case "confusao":
        console.log(`\n😵 ${colors.magenta}Sua ${arma.nome} confundiu ${inimigo.nome}!${colors.reset}`);
        if (!inimigo.status) inimigo.status = [];
        inimigo.status.push({
          tipo: "confusao",
          duracao: arma.efeito.duracao,
        });
        break;
      case "congelamento":
        console.log(`\n❄️ ${colors.cyan}Você congelou ${inimigo.nome} com sua ${arma.nome}!${colors.reset}`);
        if (!inimigo.status) inimigo.status = [];
        inimigo.status.push({
          tipo: "congelamento",
          duracao: arma.efeito.duracao,
        });
        break;
      case "incendio":
        console.log(
          `\n🔥 ${colors.red}Você incendiou ${inimigo.nome} com sua ${arma.nome}!${colors.reset}`
        );
        if (!inimigo.status) inimigo.status = [];
        inimigo.status.push({
          tipo: "incendio",
          duracao: arma.efeito.duracao,
          dano: arma.efeito.danoPorTurno,
        });
        break;
      case "bloqueio":
      case "esquiva":
        // Estes efeitos são processados durante o ataque do inimigo
        break;
      default:
        break;
    }
  }
}

// Verifica se o jogador pode esquivar do ataque inimigo
export function verificarEsquivaArma(jogador) {
  const arma = jogador.armaEquipada;
  
  if (arma && arma.efeito && arma.efeito.tipo === "esquiva") {
    const chance = arma.efeito.chance || 0;
    if (rand(1, 100) <= chance) {
      console.log(
        `\n💨 ${colors.green}Sua ${arma.nome} permitiu que você esquivasse do ataque!${colors.reset}`
      );
      return true;
    }
  }
  return false;
}

// Verifica se o jogador pode bloquear o ataque inimigo
export function verificarBloqueioArma(jogador) {
  const arma = jogador.armaEquipada;
  
  if (arma && arma.efeito && arma.efeito.tipo === "bloqueio") {
    const chance = arma.efeito.chance || 0;
    if (rand(1, 100) <= chance) {
      console.log(
        `\n🛡️ ${colors.blue}Você bloqueou o ataque com sua ${arma.nome}!${colors.reset}`
      );
      return true;
    }
  }
  return false;
}

// Verifica se o inimigo está congelado e não pode atacar
export function verificarCongelamento(inimigo) {
  if (!inimigo.status) return false;
  
  const congelado = inimigo.status.some((s) => s.tipo === "congelamento");
  if (congelado) {
    console.log(
      `\n❄️ ${colors.cyan}${inimigo.nome} está congelado e não pode atacar!${colors.reset}`
    );
    return true;
  }
  return false;
}

// Verifica se o inimigo está confuso e ataca a si mesmo
export function verificarConfusao(inimigo) {
  if (!inimigo.status) return false;
  
  const confuso = inimigo.status.some((s) => s.tipo === "confusao");
  if (confuso) {
    const danoConfusao = Math.floor(inimigo.atk * 0.5); // 50% do ataque do inimigo
    inimigo.hp -= danoConfusao;
    inimigo.hp = Math.max(0, inimigo.hp);
    console.log(
      `\n😵 ${colors.magenta}${inimigo.nome} está confuso e atacou a si mesmo, causando ${danoConfusao} de dano!${colors.reset}`
    );
    return true;
  }
  return false;
}

export function aplicarStatusPorTurno(jogador, inimigo) {
  // Aplica o dano de status no inimigo
  if (inimigo.status) {
    inimigo.status = inimigo.status.filter((status) => {
      switch (status.tipo) {
        case "sangramento":
          inimigo.hp -= status.dano;
          status.duracao--;
          console.log(
            `\n🩸 ${colors.gray}${inimigo.nome} está sangrando e perdeu${colors.reset} ${colors.red}${status.dano} HP.${colors.reset}`
          );
          return status.duracao > 0;
        case "incendio":
          inimigo.hp -= status.dano;
          status.duracao--;
          console.log(
            `\n🔥 ${colors.gray}${inimigo.nome} está em chamas e perdeu${colors.reset} ${colors.red}${status.dano} HP.${colors.reset}`
          );
          return status.duracao > 0;
        case "confusao":
        case "congelamento":
          status.duracao--;
          if (status.duracao <= 0) {
            console.log(
              `\n${status.tipo === "confusao" ? "😵" : "❄️"} ${colors.gray}${inimigo.nome} não está mais ${status.tipo === "confusao" ? "confuso" : "congelado"}.${colors.reset}`
            );
          }
          return status.duracao > 0;
        default:
          return true;
      }
    });
  }

  // Aplica o dano de status no jogador (se houver)
  if (jogador.status) {
    jogador.status = jogador.status.filter((status) => {
      switch (status.tipo) {
        case "envenenamento":
          jogador.hp -= status.dano;
          status.duracao--;
          console.log(
            `\n🤢 ${colors.gray}Você está envenenado e perdeu${colors.reset} ${colors.red}${status.dano} HP.${colors.reset}`
          );
          return status.duracao > 0;
        default:
          return true;
      }
    });
  }
}
