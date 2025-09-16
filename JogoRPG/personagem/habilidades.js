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

export function curarDruida(jogador) {
  if (jogador.classe !== "Druida" || jogador.hp <= 0) return;
  const chance = Math.random();
  if (chance < 0.5) {
    const cura = Math.floor(jogador.hpMax * 0.05);
    jogador.hp = Math.min(jogador.hp + cura, jogador.hpMax);
    console.log(
      `\n🌿 Sua cura passiva de Druida restaurou ${colors.green}${cura}${colors.reset} de HP.`
    );
  } else {
    console.log(`\n🌿 A cura passiva do Druida não ativou neste turno.`);
  }
}
