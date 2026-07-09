import { rand } from "./aleatorio.js";

export function processarCuraXama(jogador) {
  if (jogador.classe !== "Xamã" || jogador.hp <= 0) return null;

  const chance = Math.random();
  if (chance < 0.5) {
    const cura = Math.floor(jogador.hpMax * 0.05);
    const hpAnterior = jogador.hp;
    jogador.hp = Math.min(jogador.hp + cura, jogador.hpMax);
    const curaEfetiva = jogador.hp - hpAnterior;
    return { curou: curaEfetiva > 0, valor: curaEfetiva };
  }
  return { curou: false, valor: 0 };
}

export function aplicarSangramento(inimigo, duracao, danoPorTurno) {
  if (!inimigo.status) inimigo.status = [];
  inimigo.status.push({ tipo: "sangramento", duracao, dano: danoPorTurno });
}

export function processarSangramentoDoTurno(inimigo) {
  if (!inimigo.status) return null;
  const efeito = inimigo.status.find((s) => s.tipo === "sangramento");
  if (!efeito) return null;

  inimigo.hp = Math.max(0, inimigo.hp - efeito.dano);
  efeito.duracao--;
  const curado = efeito.duracao <= 0;
  if (curado) {
    inimigo.status = inimigo.status.filter((s) => s.tipo !== "sangramento");
  }
  return { dano: efeito.dano, curado };
}

export function aplicarEnvenenamento(jogador, duracao, danoPorTurno) {
  if (!jogador.status) jogador.status = [];
  jogador.status.push({ tipo: "envenenamento", duracao, dano: danoPorTurno });
}

export function processarEnvenenamentoDoTurno(jogador) {
  if (!jogador.status) return null;
  const efeito = jogador.status.find((s) => s.tipo === "envenenamento");
  if (!efeito) return null;

  jogador.hp = Math.max(0, jogador.hp - efeito.dano);
  efeito.duracao--;
  const curado = efeito.duracao <= 0;
  if (curado) {
    jogador.status = jogador.status.filter((s) => s.tipo !== "envenenamento");
  }
  return { dano: efeito.dano, curado };
}

export function aplicarEfeitoDaArmaAoAcertar(jogador, inimigo) {
  const arma = jogador.armaEquipada;
  if (!arma || !arma.efeito || arma.efeito.tipo !== "sangramento") return false;

  const chance = arma.efeito.chance;
  if (chance && rand(1, 100) > chance) return false;

  aplicarSangramento(inimigo, arma.efeito.duracao, arma.efeito.danoPorTurno);
  return true;
}
