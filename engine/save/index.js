const VERSAO_SAVE = 1;

export function criarSave(jogador) {
  return { versao: VERSAO_SAVE, jogador };
}

export function serializarSave(jogador) {
  return JSON.stringify(criarSave(jogador));
}

export function desserializarSave(texto) {
  let dados;
  try {
    dados = JSON.parse(texto);
  } catch (erro) {
    return { valido: false, jogador: null, erro: "Save corrompido (JSON inválido)." };
  }

  if (!dados || typeof dados !== "object" || !dados.jogador || typeof dados.jogador !== "object") {
    return { valido: false, jogador: null, erro: "Formato de save inválido." };
  }

  if (dados.versao !== VERSAO_SAVE) {
    return {
      valido: false,
      jogador: null,
      erro: `Versão de save incompatível (esperado ${VERSAO_SAVE}, recebido ${dados.versao}).`,
    };
  }

  return { valido: true, jogador: dados.jogador, erro: null };
}
