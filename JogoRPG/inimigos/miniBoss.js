import { rand } from "./../utilitarios.js";
import promptSync from "prompt-sync";
const prompt = promptSync();

export function criarMiniBoss(tipo, nivelJogador) {
  const minibosses = {
    comum: [
      { nome: "Capitão Sombrio", baseHp: 100, baseAtk: 10 },
      { nome: "Sentinela Perdido", baseHp: 110, baseAtk: 12 },
    ],
    raro: [
      { nome: "Guardião de Ruínas", baseHp: 140, baseAtk: 16 },
      { nome: "Assassino das Sombras", baseHp: 150, baseAtk: 18 },
    ],
    lendario: [
      { nome: "Feiticeiro Caído", baseHp: 200, baseAtk: 22 },
      { nome: "Dragão Corrompido", baseHp: 220, baseAtk: 24 },
    ],
  };

  const lista = minibosses[tipo] || minibosses.comum;
  const m = lista[rand(0, lista.length - 1)];
  const hp =
    m.baseHp +
    Math.floor(
      nivelJogador * (tipo === "lendario" ? 12 : tipo === "raro" ? 9 : 6)
    ) +
    rand(-15, 15);
  const atk =
    m.baseAtk +
    Math.floor(
      nivelJogador * (tipo === "lendario" ? 2.5 : tipo === "raro" ? 1.8 : 1.2)
    ) +
    rand(0, 4);
  const xp = Math.max(25, Math.round(hp / 2.0));
  const ouro = Math.max(15, Math.round(hp / 1.6));

  return { nome: m.nome, hp, atk, xp, ouro };
}
