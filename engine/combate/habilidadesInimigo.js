import { rand } from "./aleatorio.js";
import { aplicarEnvenenamento } from "./efeitosDeStatus.js";

export function verificarEsquivaInimigo(inimigo) {
  return inimigo.habilidade === "esquiva" && rand(1, 100) <= 15;
}

export function verificarAtaqueDuplo(inimigo) {
  return inimigo.habilidade === "ataque_duplo" && rand(1, 100) <= 15;
}

export function verificarEnvenenamentoAoAtacar(inimigo, jogador) {
  if (inimigo.habilidade !== "envenenamento" || rand(1, 100) > 20) return false;
  aplicarEnvenenamento(jogador, rand(3, 5), 5);
  return true;
}

export function aplicarInvulneravel(inimigo) {
  if (!inimigo.status) inimigo.status = [];
  inimigo.status.push({ tipo: "invulneravel", duracao: 1 });
}

export function processarInvulneravelDoTurno(inimigo) {
  if (!inimigo.status) return false;
  const efeito = inimigo.status.find((s) => s.tipo === "invulneravel");
  if (!efeito) return false;
  efeito.duracao--;
  if (efeito.duracao <= 0) {
    inimigo.status = inimigo.status.filter((s) => s.tipo !== "invulneravel");
  }
  return true;
}

export function verificarParalisia() {
  return rand(1, 100) <= 12;
}

export function aplicarParalisia(jogador, duracao) {
  if (!jogador.status) jogador.status = [];
  jogador.status.push({ tipo: "paralisado", duracao });
}

export function processarParalisiaDoTurno(jogador) {
  if (!jogador.status) return false;
  const efeito = jogador.status.find((s) => s.tipo === "paralisado");
  if (!efeito) return false;
  efeito.duracao--;
  if (efeito.duracao <= 0) {
    jogador.status = jogador.status.filter((s) => s.tipo !== "paralisado");
  }
  return true;
}

export function verificarRouboEFuga() {
  return rand(1, 100) <= 20;
}

export function roubarOuroEFugir(jogador) {
  const roubo = Math.min(jogador.ouro, rand(20, 50));
  jogador.ouro -= roubo;
  return roubo;
}

export function verificarPetrificarAoAtacar(inimigo) {
  return inimigo.habilidade === "petrificar" && rand(1, 100) <= 20;
}

export function aplicarBuffPetrificar(inimigo) {
  inimigo.defesa += Math.floor(inimigo.defesa * 0.05) + 1;
}

export function processarRegeneracao(inimigo) {
  if (inimigo.habilidade !== "regeneracao" || Math.random() >= 0.3) {
    return { curou: false, valor: 0 };
  }
  const cura = Math.floor(inimigo.hpMax * 0.07);
  inimigo.hp = Math.min(inimigo.hp + cura, inimigo.hpMax);
  return { curou: true, valor: cura };
}

export function verificarBloquearEContraAtacar() {
  return rand(1, 100) <= 10;
}

export function calcularContraAtaque(_inimigo, danoOriginal) {
  return Math.floor(danoOriginal * 0.9);
}
