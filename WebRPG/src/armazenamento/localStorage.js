import { serializarSave, desserializarSave } from "@engine/save/index.js";

const CHAVE_SAVE = "webrpg_save";

export function salvarNoNavegador(jogador) {
  localStorage.setItem(CHAVE_SAVE, serializarSave(jogador));
}

export function carregarDoNavegador() {
  const texto = localStorage.getItem(CHAVE_SAVE);
  if (!texto) {
    return { valido: false, jogador: null, erro: null };
  }
  return desserializarSave(texto);
}

export function existeSaveNoNavegador() {
  return localStorage.getItem(CHAVE_SAVE) !== null;
}

export function exportarSave(jogador) {
  const blob = new Blob([serializarSave(jogador)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `the-lost-world-save-${jogador.nome}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

export function importarSave(textoArquivo) {
  return desserializarSave(textoArquivo);
}
