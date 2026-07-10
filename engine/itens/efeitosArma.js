import { rand } from "@engine/combate/aleatorio.js";

export function aplicarRouboDeVida(jogador, danoCausado) {
  const efeito = jogador.armaEquipada?.efeito;
  if (!efeito || efeito.tipo !== "roubo_de_vida") return;
  const vidaRoubada = Math.floor(danoCausado * efeito.percentual);
  jogador.hp = Math.min(jogador.hp + vidaRoubada, jogador.hpMax);
}

export function verificarCriticoArma(jogador) {
  const efeito = jogador.armaEquipada?.efeito;
  if (!efeito || efeito.tipo !== "critico") return false;
  return rand(1, 100) <= efeito.chance;
}

export function aplicarAtaqueDuploArma(jogador, inimigo) {
  const efeito = jogador.armaEquipada?.efeito;
  if (!efeito || efeito.tipo !== "ataque_duplo" || rand(1, 100) > efeito.chance) {
    return { ativou: false, danoExtra: 0 };
  }
  const danoExtra = jogador.ataque;
  inimigo.hp = Math.max(0, inimigo.hp - danoExtra);
  return { ativou: true, danoExtra };
}

export function aplicarConfusao(inimigo, duracao) {
  if (!inimigo.status) inimigo.status = [];
  inimigo.status.push({ tipo: "confusao", duracao });
}

export function aplicarCongelamento(inimigo, duracao) {
  if (!inimigo.status) inimigo.status = [];
  inimigo.status.push({ tipo: "congelamento", duracao });
}

export function aplicarIncendio(inimigo, duracao, danoPorTurno) {
  if (!inimigo.status) inimigo.status = [];
  inimigo.status.push({ tipo: "incendio", duracao, dano: danoPorTurno });
}

function processarStatusSimples(alvo, tipo) {
  if (!alvo.status) return null;
  const efeito = alvo.status.find((s) => s.tipo === tipo);
  if (!efeito) return null;
  efeito.duracao--;
  const curado = efeito.duracao <= 0;
  if (curado) alvo.status = alvo.status.filter((s) => s.tipo !== tipo);
  return { efeito, curado };
}

export function processarConfusaoDoTurno(inimigo) {
  const resultado = processarStatusSimples(inimigo, "confusao");
  if (!resultado) return null;
  const dano = Math.floor(inimigo.atk * 0.5);
  inimigo.hp = Math.max(0, inimigo.hp - dano);
  return { puloTurno: true, dano };
}

export function processarCongelamentoDoTurno(inimigo) {
  const resultado = processarStatusSimples(inimigo, "congelamento");
  if (!resultado) return null;
  return { puloTurno: true };
}

export function processarIncendioDoTurno(inimigo) {
  if (!inimigo.status) return null;
  const efeito = inimigo.status.find((s) => s.tipo === "incendio");
  if (!efeito) return null;
  inimigo.hp = Math.max(0, inimigo.hp - efeito.dano);
  efeito.duracao--;
  const curado = efeito.duracao <= 0;
  if (curado) inimigo.status = inimigo.status.filter((s) => s.tipo !== "incendio");
  return { dano: efeito.dano, curado };
}
