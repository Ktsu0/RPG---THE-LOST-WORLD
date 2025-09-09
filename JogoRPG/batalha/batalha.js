import { usarPocao } from "./../itens/pocaoCura.js";
import {
  equiparItem,
  checarLevelUp,
  danoDoJogador,
  aplicarFuria,
  calcularDefesaTotal,
} from "./../personagem/status.js";
import { criarEsqueleto } from "./../personagem/habilidades.js";
import { habilidadeInimigo } from "./../inimigos/monstros.js";
import { colors, rand } from "./../utilitarios.js";
import { aplicarEfeitoArma, aplicarStatusPorTurno } from "../itens/armas.js";
import { loja } from "../itens/loja/itensLoja.js";
import { verificarMorte } from "./../itens/orbeRessureicao.js";
import { vitoriaBoss } from "../missao/masmorra/vitoriaBoss.js";
import promptSync from "prompt-sync";
const prompt = promptSync();

// --- FUNÇÃO DE HABILIDADES ESPECIAIS (MINIBOSS E BOSS) ---
function executarHabilidadeEspecial(inimigo, jogador) {
  if (inimigo.tipo === "miniboss") {
    if (rand(1, 100) <= 20) {
      const danoExtra = inimigo.atk * 0.5;
      const danoTotal = inimigo.atk + danoExtra;
      jogador.hp -= danoTotal;
      console.log(
        `\n💥 O mini-chefe ${inimigo.nome} usa um ataque poderoso e causa ${danoTotal} de dano!`
      );
      return true;
    }
    return false;
  }

  if (inimigo.poder) {
    console.log(
      `\n🔥 ${inimigo.nome} usa sua habilidade especial: ${inimigo.poder}!`
    );

    switch (inimigo.poder) {
      case "Necromancia":
        console.log("💀 Ossos se levantam da terra para te atacar!");
        const dano = rand(5, 10);
        jogador.hp -= dano;
        console.log(`Ossos esqueléticos te acertam, causando ${dano} de dano!`);
        break;
      case "Raízes Presas":
        console.log("🌳 Raízes saem do chão e te prendem!");
        jogador.stunned = true;
        break;
      case "Sopro Glaciar":
        const danoGelo = rand(8, 15);
        jogador.hp -= danoGelo;
        console.log(
          `❄️ O sopro gélido te atinge, causando ${danoGelo} de dano!`
        );
        break;
    }
    return true;
  }
  return false;
}

// --- FUNÇÃO AUXILIAR: VITÓRIA ---
const finalizarVitoria = (jogador, inimigo) => {
  console.log(
    `\n${colors.green}✅ Você derrotou o ${inimigo.nome}!${
      colors.reset
    } Ganhou ${colors.yellow}${inimigo.xp || 0}${colors.reset} XP.`
  );
  jogador.xp += inimigo.xp || 0;

  let ouroDrop = inimigo.ouro || 0;
  // CORREÇÃO: Usando um 'if' tradicional para verificar a existência do bônus
  if (jogador.bonusClasse && jogador.bonusClasse.dropOuro) {
    ouroDrop = Math.floor(ouroDrop * (1 + jogador.bonusClasse.dropOuro / 100));
  }
  jogador.ouro += ouroDrop;
  console.log(
    `Você ganhou ${colors.yellow}${ouroDrop}${colors.reset} de ouro.`
  );

  // CORREÇÃO: Usando um operador ternário para definir um valor padrão
  const bonusDropItem =
    (jogador.bonusClasse && jogador.bonusClasse.dropItem) || 0;

  const chancePocao = 15 + bonusDropItem;
  const chanceArmadura = 10 + bonusDropItem;
  if (rand(1, 100) <= chancePocao) {
    jogador.inventario.push({
      nome: "Poção de Cura",
      slot: "consumable",
      preco: 200,
      cura: 50,
    });
    console.log(
      `${colors.green}🎁 Você encontrou uma Poção de Cura!${colors.reset}`
    );
  }

  if (rand(1, 100) <= chanceArmadura) {
    const armors = loja.filter((i) => i.slot !== "consumable");
    if (armors.length > 0) {
      const drop = armors[rand(0, armors.length - 1)];
      equiparItem(jogador, drop);
      console.log(
        `${colors.green}🎁 O inimigo dropou e você equipou:${colors.reset} ${
          drop.nome
        } (Set: ${drop.set || "Nenhum"})`
      );
    }
  }
  checarLevelUp(jogador);

  // Ela checa se o jogador está em uma masmorra ativa
  if (jogador.masmorraAtual) {
    const salaAtual =
      jogador.masmorraAtual.grid[jogador.posicao.y][jogador.posicao.x];

    // E altera o tipo da sala para "vazio"
    salaAtual.roomType = "vazio";
    salaAtual.content = null;

    // Opcional: Para mostrar ao jogador que a sala foi limpa
    console.log(
      `\n${colors.cyan}A sala foi limpa e marcada no seu mapa.${colors.reset}`
    );
  }
};

