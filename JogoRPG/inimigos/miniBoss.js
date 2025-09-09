import { rand } from "./../utilitarios.js";
import promptSync from "prompt-sync";
const prompt = promptSync();

export function criarMiniBoss(tipo, nivelJogador) {
  const minibosses = {
    comum: [
      { nome: "Capitão Sombrio", baseHp: 120, baseAtk: 12 },
      { nome: "Sentinela Perdido", baseHp: 130, baseAtk: 15 },
    ],
    raro: [
      { nome: "Guardião de Ruínas", baseHp: 160, baseAtk: 18 },
      { nome: "Assassino das Sombras", baseHp: 170, baseAtk: 20 },
    ],
    lendario: [
      { nome: "Feiticeiro Caído", baseHp: 220, baseAtk: 25 },
      { nome: "Dragão Corrompido", baseHp: 250, baseAtk: 28 },
    ],
  };

  const lista = minibosses[tipo] || minibosses.comum;
  const m = lista[rand(0, lista.length - 1)];
  const hp =
    m.baseHp +
    Math.floor(
      nivelJogador * (tipo === "lendario" ? 12 : tipo === "raro" ? 12 : 8)
    ) +
    rand(-15, 15);
  const atk =
    m.baseAtk +
    Math.floor(
      nivelJogador * (tipo === "lendario" ? 2.5 : tipo === "raro" ? 2.2 : 1.5)
    ) +
    rand(0, 4);
  const xp = Math.max(25, Math.round(hp / 2.0));
  const ouro = Math.max(15, Math.round(hp / 1.6));

  return { nome: m.nome, hp, atk, xp, ouro };
}
