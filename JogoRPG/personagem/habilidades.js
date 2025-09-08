import { rand } from "./../utilitarios.js";

export function criarEsqueleto(jogador) {
  const hp = Math.floor(jogador.hpMax * 0.15) + rand(-2, 2);
  // Dano baseado no nível do jogador para maior consistência
  const atk = Math.floor(jogador.nivel * 1.5) + rand(1, 3);

  return {
    nome: "Esqueleto Invocado",
    hp: hp > 1 ? hp : 1,
    atk: atk > 1 ? atk : 1,
  };
}
