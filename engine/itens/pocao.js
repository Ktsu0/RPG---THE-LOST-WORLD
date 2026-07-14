import { rand } from "@engine/combate/aleatorio.js";

const NOME_POCAO = "Poção de Cura";

// A loja guarda a poção como objeto em jogador.inventario (fiel ao console);
// as missões premiam com a string "Poção de Cura" em jogador.itens (divergência
// da Fase 3 nunca reconciliada). Esta API é a única porta de entrada para
// contar/consumir poções e enxerga as duas contabilidades — de propósito, para
// que saves existentes continuem valendo sem migração.
export function contarPocoes(jogador) {
  const noInventario = (jogador.inventario ?? []).filter(
    (item) => typeof item === "object" && item !== null && item.nome === NOME_POCAO
  ).length;
  const emItens = (jogador.itens ?? []).filter((item) => item === NOME_POCAO).length;
  return noInventario + emItens;
}

export function consumirPocao(jogador) {
  const indiceEmItens = (jogador.itens ?? []).indexOf(NOME_POCAO);
  if (indiceEmItens !== -1) {
    jogador.itens.splice(indiceEmItens, 1);
    return true;
  }
  const indiceNoInventario = (jogador.inventario ?? []).findIndex(
    (item) => typeof item === "object" && item !== null && item.nome === NOME_POCAO
  );
  if (indiceNoInventario !== -1) {
    jogador.inventario.splice(indiceNoInventario, 1);
    return true;
  }
  return false;
}

export function usarPocaoDeCura(jogador) {
  if (!consumirPocao(jogador)) {
    return { usou: false, cura: 0 };
  }
  const curaMin = Math.floor(jogador.hpMax * 0.2);
  const curaMax = Math.floor(jogador.hpMax * 0.3);
  const cura = rand(curaMin, curaMax);
  jogador.hp = Math.min(jogador.hpMax, jogador.hp + cura);
  return { usou: true, cura };
}
