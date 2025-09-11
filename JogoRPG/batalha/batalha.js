import { usarPocao } from "./../itens/pocaoCura.js";
import {
  equiparItem,
  checarLevelUp,
  danoDoJogador,
  aplicarFuria,
  calcularDefesaTotal,
} from "./../personagem/status.js";
import { criarEsqueleto } from "./../personagem/habilidades.js";
import { colors, rand } from "./../utilitarios.js";
import {
  aplicarEfeitoArma,
  aplicarStatusPorTurno,
} from "./../itens/armasEfeitos.js";
import { processarDropDeItem } from "./../itens/chanceDrop.js";
import { verificarMorte } from "./../itens/orbeRessureicao.js";
import { executarHabilidadeEspecial } from "./../masmorra/habilidadesInimigos.js";
import promptSync from "prompt-sync";
const prompt = promptSync();

// --- FUNÇÃO AUXILIAR: VITÓRIA UNIFICADA ---
function finalizarVitoria(inimigo, jogador) {
  // === LÓGICA EXCLUSIVA PARA CHEFES (BOSSES) ===
  if (inimigo.tipo === "boss") {
    // 1. Verifica se o boss tem uma recompensa de item lendário
    if (inimigo.recompensa) {
      console.log(
        `\n🎉 Você derrotou o lendário ${inimigo.nome} e encontrou um tesouro!`
      );
      console.log(
        `${colors.cyan}🛡️ Você obteve o item: ${inimigo.recompensa.nome}!${colors.reset}`
      );
      jogador.inventario.push(inimigo.recompensa);
    } else {
      console.log(
        `\nVocê derrotou o ${inimigo.nome}, mas ele não deixou nenhum item de valor.`
      );
    }

    // 2. Adiciona XP e Ouro para o boss
    const xpGanho = inimigo.hpMax / 5 + inimigo.atk * 2;
    const ouroGanho = Math.floor(rand(50, 100) * inimigo.dificuldade);

    jogador.xp += xpGanho;
    jogador.ouro += ouroGanho;

    console.log(`💰 Você ganhou ${ouroGanho} de ouro.`);
    console.log(`✨ Você ganhou ${xpGanho} de XP.`);

    checarLevelUp(jogador);
    return;
  }

  // === LÓGICA PARA MONSTROS COMUNS (E MINI-BOSSES) ===
  const xpGanho = inimigo.xp || 0;
  jogador.xp += xpGanho;

  let ouroDrop = inimigo.ouro || 0;
  if (jogador.bonusClasse && jogador.bonusClasse.dropOuro) {
    ouroDrop = Math.floor(ouroDrop * (1 + jogador.bonusClasse.dropOuro / 100));
  }
  jogador.ouro += ouroDrop;

  let itemDropado = null;
  const bonusDropItem =
    (jogador.bonusClasse && jogador.bonusClasse.dropItem) || 0;

  // Lógica de drop de poção
  const chancePocao = 15 + bonusDropItem;
  if (rand(1, 100) <= chancePocao) {
    const novaPocao = {
      nome: "Poção de Cura",
      slot: "consumable",
      preco: 200,
      cura: 50,
    };
    jogador.inventario.push(novaPocao);
    itemDropado = novaPocao;
  }

  // Lógica de drop itens

  let bonusTotalDrop = 0;
  if (jogador.masmorraAtual) {
    // Se estiver na masmorra, adiciona o bônus
    const bonusMasmorra = 10;
    bonusTotalDrop = bonusMasmorra;
  }
  processarDropDeItem(jogador, bonusTotalDrop);
  console.log(
    `\n${colors.green}Você derrotou o ${inimigo.nome}!${colors.reset}`
  );
  console.log(`Você ganhou ${xpGanho} de XP e ${ouroDrop} de ouro.`);
  checarLevelUp(jogador);
}

