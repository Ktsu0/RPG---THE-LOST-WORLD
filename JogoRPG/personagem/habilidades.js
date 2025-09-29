import { rand, colors } from "./../utilitarios.js";

export function criarEsqueleto(jogador) {
  const hp = Math.floor(jogador.hpMax * 0.15) + rand(-2, 2);
  const atk = Math.floor(jogador.nivel * 1.5) + rand(1, 3);

  return {
    nome: "Esqueleto Invocado",
    hp: hp > 1 ? hp : 1,
    atk: atk > 1 ? atk : 1,
  };
}

// --- Aplica Fúria do Bárbaro ---
export function aplicarFuria(jogador, dano) {
  // Verifica se o jogador é Bárbaro e está com <= 40% de HP
  if (jogador.classe === "Bárbaro" && jogador.hp <= jogador.hpMax * 0.35) {
    console.log(
      `${colors.bright}${colors.red}🔥 Fúria do Bárbaro ativada!${colors.reset} Dano aumentado em 50%!`
    );
    return Math.floor(dano * 1.5);
  }
  // Caso contrário, retorna o dano normal
  return dano;
}

export function processarCuraXama(jogador) {
  if (jogador.classe !== "Xamã" || jogador.hp <= 0) return;

  // A chance de 50% é equivalente a rand(1, 100) <= 50, ou Math.random() < 0.5
  const chance = Math.random();

  if (chance < 0.5) {
    // 50% de chance
    const cura = Math.floor(jogador.hpMax * 0.05); // 5% do HP máximo

    const hpAnterior = jogador.hp;
    jogador.hp = Math.min(jogador.hp + cura, jogador.hpMax);

    const curaEfetiva = jogador.hp - hpAnterior;

    if (curaEfetiva > 0) {
      console.log(
        `\n🌿 Sua conexão Xamã restaurou ${colors.green}${curaEfetiva}${colors.reset} de HP!`
      );
    }
  } else {
    console.log(`\n🌿 A energia Xamã não ativou a cura neste turno.`);
  }
}
