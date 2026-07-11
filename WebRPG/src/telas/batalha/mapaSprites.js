// Preenchido conforme o bestiário for baixado (ver Task 2 do plano da Fase 7) —
// cada entrada mapeia o nome exato de um inimigo (engine/torre/bosses.js,
// engine/masmorra/gerador.js, engine/geradores/inimigoTreino.js) para uma pasta
// existente em WebRPG/assets/personagens/.
const MAPA_SPRITE_POR_NOME = {
  Orc: "orc",
};

const SPRITE_PADRAO = "orc";

export function spriteParaInimigo(nomeInimigo) {
  return MAPA_SPRITE_POR_NOME[nomeInimigo] ?? SPRITE_PADRAO;
}
