import { executarHabilidadeEspecial } from "./../../masmorra/habilidadesInimigos.js";
import { colors } from "./../../utilitarios.js";
import { processarSangramento } from "./funcionAuxiliares/sangramento.js";
import { ataqueEsqueletos } from "./funcionAuxiliares/esqueletos.js";
import { calcularDanoInimigo } from "./funcionAuxiliares/calcularDanoInimigo.js";
import { processarRegeneracao } from "./funcionAuxiliares/regen.js";

export function ataqueInimigo(inimigo, jogador, esqueletosInvocados) {
  if (inimigo.hp <= 0) return;

  // 1️⃣ Processa efeitos do inimigo
  processarSangramento(inimigo);
  if (inimigo.hp <= 0) return;

  processarRegeneracao(inimigo);

  // 2️⃣ Ataque dos esqueletos invocados
  esqueletosInvocados = ataqueEsqueletos(inimigo, esqueletosInvocados);
  if (inimigo.hp <= 0) return;

  // 3️⃣ Executar habilidade especial do inimigo
  const resultado = executarHabilidadeEspecial(inimigo, jogador);

  switch (resultado) {
    case "fuga":
      console.log(`${inimigo.nome} escapou da batalha!`);
      inimigo.hp = 0;
      return;

    case "esquiva":
      inimigo.status.push({ tipo: "esquiva", duracao: 1 });
      return;

    case "ataque_duplo": {
      // Calcula dano duas vezes corretamente
      const dano1 = calcularDanoInimigo(inimigo, jogador);
      const dano2 = calcularDanoInimigo(inimigo, jogador);
      const totalDano = dano1 + dano2;

      // Absorção por esqueletos
      if (esqueletosInvocados.length > 0 && totalDano > 0) {
        const esqueletoAlvo = esqueletosInvocados[0];
        esqueletoAlvo.hp -= totalDano;
        console.log(
          `${colors.blue}🛡 Um esqueleto absorveu ${totalDano} de dano!${colors.reset}`
        );
        if (esqueletoAlvo.hp <= 0) {
          console.log(
            `${colors.red}💔 Um esqueleto foi destruído!${colors.reset}`
          );
          esqueletosInvocados.shift();
        }
        return;
      }

      jogador.hp = Math.max(0, jogador.hp - totalDano);
      console.log(
        `⚔️ ${inimigo.nome} atacou duas vezes e causou ${colors.red}${totalDano}${colors.reset} de dano!`
      );
      return;
    }

    case "teia":
      jogador.status.push({ tipo: "paralisado", duracao: 1 });
      return;

    case "petrificar":
      inimigo.status.push({ tipo: "petrificado", duracao: 2 });
      return;

    case "dano_extra":
      inimigo.status.push({ tipo: "dano_extra", duracao: 3 });
      break; // Ainda vai atacar normalmente

    case "bloquear_e_contra_atacar":
      inimigo.status.push({ tipo: "contra_ataque", duracao: 1 });
      return;

    case true:
      // Habilidade já aplicou efeito direto (boss powers, envenenamento, regeneração)
      return;

    default:
      break;
  }

  // 4️⃣ Ataque normal do inimigo (se não foi impedido por habilidade especial)
  let danoInimigo = calcularDanoInimigo(inimigo, jogador);

  // 5️⃣ Absorção por esqueletos
  if (esqueletosInvocados.length > 0 && danoInimigo > 0) {
    const esqueletoAlvo = esqueletosInvocados[0];
    esqueletoAlvo.hp -= danoInimigo;
    console.log(
      `${colors.blue}🛡 Um esqueleto absorveu ${danoInimigo} de dano!${colors.reset}`
    );
    if (esqueletoAlvo.hp <= 0) {
      console.log(`${colors.red}💔 Um esqueleto foi destruído!${colors.reset}`);
      esqueletosInvocados.shift();
    }
    danoInimigo = 0;
  }

  // 6️⃣ Aplica dano final ao jogador
  jogador.hp = Math.max(0, jogador.hp - danoInimigo);

  console.log(
    danoInimigo > 0
      ? `${inimigo.nome} atacou e causou ${colors.red}${danoInimigo}${colors.reset} de dano.`
      : `${inimigo.nome} atacou, mas você não recebeu dano!`
  );
}
