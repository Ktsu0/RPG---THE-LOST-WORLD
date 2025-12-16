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

  // Sistema de peso para missões especiais
  // Missões especiais (arena_infinita, ondas) têm peso menor
  const missoesComPeso = [];
  
  missoesDisponiveis.forEach((missao) => {
    // Missões especiais têm peso 1 (raras)
    // Missões normais têm peso 5 (comuns)
    const peso = missao.tipoBatalha ? 1 : 5;
    
    // Adiciona a missão múltiplas vezes baseado no peso
    for (let i = 0; i < peso; i++) {
      missoesComPeso.push(missao);
    }
  });

  const missao = missoesComPeso[rand(0, missoesComPeso.length - 1)];
  return missao; // Retorna a missão escolhida
}
