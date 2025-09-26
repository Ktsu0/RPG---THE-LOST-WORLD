import { calcularDanoInimigo } from "../batalha/ataqueInimigo/funcionAuxiliares/calcularDanoInimigo.js";
import { rand } from "./../utilitarios.js";

export function executarHabilidadeEspecial(inimigo, jogador) {
  // ----------------------------------------
  // MINI-BOSSES: Ataque Poderoso (20% de chance)
  // ----------------------------------------
  if (inimigo.tipo === "miniboss" && rand(1, 100) <= 20) {
    const danoExtra = inimigo.atk * 0.5;
    // Arredonda o dano total para baixo, garantindo um número inteiro.
    const danoTotal = Math.floor(inimigo.atk + danoExtra);
    jogador.hp -= danoTotal;
    console.log(
      `\n💥 O mini-chefe ${inimigo.nome} usa um ataque poderoso e causa ${danoTotal} de dano!`
    );
    return true;
  }

  // ----------------------------------------
  // INIMIGOS COMUNS: Habilidades Variadas
  // ----------------------------------------
  if (inimigo.habilidade) {
    if (inimigo.habilidade === "roubo_e_fuga" && rand(1, 100) <= 100) {
      const ouroRoubado = rand(20, 50);
      if (jogador.ouro >= ouroRoubado) {
        jogador.ouro -= ouroRoubado;
        console.log(
          `\n💰 O Goblin Ladrão roubou ${ouroRoubado} de ouro e fugiu!`
        );
        return "fuga";
      }
      return true;
    } else if (inimigo.habilidade === "esquiva" && rand(1, 100) <= 150) {
      console.log(
        `\n💨 O Lobo das Sombras se moveu rapidamente e se esquivou do seu ataque!`
      );
      return "esquiva";
    } else if (inimigo.habilidade === "ataque_duplo" && rand(1, 100) <= 150) {
      console.log(`\n⚔️ O Bandido Veterano está preparando um ataque duplo!`);
      return "ataque_duplo";
    } else if (inimigo.habilidade === "envenenamento") {
      // dano normal
      const dano = calcularDanoInimigo(inimigo, jogador);
      jogador.hp = Math.max(0, jogador.hp - dano);
      console.log(`${inimigo.nome} atacou e causou ${dano} de dano.`);

      // chance de envenenar
      if (rand(1, 100) <= 20) {
        jogador.status.push({
          tipo: "envenenamento",
          duracao: rand(3, 5),
          dano: 5,
        });
        console.log(`🤢 ${inimigo.nome} envenenou você!`);
      }
    } else if (inimigo.habilidade === "invulneravel" && rand(1, 100) <= 150) {
      console.log(`\n👻 ${inimigo.nome} se tornou etéreo!`);
      inimigo.status.push({ tipo: "invulneravel", duracao: 1 });
    } else if (
      inimigo.habilidade === "petrificar" &&
      inimigo.hp < inimigo.hpMax * 0.3 &&
      rand(1, 100) <= 20
    ) {
      console.log(
        `\n🗿 A Gárgula de Pedra se petrificou, reduzindo o dano que recebe!`
      );
      return "petrificar";
    } else if (inimigo.habilidade === "teia" && rand(1, 100) <= 250) {
      console.log(
        `\n🕸️ Você foi pego em uma teia! Não pode agir no próximo turno.`
      );
      return "teia";
    } else if (
      inimigo.habilidade === "dano_extra" &&
      jogador.hp < jogador.hpMax * 0.5
    ) {
      console.log(
        `\n🔥 O Elemental de Fogo está mais forte com sua vida baixa!`
      );
      return "dano_extra";
    } else if (
      inimigo.habilidade === "bloquear_e_contra_atacar" &&
      rand(1, 100) <= 250
    ) {
      console.log(
        `\n🛡️ O Cavaleiro Amaldiçoado se preparou para bloquear e contra-atacar!`
      );
      return "bloquear_e_contra_atacar";
    } else if (inimigo.habilidade === "regeneracao") {
      return true;
    }
  }

  // ----------------------------------------
  // BOSSES: Habilidades Poderosas
  // ----------------------------------------
  if (inimigo.poder && rand(1, 100) <= 70) {
    console.log(
      `\n🔥 ${inimigo.nome} usa sua habilidade especial: ${inimigo.poder}!`
    );

    switch (inimigo.poder) {
      case "Necromancia":
        console.log("💀 Ossos se levantam da terra para te atacar!");
        const danoBaseNecro = inimigo.atk;
        const danoTotalNecro = Math.floor(danoBaseNecro + inimigo.atk * 0.1);
        jogador.hp -= danoTotalNecro;
        console.log(
          `Ossos esqueléticos te acertam, causando ${danoTotalNecro} de dano!`
        );
        break;

      case "Sopro Glaciar":
        const danoBaseGelo = inimigo.atk;
        const danoTotalGelo = Math.floor(danoBaseGelo + inimigo.atk * 0.1);
        jogador.hp -= danoTotalGelo;
        console.log(
          `❄️ O sopro gélido te atinge, causando ${danoTotalGelo} de dano!`
        );
        break;

      case "Erupção Infernal":
        const danoBaseFogo = inimigo.atk;
        const danoTotalFogo = Math.floor(danoBaseFogo + inimigo.atk * 0.1);
        jogador.hp -= danoTotalFogo;
        console.log(
          `🌋 Uma erupção de lava te queima, causando ${danoTotalFogo} de dano!`
        );
        break;

      case "Feitiços Antigos":
        const danoBaseArcano = inimigo.atk;
        const danoTotalArcano = Math.floor(danoBaseArcano + inimigo.atk * 0.1);
        jogador.hp -= danoTotalArcano;
        console.log(
          `✨ Um feitiço ancestral te drena, causando ${danoTotalArcano} de dano!`
        );
        break;

      case "Impacto Sísmico":
        const danoBaseTerremoto = inimigo.atk;
        const danoTotalTerremoto = Math.floor(
          danoBaseTerremoto + inimigo.atk * 0.1
        );
        jogador.hp -= danoTotalTerremoto;
        console.log(
          `💥 Um terremoto te acerta, causando ${danoTotalTerremoto} de dano!`
        );
        break;

      case "Praga da Corrupção":
        const danoBaseToxico = inimigo.atk;
        const danoTotalToxico = Math.floor(danoBaseToxico + inimigo.atk * 0.1);
        jogador.hp -= danoTotalToxico;
        console.log(
          `🤢 Uma nuvem tóxica te envolve, causando ${danoTotalToxico} de dano!`
        );
        break;

      case "Lâmina Etérea":
        const danoBaseIgnorar = inimigo.atk;
        const danoTotalIgnorar = Math.floor(
          danoBaseIgnorar + inimigo.atk * 0.1
        );
        jogador.hp -= danoTotalIgnorar;
        console.log(
          `🔪 Uma lâmina sombria te atravessa, causando ${danoTotalIgnorar} de dano!`
        );
        break;

      case "Martelo Incandescente":
        const danoBaseMartelo = inimigo.atk;
        const danoTotalMartelo = Math.floor(
          danoBaseMartelo + inimigo.atk * 0.1
        );
        jogador.hp -= danoTotalMartelo;
        console.log(
          `🔨 O martelo incandescente te esmaga, causando ${danoTotalMartelo} de dano!`
        );
        break;

      case "Ruptura Temporal":
        const danoBaseRuptura = inimigo.atk;
        const danoTotalRuptura = Math.floor(
          danoBaseRuptura + inimigo.atk * 0.1
        );
        jogador.hp -= danoTotalRuptura;
        console.log(
          `⏳ O tempo ao seu redor se distorce, causando ${danoTotalRuptura} de dano!`
        );
        break;

      case "Raízes Presas":
        const danoBaseRaizes = inimigo.atk;
        const danoTotalRaizes = Math.floor(danoBaseRaizes + inimigo.atk * 0.1);
        jogador.hp -= danoTotalRaizes;
        console.log(
          `🌳 Raízes afiadas saem do chão e te perfuram, causando ${danoTotalRaizes} de dano!`
        );
        break;

      default:
        console.log(`\n${inimigo.nome} se prepara para um ataque especial!`);
        break;
    }
    return true; // Habilidade foi usada
  }
  return false; // Nenhuma habilidade foi usad
}
