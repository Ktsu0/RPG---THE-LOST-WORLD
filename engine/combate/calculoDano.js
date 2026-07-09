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

export function resolverAtaqueJogador(jogador, inimigo) {
  const danoBruto = calcularDanoBaseJogador(jogador);
  const defesaEfetiva = calcularDefesaInimigo(inimigo);
  let dano = Math.max(1, danoBruto - defesaEfetiva);
  dano = aplicarFuriaBarbaro(jogador, dano);

  const chanceCritica = calcularChanceCriticaJogador(jogador);
  let critico = false;
  if (chanceCritica > 0 && rand(1, 100) <= chanceCritica) {
    critico = true;
    dano *= 2;
  }

  if (inimigo.habilidade === "esquiva" && rand(1, 100) <= 15) {
    return { dano: 0, critico: false, esquivou: true };
  }

  return { dano, critico, esquivou: false };
}

export function resolverAtaqueInimigo(inimigo, jogador) {
  const danoBase = Math.max(
    1,
    inimigo.atk + rand(0, 3) - Math.floor(calcularDefesaJogador(jogador) / 5)
  );

  const esquivaTotal =
    (jogador.bonusClasse?.esquiva || 0) + (jogador.bonusEsquiva || 0);
  if (rand(1, 100) <= esquivaTotal) {
    return { resultado: "esquiva", dano: 0 };
  }

  const chanceBloqueio =
    (jogador.bonusClasse?.bloqueioChance || 0) + (jogador.bonusBloqueio || 0);
  if (rand(1, 100) <= chanceBloqueio) {
    return { resultado: "bloqueio", dano: 0 };
  }

  return { resultado: "dano", dano: danoBase };
}
