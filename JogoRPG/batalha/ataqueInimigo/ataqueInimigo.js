import { executarHabilidadeEspecial } from "./../../masmorra/habilidadesInimigos.js";
import { colors } from "./../../utilitarios.js";
import { processarSangramento } from "./funcionAuxiliares/sangramento.js";
import { ataqueEsqueletos } from "./funcionAuxiliares/esqueletos.js";
import { calcularDanoInimigo } from "./funcionAuxiliares/calcularDanoInimigo.js";
import { processarRegeneracao } from "./funcionAuxiliares/regen.js";

export function ataqueInimigo(inimigo, jogador, esqueletosInvocados) {
  if (inimigo.hp <= 0) return;

  processarSangramento(inimigo);
  if (inimigo.hp <= 0) return;

  processarRegeneracao(inimigo);

  esqueletosInvocados = ataqueEsqueletos(inimigo, esqueletosInvocados);
  if (inimigo.hp <= 0) return;

  const resultado = executarHabilidadeEspecial(inimigo, jogador);

  // --- Processa habilidades dos inimigos comuns ---
  switch (resultado) {
    case "fuga":
      console.log(`${inimigo.nome} escapou da batalha!`);
      inimigo.hp = 0; // força fim da luta
      return;

    case "esquiva":
      inimigo.status.push({ tipo: "esquiva", duracao: 1 });
      return;

    case "ataque_duplo": {
      const dano1 = calcularDanoInimigo(inimigo, jogador);
      const dano2 = calcularDanoInimigo(inimigo, jogador);
      jogador.hp = Math.max(0, jogador.hp - (dano1 + dano2));
      console.log(
        `⚔️ ${inimigo.nome} atacou duas vezes e causou ${colors.red}${
          dano1 + dano2
        }${colors.reset} de dano!`
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
      break; // ainda vai atacar normalmente, só com buff

    case "bloquear_e_contra_atacar":
      inimigo.status.push({ tipo: "contra_ataque", duracao: 1 });
      return;

    case true:
      // já aplicou efeito direto (ex: regeneração, veneno, boss powers)
      return;

    default:
      break;
  }

  // --- Ataque normal se não usou nenhuma habilidade especial ---
  let danoInimigo = calcularDanoInimigo(inimigo, jogador);

  // Absorção por esqueleto
  if (esqueletosInvocados.length > 0 && danoInimigo > 0) {
    const esqueletoAlvo = esqueletosInvocados[0];
    esqueletoAlvo.hp -= danoInimigo;
    console.log(
      `${colors.blue}🛡 Um esqueleto absorveu ${danoInimigo} de dano!${colors.reset}`
    );
    if (esqueletoAlvo.hp <= 0)
      console.log(`${colors.red}💔 Um esqueleto foi destruído!${colors.reset}`);
    danoInimigo = 0;
  }

  jogador.hp = Math.max(0, jogador.hp - danoInimigo);

  console.log(
    danoInimigo > 0
      ? `${inimigo.nome} atacou e causou ${colors.red}${danoInimigo}${colors.reset} de dano.`
      : `${inimigo.nome} atacou, mas você não recebeu dano!`
  );
}