// --- FUNÇÃO AUXILIAR: ATAQUE DO JOGADOR ---
// Agora recebe todas as funções que precisa como argumentos.
function ataqueJogador(inimigo, jogador, rodadas, esqueletosInvocados) {
  // Lógica de status de atordoamento
  if (jogador.stunned) {
    console.log(
      `${colors.yellow}Você está atordoado e não pode agir!${colors.reset}`
    );
    jogador.stunned = false; // O atordoamento dura um turno
    return "continua";
  }

  console.log(
    `\n${colors.bright}Seu HP:${colors.reset} ${colors.green}${jogador.hp}/${jogador.hpMax}${colors.reset} | ${colors.bright}${inimigo.nome} HP:${colors.reset} ${colors.red}${inimigo.hp}${colors.reset}`
  );

  if (jogador.habilidadeClasse === "suporte") {
    const cura = Math.floor(jogador.hpMax * 0.1);
    jogador.hp = Math.min(jogador.hp + cura, jogador.hpMax);
    console.log(`${colors.bright}💚 Suporte cura ${cura} HP!${colors.reset}`);
  }

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
    return "continua";
  } else if (escolha === "2") {
    usarPocao(jogador); // Agora a função é chamada corretamente
    return "continua";
  } else if (escolha === "3") {
    if (rand(1, 100) <= 60) {
      console.log("🏃 Você conseguiu fugir!");
      return "fuga";
    } else {
      console.log(`${colors.red}❌ Falha na fuga!${colors.reset}`);
      return "continua";
    }
  } else {
    console.log("Opção inválida.");
    return "invalido";
  }
}

// --- FUNÇÃO AUXILIAR: ATAQUE DO INIMIGO ---
// Recebe todas as funções que precisa como argumentos.
function ataqueInimigo(inimigo, jogador, esqueletosInvocados) {
  if (inimigo.hp <= 0) return;

  if (inimigo.status && inimigo.status.length > 0) {
    inimigo.status.forEach((efeito, index, array) => {
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
          array.splice(index, 1);
        }
      }
    });
  }

  if (inimigo.hp <= 0) return;

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

  const usouHabilidade = executarHabilidadeEspecial(inimigo, jogador);

  if (!usouHabilidade) {
    if (inimigo.habilidade) {
      habilidadeInimigo(inimigo, jogador);
    } else {
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
          `${inimigo.nome} atacou e causou ${colors.red}${danoInimigo}${colors.reset} de dano. (Defesa: ${defesaTotal})`
        );
      }
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
      if (tipoDeInimigo === "boss" && localDaBatalha === "masmorra") {
        vitoriaBoss(jogador, inimigo);
      } else {
        finalizarVitoria(jogador, inimigo);
      }
      return true;
    }

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

    if (inimigo.hp <= 0) {
      finalizarVitoria(jogador, inimigo);
      return true;
    }

    ataqueInimigo(inimigo, jogador, esqueletosInvocados);

    verificarMorte(jogador);
  }
}