// --- FUNÇÃO AUXILIAR: ATAQUE DO JOGADOR ---
// Agora recebe todas as funções que precisa como argumentos.
function ataqueJogador(inimigo, jogador, rodadas, esqueletosInvocados) {
  if (jogador.stunned) {
    console.log(
      `${colors.yellow}Você está atordoado e não pode agir!${colors.reset}`
    );
    jogador.stunned = false;
    return "continua";
  }

  // A exibição de HP foi movida para a função principal de batalha

  console.log(
    `${colors.red}[1] Atacar${colors.reset}  ${colors.blue}[2] Usar Poção${colors.reset}  ${colors.gray}[3] Fugir${colors.reset}`
  );
  const escolha = prompt("Escolha: ");

  if (escolha === "1") {
    if (jogador.classe === "Necromante" && rodadas % 4 === 0) {
      let numEsqueletos;
      const chance = rand(1, 100);
      if (chance <= 95) numEsqueletos = 1;
      else if (chance <= 98) numEsqueletos = 2;
      else if (chance <= 99) numEsqueletos = 3;
      else numEsqueletos = 4;
      console.log(
        `\n${colors.dim}💀 Você invocou ${numEsqueletos} esqueleto(s) para lutar ao seu lado!${colors.reset}`
      );
      for (let i = 0; i < numEsqueletos; i++) {
        esqueletosInvocados.push(criarEsqueleto(jogador));
      }
    }
    let danoFinal = danoDoJogador(jogador);
    danoFinal = aplicarFuria(jogador, danoFinal);
    const bonusCriticoArma =
      jogador.armaEquipada &&
      jogador.armaEquipada.efeito &&
      jogador.armaEquipada.efeito.tipo === "critico"
        ? jogador.armaEquipada.efeito.chance
        : 0;
    const critChanceTotal =
      ((jogador.bonusClasse && jogador.bonusClasse.critChance) || 0) +
      ((jogador.bonusRaca && jogador.bonusRaca.critChance) || 0) +
      (jogador.bonusCritico || 0) +
      bonusCriticoArma;

    if (critChanceTotal > 0 && rand(1, 100) <= critChanceTotal) {
      console.log(
        `${colors.bright}💥 Golpe crítico! Dano dobrado!${colors.reset}`
      );
      danoFinal *= 2;
    }

    inimigo.hp -= danoFinal;
    inimigo.hp = Math.max(0, inimigo.hp);
    console.log(
      `Você causou ${colors.red}${danoFinal}${colors.reset} de dano ao ${inimigo.nome}.`
    );

    aplicarEfeitoArma(jogador, inimigo);
    // Não precisamos de um 'return "continua"'
  } else if (escolha === "2") {
    usarPocao(jogador);
  } else if (escolha === "3") {
    if (rand(1, 100) <= 60) {
      console.log("🏃 Você conseguiu fugir!");
      return "fuga";
    } else {
      console.log(`${colors.red}❌ Falha na fuga!${colors.reset}`);
    }
  } else {
    console.log("Opção inválida.");
    // O loop principal vai lidar com a opção inválida
    return "invalido";
  }
}

