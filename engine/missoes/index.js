import { rand } from "@engine/combate/aleatorio.js";
import { checarLevelUp } from "@engine/personagem/experiencia.js";
import { missoesDisponiveis } from "./catalogo.js";

export function filtroMissao(jogador) {
  const disponiveis = missoesDisponiveis.filter((missao) => jogador.nivel >= missao.nivelMinimo);
  if (disponiveis.length === 0) return null;

  const comPeso = [];
  for (const missao of disponiveis) {
    const peso = missao.tipoBatalha ? 1 : 5;
    for (let i = 0; i < peso; i++) comPeso.push(missao);
  }
  return comPeso[rand(0, comPeso.length - 1)];
}

export function aplicarPenalidade(tipo, jogador) {
  if (tipo === "ouro") {
    const perda = rand(15, 100);
    jogador.ouro = Math.max(0, jogador.ouro - perda);
    return { tipo: "ouro", valor: perda, mensagem: `Você perdeu ${perda} de ouro.` };
  }

  if (tipo === "hp") {
    const perda = Math.floor(jogador.hp * 0.2);
    jogador.hp = Math.max(1, jogador.hp - perda);
    return { tipo: "hp", valor: perda, mensagem: `Você perdeu ${perda} de HP.` };
  }

  // tipo "item" só age se jogador.setCompleto for truthy — nada no jogo popula esse
  // campo hoje, então esta branch nunca dispara na prática (fiel ao console, ver
  // "Correções e decisões documentadas" #3).
  if (tipo === "item" && jogador.setCompleto) {
    if (rand(1, 100) <= 2) {
      return { tipo: "item", valor: 1, mensagem: "Você perdeu uma peça do seu equipamento." };
    }
    return { tipo: "nenhuma", valor: 0, mensagem: "Por sorte, não perdeu nenhum item." };
  }

  return { tipo: "nenhuma", valor: 0, mensagem: "Sem penalidades graves desta vez." };
}

export function resolverResultadoMissao(jogador, missao) {
  const resultado = rand(1, 100);

  if (resultado > missao.chanceSucesso) {
    return { sucesso: false, penalidade: aplicarPenalidade(missao.falha.tipo, jogador) };
  }

  const xpGanho = Math.round(missao.xp(jogador.nivel));
  const ouroGanho = Math.round(missao.ouro(jogador.nivel));
  jogador.xp += xpGanho;
  jogador.ouro += ouroGanho;

  let itemGanho = null;
  if (missao.item && typeof missao.item === "object") {
    const raridade = (missao.item.raridade || "comum").toLowerCase();
    const baseChance = raridade === "comum" ? 80 : raridade === "raro" ? 50 : raridade === "lendario" ? 30 : 0;
    const bonusClasse = jogador.classe === "Assassino" ? 10 : 0;
    const chanceFinal = Math.min(100, baseChance + bonusClasse);
    if (rand(1, 100) <= chanceFinal) {
      jogador.inventario.push(missao.item.nome);
      itemGanho = missao.item.nome;
    }
  } else if (missao.item && typeof missao.item === "string") {
    jogador.inventario.push(missao.item);
    itemGanho = missao.item;
  }

  const pocaoGanha = rand(1, 100) <= 30;
  if (pocaoGanha) jogador.itens.push("Poção de Cura");

  const missaoExtraApareceu = rand(1, 100) <= missao.chanceMissaoExtra;

  const eventosLevelUp = checarLevelUp(jogador);

  return { sucesso: true, xpGanho, ouroGanho, itemGanho, pocaoGanha, missaoExtraApareceu, eventosLevelUp };
}
