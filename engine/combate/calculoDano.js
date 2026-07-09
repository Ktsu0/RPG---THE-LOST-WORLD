import { rand } from "./aleatorio.js";

export function calcularAtaqueJogador(jogador) {
  let atk = jogador.ataque || 0;
  atk += Math.floor(jogador.nivel * 2);

  const equipamentos = Object.values(jogador.equipamentos).filter((it) => it);
  const atkBonus = equipamentos.reduce(
    (acc, it) => acc + (Number(it.atkBonus) || 0),
    0
  );
  atk += atkBonus;
  atk += jogador.bonusAtk || 0;

  if (jogador.amuletoEquipado) {
    const atkBase = jogador.ataqueOriginal || jogador.ataque || 0;
    atk += Math.floor(atkBase * 0.02);
  }

  if (jogador.armaEquipada && jogador.armaEquipada.atk) {
    atk += Number(jogador.armaEquipada.atk) || 0;
  }

  return atk;
}

export function calcularDefesaJogador(jogador) {
  let def = jogador.defesa || 0;
  const equipamentos = Object.values(jogador.equipamentos).filter((it) => it);
  for (const it of equipamentos) {
    def += it.defesa || 0;
  }
  def += jogador.bonusDef || 0;
  return def;
}

export function calcularDanoBaseJogador(jogador) {
  return Math.max(1, Math.floor(calcularAtaqueJogador(jogador)) + rand(0, 4));
}

export function calcularChanceCriticaJogador(jogador) {
  const bonusCriticoArma =
    jogador.armaEquipada?.efeito?.tipo === "critico"
      ? jogador.armaEquipada.efeito.chance
      : 0;
  return (
    (jogador.bonusClasse?.critChance || 0) +
    (jogador.bonusRaca?.critChance || 0) +
    (jogador.bonusCritico || 0) +
    bonusCriticoArma
  );
}

export function aplicarFuriaBarbaro(jogador, dano) {
  if (jogador.classe === "Bárbaro" && jogador.hp <= jogador.hpMax * 0.35) {
    return Math.floor(dano * 1.5);
  }
  return dano;
}

export function calcularDefesaInimigo(inimigo) {
  let def = Number(inimigo.defesa) || 0;
  def += inimigo.bonusDef || 0;
  return def;
}
