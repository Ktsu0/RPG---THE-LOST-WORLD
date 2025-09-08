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
import promptSync from "prompt-sync";
const prompt = promptSync();

// --- Função de batalha principal ---
export function batalha(inimigo, jogador) {
  console.log(
    `\n${colors.bright}🔥 Você encontrou um ${inimigo.nome}!${colors.reset} (${colors.red}HP:${colors.reset} ${inimigo.hp}, ${colors.red}ATK:${colors.reset} ${inimigo.atk})`
  );

  if (!inimigo.status) inimigo.status = [];
  let rodadas = 0;
  let esqueletosInvocados = [];

  const finalizarVitoria = (jogador, inimigo) => {
    console.log(
      `\n${colors.green}✅ Você derrotou o ${inimigo.nome}!${
        colors.reset
      } Ganhou ${colors.yellow}${inimigo.xp || 0}${colors.reset} XP.`
    );
    jogador.xp += inimigo.xp || 0;

    let ouroDrop = inimigo.ouro || 0;
    if (jogador.bonusClasse && jogador.bonusClasse.dropOuro) {
      ouroDrop = Math.floor(
        ouroDrop * (1 + jogador.bonusClasse.dropOuro / 100)
      );
    }
    jogador.ouro += ouroDrop;
    console.log(
      `Você ganhou ${colors.yellow}${ouroDrop}${colors.reset} de ouro.`
    );

    const chancePocao =
      15 + ((jogador.bonusClasse && jogador.bonusClasse.dropItem) || 0);
    const chanceArmadura =
      10 + ((jogador.bonusClasse && jogador.bonusClasse.dropItem) || 0);

    if (rand(1, 100) <= chancePocao) {
      jogador.inventario.push({
        nome: "Poção de Cura",
        slot: "consumable",
        preco: 200,
        cura: 50,
      }); // Adicionei o objeto da poção para consistência
      console.log(
        `${colors.green}🎁 Você encontrou uma Poção de Cura!${colors.reset}`
      );
    }

    if (rand(1, 100) <= chanceArmadura) {
      const armors = loja.filter((i) => i.slot !== "consumable");
      if (armors.length > 0) {
        const drop = armors[rand(0, armors.length - 1)];
        equiparItem(jogador, drop); // Assumindo que esta função está no seu código
        console.log(
          `${colors.green}🎁 O inimigo dropou e você equipou:${colors.reset} ${
            drop.nome
          } (Set: ${drop.set || "Nenhum"})`
        );
      }
    }
    checarLevelUp(jogador);
  };

  while (inimigo.hp > 0 && jogador.hp > 0) {
    rodadas++;

    // === Início do Turno: Aplica Status ===
    aplicarStatusPorTurno(jogador, inimigo);

    // Checa se o inimigo foi derrotado por um status
    if (inimigo.hp <= 0) {
      finalizarVitoria(jogador, inimigo);
      return true;
    }

    console.log(
      `\n${colors.bright}Seu HP:${colors.reset} ${colors.green}${jogador.hp}/${jogador.hpMax}${colors.reset} | ${colors.bright}${inimigo.nome} HP:${colors.reset} ${colors.red}${inimigo.hp}${colors.reset}`
    );

    if (jogador.habilidadeClasse === "suporte") {
      const cura = Math.floor(jogador.hpMax * 0.1);
      jogador.hp = Math.min(jogador.hp + cura, jogador.hpMax);
      console.log(`${colors.bright}💚 Suporte cura ${cura} HP!${colors.reset}`);
    }

    // --- Turno do Jogador ---
    console.log(
      `${colors.red}[1] Atacar${colors.reset}  ${colors.blue}[2] Usar Poção${colors.reset}  ${colors.gray}[3] Fugir${colors.reset}`
    );
    const escolha = prompt("Escolha: ");

    if (escolha === "1") {
      // Habilidade do Necromante: Invocação
      if (jogador.classe === "Necromante" && rodadas % 4 === 0) {
        let numEsqueletos;
        const chance = rand(1, 100);

        if (chance <= 95) {
          numEsqueletos = 1;
        } else if (chance <= 98) {
          numEsqueletos = 2;
        } else if (chance <= 99) {
          numEsqueletos = 3;
        } else {
          numEsqueletos = 4;
        }
        console.log(
          `\n${colors.dim}💀 Você invocou ${numEsqueletos} esqueleto(s) para lutar ao seu lado!${colors.reset}`
        );
        for (let i = 0; i < numEsqueletos; i++) {
          const esqueleto = criarEsqueleto(jogador);
          esqueletosInvocados.push(esqueleto);
        }
      }

      // --- Nova Lógica de Ataque e Efeitos de Arma ---
      let danoFinal = danoDoJogador(jogador); // Assumindo uma função que calcula o dano base
      danoFinal = aplicarFuria(jogador, danoFinal);

      // Calcula a chance de crítico da arma, verificando cada propriedade
      const bonusCriticoArma =
        jogador.armaEquipada &&
        jogador.armaEquipada.efeito &&
        jogador.armaEquipada.efeito.tipo === "critico"
          ? jogador.armaEquipada.efeito.chance
          : 0;

      // Calcula a chance de crítico total
      const critChanceTotal =
        ((jogador.bonusClasse && jogador.bonusClasse.critChance) || 0) +
        ((jogador.bonusRaca && jogador.bonusRaca.critChance) || 0) +
        (jogador.bonusCritico || 0) +
        bonusCriticoArma;

      // Aplica o golpe crítico
      if (critChanceTotal > 0 && rand(1, 100) <= critChanceTotal) {
        console.log(
          `${colors.bright}💥 Golpe crítico! Dano dobrado!${colors.reset}`
        );
        danoFinal *= 2;
      }

      // Aplica o dano ao inimigo
      inimigo.hp -= danoFinal;
      inimigo.hp = Math.max(0, inimigo.hp);
      console.log(
        `Você causou ${colors.red}${danoFinal}${colors.reset} de dano ao ${inimigo.nome}.`
      );

      // Aplica o efeito da arma (se houver)
      aplicarEfeitoArma(jogador, inimigo);
    } else if (escolha === "2") {
      usarPocao(jogador);
    } else if (escolha === "3") {
      if (rand(1, 100) <= 60) {
        console.log("🏃 Você conseguiu fugir!");
        return false;
      } else {
        console.log(`${colors.red}❌ Falha na fuga!${colors.reset}`);
      }
    } else {
      console.log("Opção inválida.");
    }

    if (inimigo.hp <= 0) {
      finalizarVitoria(jogador, inimigo);
      return true;
    }

    // --- Turno do Inimigo e Efeitos de Sangramento ---
    inimigo.status.forEach((efeito, index) => {
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
          inimigo.status.splice(index, 1);
        }
      }
    });

    if (inimigo.hp > 0) {
      // Ataque dos esqueletos invocados
      esqueletosInvocados.forEach((esq) => {
        if (esq.hp > 0) {
          inimigo.hp -= esq.atk;
          console.log(
            `${colors.dim}💀 Seu esqueleto causou ${esq.atk} de dano ao ${inimigo.nome}!${colors.reset}`
          );
        }
      });
      esqueletosInvocados = esqueletosInvocados.filter((esq) => esq.hp > 0);

      if (inimigo.hp <= 0) {
        finalizarVitoria(jogador, inimigo);
        return true;
      }

      let resultadoHabilidade = null;
      if (inimigo.habilidade) {
        resultadoHabilidade = habilidadeInimigo(inimigo, jogador);
      }
      if (resultadoHabilidade === "fuga") {
        return false;
      }

      const defesaTotal = calcularDefesaTotal(jogador);
      let danoInimigo = Math.max(
        1,
        inimigo.atk + rand(0, 3) - Math.floor(defesaTotal / 5)
      );

      if (resultadoHabilidade === "ataque_duplo") {
        console.log(
          `${colors.bright}⚔️ O Bandido Veterano atacou duas vezes!${colors.reset}`
        );
        danoInimigo *= 2;
      }

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

      if (resultadoHabilidade === "esquiva") {
        danoInimigo = 0;
      } else if (rand(1, 100) <= esquivaTotal) {
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

      if (danoInimigo > 0)
        console.log(
          `${inimigo.nome} atacou e causou ${colors.red}${danoInimigo}${colors.reset} de dano. (Defesa: ${defesaTotal})`
        );
    }
  }

  if (jogador.hp === 0) {
    console.log(
      `\n${colors.red}💀 Você foi derrotado... Fim de jogo.${colors.reset}`
    );
    return false;
  }

  return true;
}
