import { rand } from "./../utilitarios.js";
import { templates } from "./createMostro.js";

// --- Funções de criação de inimigos ---
export function criarInimigo(jogador) {
  // Filtra inimigos de acordo com o nível do jogador
  const inimigosDisponiveis = templates.filter(
    (e) => jogador.nivel >= e.minNivel
  );
  if (inimigosDisponiveis.length === 0) {
    console.log("Nenhum inimigo disponível para o seu nível.");
    return null;
  }

  // Seleciona um inimigo aleatório
  const t = inimigosDisponiveis[rand(0, inimigosDisponiveis.length - 1)];

  const hp = Math.round(
    t.baseHp + Math.floor(jogador.nivel * t.escalaHp) + rand(-5, 5)
  );
  const atk = Math.round(
    t.baseAtk + Math.floor(jogador.nivel * t.escalaAtk) + rand(-1, 2)
  );

  return {
    nome: t.nome,
    hp,
    atk,
    hpMax: hp,
    xp: t.xp,
    ouro: t.ouro,
    habilidade: t.habilidade,
    status: [],
    turno: 0,
  };
}
