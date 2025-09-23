import { rand } from "./../utilitarios.js";
import { missoes } from "./createMissoes.js";

export function filtroMissao(jogador) {
  const missoesDisponiveis = missoes.filter(
    (missao) => jogador.nivel >= missao.nivelMinimo
  );

  if (missoesDisponiveis.length === 0) {
    console.log(
      "\n⚠ Não há missões disponíveis para o seu nível no momento. Tente explorar!"
    );
    return null; // Retorna null se não houver missões
  }

  const missao = missoesDisponiveis[rand(0, missoesDisponiveis.length - 1)];
  return missao; // Retorna a missão escolhida
}
