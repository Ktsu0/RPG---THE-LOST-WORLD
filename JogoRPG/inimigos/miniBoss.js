import { rand } from "./../utilitarios.js";
import { minibosses } from "./createMiniBoss.js";
import promptSync from "prompt-sync";
const prompt = promptSync();

// --- Cria Mini-Boss ---
export function criarMiniBoss(tipo, nivelJogador) {
  const lista = minibosses[tipo] || minibosses.comum;
  const m = lista[rand(0, lista.length - 1)];

  // HP ajustado pelo nível e tipo
  const hpMultiplicador = tipo === "lendario" || tipo === "raro" ? 12 : 8;
  const hp =
    m.baseHp + Math.floor(nivelJogador * hpMultiplicador) + rand(-15, 15);

  // ATK ajustado pelo nível e tipo
  const atkMultiplicador =
    tipo === "lendario" ? 2.5 : tipo === "raro" ? 2.2 : 1.5;
  const atk =
    m.baseAtk + Math.floor(nivelJogador * atkMultiplicador) + rand(0, 4);

  // XP e ouro baseados no HP
  const xp = Math.max(25, Math.round(hp / 2));
  const ouro = Math.max(15, Math.round(hp / 1.6));

  return { nome: m.nome, hp, atk, xp, ouro };
}
