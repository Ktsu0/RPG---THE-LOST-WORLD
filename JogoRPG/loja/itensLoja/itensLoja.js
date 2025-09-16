// itensLoja.js

import { armasDisponiveis as armasOriginais } from "./armas.js";
import { consumiveis as consumiveisOriginais } from "./consumiveis.js";
import { criarItem, conjuntos } from "./armaduras.js";

// --- Contador global de IDs para garantir unicidade ---
let idCounter = 1;

// --- Monta lista unificada de armaduras ---
const armaduras = Object.entries(conjuntos).flatMap(([set, pecas]) =>
  pecas.map((p) => criarItem({ id: idCounter++, set, ...p }))
);

// --- Monta lista unificada de consumíveis ---
const consumiveis = consumiveisOriginais.map((c) =>
  criarItem({ id: idCounter++, ...c })
);

// --- Adiciona IDs únicos às armas ---
const armasDisponiveis = armasOriginais.map((a) => ({ ...a, id: idCounter++ }));

// --- Loja final ---
export const loja = [...armaduras, ...consumiveis, ...armasDisponiveis];
