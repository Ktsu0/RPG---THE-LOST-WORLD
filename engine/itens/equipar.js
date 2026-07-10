const BONUS_POR_CONJUNTO = {
  Ferro: (jogador) => { jogador.bonusBloqueio += 15; },
  Ligeiro: (jogador) => { jogador.bonusEsquiva += 15; },
  Sombra: (jogador) => { jogador.bonusEsquiva += 10; jogador.bonusCritico += 10; },
  Dragão: (jogador) => { jogador.bonusHP += 10; jogador.bonusAtk += 10; },
};

export function aplicarBonusDeConjunto(jogador) {
  jogador.bonusEsquiva = 0;
  jogador.bonusCritico = 0;
  jogador.bonusBloqueio = 0;
  jogador.bonusHP = 0;
  jogador.bonusAtk = 0;

  const setsEquipados = {};
  for (const slot in jogador.equipamentos) {
    const item = jogador.equipamentos[slot];
    if (item && item.set) {
      setsEquipados[item.set] = (setsEquipados[item.set] || 0) + 1;
    }
  }

  for (const set in setsEquipados) {
    if (setsEquipados[set] === 5 && BONUS_POR_CONJUNTO[set]) {
      BONUS_POR_CONJUNTO[set](jogador);
    }
  }
}

export function equiparArmaduraNoSlot(jogador, armadura) {
  const itemAntigo = jogador.equipamentos[armadura.slot] || null;
  jogador.equipamentos[armadura.slot] = armadura;
  aplicarBonusDeConjunto(jogador);
  return { itemAntigo };
}

export function equiparArma(jogador, arma) {
  const itemAntigo = jogador.armaEquipada || null;
  jogador.armaEquipada = arma;
  return { itemAntigo };
}

export function compararAtributos(itemAtual, itemNovo) {
  const defesaAtual = itemAtual?.defesa || 0;
  const atkAtual = itemAtual?.atkBonus || 0;
  return {
    defesa: (itemNovo.defesa || 0) - defesaAtual,
    atkBonus: (itemNovo.atkBonus || 0) - atkAtual,
  };
}
