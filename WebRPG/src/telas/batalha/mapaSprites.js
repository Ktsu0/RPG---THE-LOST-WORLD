// Preenchido conforme o bestiário for baixado (ver Task 2 do plano da Fase 7) —
// cada entrada mapeia o nome exato de um inimigo (engine/torre/bosses.js,
// engine/masmorra/gerador.js, engine/geradores/inimigoTreino.js) para uma pasta
// existente em WebRPG/assets/personagens/.
//
// Só 4 arquétipos foram baixados (LuizMelo "Monsters Creatures Fantasy", CC0) pra
// cobrir 25 nomes de inimigos — nomes sem reuso tematicamente razoável ficam de
// fora do mapa e caem no SPRITE_PADRAO (orc), documentado como gap em CREDITS.md.
const MAPA_SPRITE_POR_NOME = {
  Orc: "orc",

  // Undead / cavaleiros sombrios -> esqueleto
  "Esqueleto Errante": "esqueleto",
  "Cavaleiro Caído": "esqueleto",
  "Lich Menor": "esqueleto",
  "Senhor dos Mortos": "esqueleto",
  "Cavaleiro Sombrio": "esqueleto",
  "Lorde do Caos": "esqueleto",

  // Humanoides pequenos/agressivos -> goblin
  "Zumbi Apodrecido": "goblin",
  "Imp Menor": "goblin",
  "Comandante Ígneo": "goblin",

  // Golem/cristal/elemental (criatura robusta) -> cogumelo
  "Golem de Cristal": "cogumelo",
  "Golem Titânico": "cogumelo",
  "Guardião de Cristal": "cogumelo",
  "Elemental de Cristal": "cogumelo",

  // Criaturas voadoras/aracnídeas -> olho-voador
  "Aranha da Cripta": "olho-voador",
  "Aranha Venenosa": "olho-voador",
  "Morcego Gigante": "olho-voador",

  // Fase 8: 4 arquétipos novos cobrindo 7 dos 9 nomes que faltavam.
  // "Hidra das Sombras" e "Dragão Negro" continuam sem arquétipo (nenhum pack
  // de dragão CC0/gratuito com animações completas foi encontrado) — caem no
  // SPRITE_PADRAO (orc), documentado em CREDITS.md.
  "Guardião de Pedra": "golem-pedra",
  "Sentinela de Ferro": "golem-pedra",
  "Mago Sombrio": "mago",
  "Lobo Alfa": "lobo",
  "Salamandra de Fogo": "elemental-fogo",
  "Escorpião de Magma": "elemental-fogo",
  "Senhor das Chamas": "elemental-fogo",
};

const SPRITE_PADRAO = "orc";

export function spriteParaInimigo(nomeInimigo) {
  return MAPA_SPRITE_POR_NOME[nomeInimigo] ?? SPRITE_PADRAO;
}
