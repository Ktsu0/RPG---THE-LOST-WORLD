import { rand, colors } from "./../utilitarios.js";

export function executarHabilidadeEspecial(inimigo, jogador) {
  // Função auxiliar para ataques de boss
  const ataqueBoss = (nome, multiplicador = 0.1) => {
    // Nota: Essa função não aplica o dano no HP do jogador no código original,
    // apenas no console.log, mas ela funciona como você a desenhou.
    const danoTotal = Math.floor(inimigo.atk * (1 + multiplicador));
    jogador.hp = Math.max(0, jogador.hp - danoTotal); // Aplicando o dano de fato
    console.log(
      `${colors.red}💥 ${nome} causa ${danoTotal} de dano ao jogador!${colors.reset}`
    );
  };

  // ------------------------
  // MINI-BOSSES (Chance fixa)
  // ------------------------
  if (inimigo.tipo === "miniboss" && rand(1, 100) <= 20) {
    ataqueBoss(`Mini-chefe ${inimigo.nome} usa Ataque Poderoso`, 0.5);
    return true; // Habilidade usada e já aplicou o dano
  }

  // ------------------------
  // INIMIGOS COMUNS
  // ------------------------
  if (inimigo.habilidade) {
    switch (inimigo.habilidade) {
      case "ataque_duplo":
        if (rand(1, 100) <= 15) {
          return "ataque_duplo";
        }
        break;
      case "invulneravel":
        if (rand(1, 100) <= 15) {
          inimigo.status.push({ tipo: "invulneravel", duracao: 1 });
          console.log(`👻 ${inimigo.nome} se dissolveu nas sombras!`);
          return true;
        }
        break;
      case "teia":
        if (rand(1, 100) <= 50) {
          const duracaoTeia = rand(1, 10) <= 9 ? 2 : 3;
          let duraTeia = duracaoTeia - 1;
          // 2. Aplica o status de paralisia ao jogador
          jogador.status.push({
            tipo: "paralisado",
            duracao: duracaoTeia,
          });

          console.log(
            `\n🕸️ ${inimigo.nome} disparou uma teia! Você está imobilizado por ${duraTeia} turno(s)!`
          );
          return true;
        }
        break; // Se a chance falhar, o inimigo segue para o ataque normal
      case "dano_extra":
        if (
          inimigo.hp < inimigo.hpMax * 0.35 &&
          !inimigo.status.some((s) => s.tipo === "dano_extra")
        ) {
          console.log(`🔥 ${inimigo.nome} está mais forte com sua vida baixa!`);
          inimigo.status.push({ tipo: "dano_extra", duracao: 3 });

          break;
        }
        break;
    }

    // Se o inimigo comum tem uma habilidade, mas a chance falhou, não vamos para o Boss
    if (inimigo.habilidade) {
      return false;
    }
  }

  // ------------------------
  // BOSSES
  // ------------------------
  if (inimigo.poder && rand(1, 100) <= 70) {
    console.log(
      `🔥 ${inimigo.nome} usa sua habilidade especial: ${inimigo.poder}!`
    );
    switch (inimigo.poder) {
      // Todos esses casos chamam ataqueBoss, que aplica dano no jogador.
      case "Necromancia":
        ataqueBoss("💀 Ossos esqueléticos se levantam");
        break;
      case "Sopro Glaciar":
        ataqueBoss("❄️ Sopro gélido");
        break;
      case "Erupção Infernal":
        ataqueBoss("🌋 Erupção de lava");
        break;
      case "Feitiços Antigos":
        ataqueBoss("✨ Feitiço ancestral");
        break;
      case "Impacto Sísmico":
        ataqueBoss("💥 Impacto sísmico");
        break;
      case "Praga da Corrupção":
        ataqueBoss("🤢 Nuvem tóxica");
        break;
      case "Lâmina Etérea":
        ataqueBoss("🔪 Lâmina sombria");
        break;
      case "Martelo Incandescente":
        ataqueBoss("🔨 Martelo incandescente");
        break;
      case "Ruptura Temporal":
        ataqueBoss("⏳ Ruptura temporal");
        break;
      case "Raízes Presas":
        ataqueBoss("🌳 Raízes afiadas");
        break;
      default:
        console.log(`${inimigo.nome} se prepara para um ataque especial!`);
        break;
    }
    return true; // Retorna true para pular o ataque normal, pois Boss já atacou
  }

  return false; // Nenhuma habilidade usada, deve prosseguir com o ataque normal
}