// --- FUNÇÃO AUXILIAR: ATAQUE DO INIMIGO ---
// Recebe todas as funções que precisa como argumentos.
function ataqueInimigo(inimigo, jogador, esqueletosInvocados) {
  if (inimigo.hp <= 0) return;

  // Lógica de status de sangramento
  if (inimigo.status && inimigo.status.length > 0) {
    inimigo.status = inimigo.status.filter((efeito) => {
      if (efeito.tipo === "sangramento") {
        console.log(
          `${colors.red}🩸 O inimigo sofre ${efeito.dano} de dano por sangramento!${colors.reset}`
        );
        inimigo.hp -= efeito.dano;
        efeito.duracao--;
        if (efeito.duracao <= 0) {
          console.log(
            `${colors.green}✅ O sangramento no inimigo parou.${colors.reset}`
          );
          return false;
        }
      }
      return true;
    });
  }

  if (inimigo.hp <= 0) return;

  // Ataque dos esqueletos
  esqueletosInvocados.forEach((esq) => {
    if (esq.hp > 0) {
      inimigo.hp -= esq.atk;
      console.log(
        `${colors.dim}💀 Seu esqueleto causou ${esq.atk} de dano ao ${inimigo.nome}!${colors.reset}`
      );
    }
  });

  const esqueletosVivos = esqueletosInvocados.filter((esq) => esq.hp > 0);
  esqueletosInvocados.splice(0, esqueletosInvocados.length, ...esqueletosVivos);

  if (inimigo.hp <= 0) return;

  // --- Lógica de ataque do inimigo ---
  // Chama a função unificada e armazena o resultado.
  // Se uma habilidade for usada, a função retorna 'true'.
  const usouHabilidade = executarHabilidadeEspecial(inimigo, jogador);

  // Se a habilidade foi usada, o valor de 'usouHabilidade' será 'true',
  // e o bloco abaixo (ataque padrão) será ignorado.
  if (!usouHabilidade) {
    const defesaTotal = calcularDefesaTotal(jogador);
    let danoInimigo = Math.max(
      1,
      inimigo.atk + rand(0, 3) - Math.floor(defesaTotal / 5)
    );

    if (esqueletosInvocados.length > 0) {
      const esqueletoAlvo = esqueletosInvocados[0];
      const danoAbsorvido = danoInimigo;
      esqueletoAlvo.hp -= danoAbsorvido;
      console.log(
        `${colors.blue}🛡 Um esqueleto absorveu ${danoAbsorvido} de dano para você!${colors.reset}`
      );
      if (esqueletoAlvo.hp <= 0) {
        console.log(
          `${colors.red}💔 Um esqueleto foi destruído!${colors.reset}`
        );
      }
      danoInimigo = 0;
    }

    const esquivaTotal =
      (jogador.bonusEsquiva || 0) +
      (jogador.habilidadeClasse === "suporte" ? 10 : 0);
    if (rand(1, 100) <= esquivaTotal) {
      console.log(
        `${colors.cyan}💨 Você esquivou do ataque inimigo!${colors.reset}`
      );
      danoInimigo = 0;
    }

    let chanceBloqueio =
      (jogador.habilidadeClasse === "bloqueio" ? 10 : 0) +
      (jogador.bonusBloqueio || 0);
    if (rand(1, 100) <= chanceBloqueio) {
      console.log(
        `${colors.blue}🛡 Você bloqueou o ataque inimigo!${colors.reset}`
      );
      danoInimigo = 0;
    }

    jogador.hp -= danoInimigo;
    jogador.hp = Math.max(0, jogador.hp);

    if (danoInimigo > 0) {
      console.log(
        `${inimigo.nome} atacou e causou ${colors.red}${danoInimigo}${colors.reset} de dano.`
      );
    } else {
      console.log(`${inimigo.nome} atacou, mas você não recebeu dano!`);
    }
  }
}

// --- FUNÇÃO DE BATALHA PRINCIPAL ---
export function batalha(inimigo, jogador) {
  console.log(
    `\n${colors.bright}🔥 Você encontrou um ${inimigo.nome}!${colors.reset} (${colors.red}HP:${colors.reset} ${inimigo.hp}, ${colors.red}ATK:${colors.reset} ${inimigo.atk})`
  );

  if (!inimigo.status) inimigo.status = [];
  let rodadas = 0;
  let esqueletosInvocados = [];

  while (inimigo.hp > 0 && jogador.hp > 0) {
    rodadas++;
    aplicarStatusPorTurno(jogador, inimigo);

    if (inimigo.hp <= 0) {
      finalizarVitoria(inimigo, jogador);
      return true;
    }

    // --- TURNO DO JOGADOR ---
    console.log(
      `\nSeu HP: ${colors.green}${jogador.hp}/${jogador.hpMax}${colors.reset} | ${inimigo.nome} HP: ${colors.red}${inimigo.hp}${colors.reset}`
    );
    const resultadoAtaqueJogador = ataqueJogador(
      inimigo,
      jogador,
      rodadas,
      esqueletosInvocados
    );

    if (resultadoAtaqueJogador === "fuga") {
      return false;
    }
    if (resultadoAtaqueJogador === "invalido") {
      continue;
    }

    // Verifica se o inimigo morreu após o ataque do jogador
    if (inimigo.hp <= 0) {
      finalizarVitoria(inimigo, jogador);
      return true;
    }

    // --- TURNO DO INIMIGO ---
    ataqueInimigo(inimigo, jogador, esqueletosInvocados);

    verificarMorte(jogador);
  }

  // Se o loop terminou, o jogador foi derrotado
  if (jogador.hp <= 0) {
    console.log("💀 Você foi derrotado!");
  }
  return false;
}
