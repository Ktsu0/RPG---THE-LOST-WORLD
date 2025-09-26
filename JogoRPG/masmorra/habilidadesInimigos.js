import { rand, colors } from "./../utilitarios.js";
import { calcularDanoInimigo } from "../batalha/ataqueInimigo/funcionAuxiliares/calcularDanoInimigo.js";

export function executarHabilidadeEspecial(inimigo, jogador) {
  // Função auxiliar para ataques de boss
  const ataqueBoss = (nome, multiplicador = 0.1) => {
    const danoTotal = Math.floor(inimigo.atk * (1 + multiplicador));
    jogador.hp -= danoTotal;
    console.log(`${nome} causa ${danoTotal} de dano ao jogador!`);
  };

  // ------------------------
  // MINI-BOSSES
  // ------------------------
  if (inimigo.tipo === "miniboss" && rand(1, 100) <= 20) {
    ataqueBoss(`💥 Mini-chefe ${inimigo.nome} usa Ataque Poderoso`, 0.5);
    return { usado: true };
  }

  // ------------------------
  // INIMIGOS COMUNS
  // ------------------------
  if (inimigo.habilidade) {
    switch (inimigo.habilidade) {
      case "roubo_e_fuga":
        if (rand(1, 100) <= 100) {
          if (jogador.ouro > 0) {
            const valor = Math.min(jogador.ouro, rand(20, 50));
            jogador.ouro -= valor;
            console.log(`💰 ${inimigo.nome} roubou ${valor} de ouro e fugiu!`);
            return { usado: "fuga" };
          } else {
            console.log(
              `💰 ${inimigo.nome} tentou roubar, mas você não tinha ouro!`
            );
          }
        }
        return { usado: true };

      case "esquiva":
        if (rand(1, 100) <= 15) {
          console.log(`💨 ${inimigo.nome} se esquivou do seu ataque!`);
          return { usado: "esquiva" };
        }
        break;

      case "ataque_duplo":
        if (rand(1, 100) <= 15) {
          console.log(`⚔️ ${inimigo.nome} prepara ataque duplo!`);
          return { usado: "ataque_duplo" };
        }
        break;

      case "envenenamento":
        if (rand(1, 100) <= 20) {
          jogador.status.push({
            tipo: "envenenamento",
            duracao: rand(3, 5),
            dano: 5,
          });
          console.log(`🤢 ${inimigo.nome} envenenou você!`);
          return { usado: true };
        }
        break;

      case "invulneravel":
        if (rand(1, 100) <= 15) {
          inimigo.status.push({ tipo: "invulneravel", duracao: 1 });
          console.log(`👻 ${inimigo.nome} se tornou etéreo!`);
          return { usado: true };
        }
        break;

      case "petrificar":
        if (inimigo.hp < inimigo.hpMax * 0.3 && rand(1, 100) <= 20) {
          console.log(`🗿 ${inimigo.nome} se petrificou!`);
          return { usado: "petrificar" };
        }
        break;

      case "teia":
        if (rand(1, 100) <= 25) {
          console.log(`🕸️ Você foi pego em uma teia!`);
          return { usado: "teia" };
        }
        break;

      case "dano_extra":
        if (
          jogador.hp < jogador.hpMax * 0.5 &&
          !inimigo.status.some((s) => s.tipo === "dano_extra")
        ) {
          console.log(`🔥 ${inimigo.nome} está mais forte com sua vida baixa!`);
          inimigo.status.push({ tipo: "dano_extra", duracao: 3 });
          return { usado: true };
        }
        break;

      case "bloquear_e_contra_atacar":
        if (rand(1, 100) <= 25) {
          console.log(`🛡️ ${inimigo.nome} se prepara para contra-atacar!`);
          inimigo.status.push({ tipo: "contra_ataque", duracao: 1 });
          return { usado: true };
        }
        break;

      case "regeneracao":
        const hpRegen = Math.floor(inimigo.hpMax * 0.05);
        inimigo.hp = Math.min(inimigo.hp + hpRegen, inimigo.hpMax);
        console.log(`💚 ${inimigo.nome} regenerou ${hpRegen} HP!`);
        return { usado: true };
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
    return { usado: true };
  }

  return { usado: false }; // Nenhuma habilidade usada
}
