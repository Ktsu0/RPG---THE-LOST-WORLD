import { rand } from "./../../utilitarios.js";

export function executarHabilidadeEspecial(inimigo, jogador) {
  // ----------------------------------------
  // LÓGICA PARA HABILIDADES DOS MINI-CHEFES
  // ----------------------------------------
  // Se for um mini-chefe, há uma chance de 20% de um ataque especial
  if (inimigo.tipo === "miniboss") {
    if (rand(1, 100) <= 20) {
      const danoExtra = inimigo.atk * 0.5;
      const danoTotal = inimigo.atk + danoExtra;
      jogador.hp -= danoTotal;
      console.log(
        `\n💥 O mini-chefe ${inimigo.nome} usa um ataque poderoso e causa ${danoTotal} de dano!`
      );
      return true; // Habilidade foi usada
    }
    return false; // Não usou habilidade
  }

  // ----------------------------------------
  // LÓGICA PARA HABILIDADES DOS CHEFES (BOSSES)
  // ----------------------------------------
  // Verifica se o inimigo tem a propriedade 'poder'
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
        jogador.stunned = true; // Exemplo de um status effect
        break;

      case "Sopro Glaciar":
        const danoGelo = rand(8, 15);
        jogador.hp -= danoGelo;
        console.log(
          `❄️ O sopro gélido te atinge, causando ${danoGelo} de dano!`
        );
        // Adicione aqui uma lógica para lentidão se o seu jogo tiver
        break;

      case "Erupção Infernal":
        const danoFogo = rand(15, 25);
        jogador.hp -= danoFogo;
        console.log(
          `🌋 Uma erupção de lava te queima, causando ${danoFogo} de dano!`
        );
        break;

      case "Feitiços Antigos":
        const danoArcano = rand(10, 20);
        jogador.hp -= danoArcano;
        console.log(
          `✨ Um feitiço ancestral te drena, causando ${danoArcano} de dano!`
        );
        break;

      case "Impacto Sísmico":
        const danoTerremoto = rand(12, 20);
        jogador.hp -= danoTerremoto;
        console.log(
          `💥 Um terremoto te acerta, causando ${danoTerremoto} de dano!`
        );
        break;

      case "Praga da Corrupção":
        console.log("🤢 Uma nuvem tóxica te envolve, envenenando você!");
        // Exemplo de dano de tempo: adicione um efeito de veneno ao jogador
        break;

      case "Lâmina Etérea":
        const danoIgnorar = inimigo.atk * 1.5;
        jogador.hp -= danoIgnorar;
        console.log(
          `🔪 Uma lâmina sombria te atravessa, ignorando sua armadura e causando ${danoIgnorar} de dano!`
        );
        break;

      case "Martelo Incandescente":
        const danoMartelo = inimigo.atk * 2;
        jogador.hp -= danoMartelo;
        console.log(
          `🔨 O martelo incandescente te esmaga, causando ${danoMartelo} de dano!`
        );
        break;

      case "Ruptura Temporal":
        console.log("⏳ O tempo ao seu redor se distorce e você fica preso!");
        // Lógica para pular o próximo turno do jogador
        break;

      default:
        console.log(`\n${inimigo.nome} se prepara para um ataque especial!`);
        break;
    }
    return true; // Habilidade foi usada
  }
  return false; // Não usou habilidade
}
