import { rand } from "./aleatorio.js";
import { resolverAtaqueJogador, resolverAtaqueInimigo } from "./calculoDano.js";
import {
  processarCuraXama,
  processarSangramentoDoTurno,
  processarEnvenenamentoDoTurno,
  aplicarEfeitoDaArmaAoAcertar,
} from "./efeitosDeStatus.js";
import {
  verificarAtaqueDuplo,
  verificarEnvenenamentoAoAtacar,
  processarInvulneravelDoTurno,
  processarParalisiaDoTurno,
  verificarRouboEFuga,
  roubarOuroEFugir,
  verificarPetrificarAoAtacar,
  aplicarBuffPetrificar,
  processarRegeneracao,
  verificarBloquearEContraAtacar,
  calcularContraAtaque,
} from "./habilidadesInimigo.js";
import { concederRecompensaVitoria } from "./recompensas.js";

export function executarRodada(estado, acao) {
  const { jogador, inimigo } = estado;
  const rodada = estado.rodada + 1;
  const eventos = [];

  // 1. Efeitos passivos de início de rodada
  const cura = processarCuraXama(jogador);
  if (cura && cura.curou) {
    eventos.push({ tipo: "cura_xama", valor: cura.valor });
  }

  const sangramento = processarSangramentoDoTurno(inimigo);
  if (sangramento) {
    eventos.push({
      tipo: "sangramento_tick",
      alvo: "inimigo",
      dano: sangramento.dano,
      curado: sangramento.curado,
    });
  }
  if (inimigo.hp <= 0) {
    eventos.push({ tipo: "morte", alvo: "inimigo" });
    const recompensa = concederRecompensaVitoria(jogador, inimigo);
    eventos.push({ tipo: "vitoria", ...recompensa });
    return { estado: { jogador, inimigo, rodada }, eventos, fim: "vitoria" };
  }

  const envenenamento = processarEnvenenamentoDoTurno(jogador);
  if (envenenamento) {
    eventos.push({
      tipo: "envenenamento_tick",
      alvo: "jogador",
      dano: envenenamento.dano,
      curado: envenenamento.curado,
    });
  }
  if (jogador.hp <= 0) {
    eventos.push({ tipo: "morte", alvo: "jogador" });
    eventos.push({ tipo: "derrota" });
    return { estado: { jogador, inimigo, rodada }, eventos, fim: "derrota" };
  }

  // 2. Ação do jogador
  if (processarParalisiaDoTurno(jogador)) {
    eventos.push({ tipo: "paralisado", alvo: "jogador" });
  } else if (acao === "fugir") {
    const sucesso = rand(1, 100) > 40;
    eventos.push({ tipo: "fuga", sucesso });
    if (sucesso) {
      return { estado: { jogador, inimigo, rodada }, eventos, fim: "fuga" };
    }
  } else if (processarInvulneravelDoTurno(inimigo)) {
    eventos.push({ tipo: "invulneravel_ativo", alvo: "inimigo" });
  } else {
    const ataque = resolverAtaqueJogador(jogador, inimigo);
    if (ataque.esquivou) {
      eventos.push({ tipo: "esquiva", autor: "inimigo" });
    } else {
      inimigo.hp = Math.max(0, inimigo.hp - ataque.dano);
      eventos.push({
        tipo: "dano",
        autor: "jogador",
        alvo: "inimigo",
        valor: ataque.dano,
        critico: ataque.critico,
      });

      const sangramentoAplicado = aplicarEfeitoDaArmaAoAcertar(jogador, inimigo);
      if (sangramentoAplicado) {
        eventos.push({
          tipo: "sangramento_aplicado",
          alvo: "inimigo",
          duracao: jogador.armaEquipada.efeito.duracao,
          danoPorTurno: jogador.armaEquipada.efeito.danoPorTurno,
        });
      }

      if (inimigo.hp <= 0) {
        eventos.push({ tipo: "morte", alvo: "inimigo" });
        const recompensa = concederRecompensaVitoria(jogador, inimigo);
        eventos.push({ tipo: "vitoria", ...recompensa });
        return { estado: { jogador, inimigo, rodada }, eventos, fim: "vitoria" };
      }
    }
  }

  // 3. Ação do inimigo
  if (inimigo.habilidade === "roubo_e_fuga" && verificarRouboEFuga()) {
    const roubado = roubarOuroEFugir(jogador);
    eventos.push({ tipo: "fuga_com_roubo", valor: roubado });
    return { estado: { jogador, inimigo, rodada }, eventos, fim: "fuga" };
  }

  if (verificarPetrificarAoAtacar(inimigo)) {
    aplicarBuffPetrificar(inimigo);
    eventos.push({ tipo: "petrificar_aplicado", defesaAtual: inimigo.defesa });
  }

  const regen = processarRegeneracao(inimigo);
  if (regen.curou) {
    eventos.push({ tipo: "regeneracao", valor: regen.valor });
  }

  if (verificarAtaqueDuplo(inimigo)) {
    const golpe1 = resolverAtaqueInimigo(inimigo, jogador);
    const golpe2 = resolverAtaqueInimigo(inimigo, jogador);
    const danoTotal =
      (golpe1.resultado === "dano" ? golpe1.dano : 0) +
      (golpe2.resultado === "dano" ? golpe2.dano : 0);
    jogador.hp = Math.max(0, jogador.hp - danoTotal);
    eventos.push({
      tipo: "ataque_duplo",
      autor: "inimigo",
      dano1: golpe1,
      dano2: golpe2,
      danoTotal,
    });
  } else if (inimigo.habilidade === "bloquear_e_contra_atacar" && verificarBloquearEContraAtacar()) {
    const danoTentado = resolverAtaqueInimigo(inimigo, jogador).dano || 0;
    const contraAtaque = calcularContraAtaque(inimigo, danoTentado || 10);
    jogador.hp = Math.max(0, jogador.hp - contraAtaque);
    eventos.push({ tipo: "contra_ataque", autor: "inimigo", dano: contraAtaque });
  } else {
    const golpe = resolverAtaqueInimigo(inimigo, jogador);
    if (golpe.resultado === "esquiva") {
      eventos.push({ tipo: "esquiva", autor: "jogador" });
    } else if (golpe.resultado === "bloqueio") {
      eventos.push({ tipo: "bloqueio", autor: "jogador" });
    } else {
      jogador.hp = Math.max(0, jogador.hp - golpe.dano);
      eventos.push({
        tipo: "dano",
        autor: "inimigo",
        alvo: "jogador",
        valor: golpe.dano,
        critico: false,
      });
      if (verificarEnvenenamentoAoAtacar(inimigo, jogador)) {
        eventos.push({ tipo: "envenenamento_aplicado", alvo: "jogador" });
      }
    }
  }

  if (jogador.hp <= 0) {
    eventos.push({ tipo: "morte", alvo: "jogador" });
    eventos.push({ tipo: "derrota" });
    return { estado: { jogador, inimigo, rodada }, eventos, fim: "derrota" };
  }

  return { estado: { jogador, inimigo, rodada }, eventos, fim: null };
}
